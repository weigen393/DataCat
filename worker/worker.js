require('dotenv').config({ path: './worker/.env' });
const { queryApi } = require('./util/influxdb');
const redis = require('./util/redis');
const { mongoConnect, mongoDisconnect } = require('./util/mongodb');
const { alerts } = require('./util/mongodb_model');
let count = 0;
async function checkAlert() {
    mongoConnect();
    while (true) {
        const [alertId, timestamp] = await redis.zrange('alert', 0, 0, 'WITHSCORES');
        const nowTime = Date.now();
        console.log(nowTime);
        console.log(alertId);
        console.log(timestamp);
        if (parseInt(timestamp) < nowTime) {
            const settings = await getSettings(alertId);
            console.log(settings);
            let newTime = +timestamp + +settings.schedule * 1000;
            console.log('new', newTime);
            if (nowTime - +timestamp > 10 * 1000) {
                newTime = nowTime + +settings.schedule * 1000;
                console.log('new', newTime);
                if (await redis.zadd('alert', 'CH', newTime.toString(), alertId)) {
                    console.log('run job 1', alertId);
                }
            } else {
                if (await redis.zadd('alert', 'CH', newTime.toString(), alertId)) {
                    console.log('run job 2');
                }
            }
        } else {
            if (+timestamp - nowTime < 10 * 1000) {
                console.log(+timestamp - nowTime);
                await delay(+timestamp - nowTime);
                count += 1;
                console.log('c', count);
            } else {
                console.log(+timestamp - nowTime);
                await delay(10 * 1000);
                count += 1;
                console.log('c', count);
            }
        }
    }
}

checkAlert();
// mongoDisconnect();
function delay(n) {
    return new Promise(function (resolve) {
        console.log('here');
        setTimeout(resolve, n);
    });
}
async function getSettings(alertId) {
    try {
        const query = await alerts.find(
            {
                'alerts._id': alertId,
            },
            {
                alerts: { $elemMatch: { _id: alertId } },
            }
        );
        console.log(query);
        return query[0].alerts[0];
    } catch (e) {
        console.log(e);
        return e;
    }
}
