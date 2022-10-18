require('dotenv').config({ path: './worker/.env' });
const redis = require('./util/redis');
const { mongoConnect } = require('./util/mongodb');
const { getSettings, getAlertData } = require('./util/worker_model');
const { checkTypeMap, changeStatus, sendAlert } = require('./util/alertGenerator');
const setCount = 2;
async function checkAlert() {
    mongoConnect();
    while (true) {
        const [alertId, timestamp] = await redis.zrange('alert', 0, 0, 'WITHSCORES');
        const nowTime = Date.now();
        if (parseInt(timestamp) < nowTime) {
            const set = await getSettings(alertId);
            const settings = set.alerts[0];
            const userId = set.userId;
            let newTime = +timestamp + +settings.schedule * 1000;
            if (nowTime - +timestamp > 10 * 1000) {
                newTime = nowTime + +settings.schedule * 1000;
            }
            if (await redis.zadd('alert', 'CH', newTime.toString(), alertId)) {
                const currentValue = await getAlertData(settings);
                const checkStatus = await checkTypeMap[settings.checkType](currentValue, settings, alertId, userId);
                if (checkStatus) {
                    console.log('send alert');
                    await changeStatus(alertId, checkStatus.changeStatusString);
                    await sendAlert(settings, checkStatus.sendAlertString, userId);
                }
            }
        } else {
            if (+timestamp - nowTime < 10 * 1000) {
                await delay(+timestamp - nowTime);
            } else {
                await delay(10 * 1000);
            }
        }
    }
}
function delay(n) {
    return new Promise(function (resolve) {
        // console.log('delay');
        setTimeout(resolve, n);
    });
}
checkAlert();
