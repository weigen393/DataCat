require('dotenv').config({ path: './worker/.env' });
const { queryApi } = require('./util/influxdb');
const bucketData = process.env.INFLUX_BUCKET_DATA;
const bucketApp = process.env.INFLUX_BUCKET_APP;
const redis = require('./util/redis');
const { mongoConnect, mongoDisconnect } = require('./util/mongodb');
const { alerts, notifies } = require('./util/mongodb_model');
const { sendEmail, sendDiscord } = require('./util/notify');
const axios = require('axios');
const setCount = 2;
async function checkAlert() {
    mongoConnect();
    while (true) {
        const [alertId, timestamp] = await redis.zrange('alert', 0, 0, 'WITHSCORES');
        const nowTime = Date.now();
        console.log(nowTime);
        console.log(alertId);
        console.log(timestamp);
        if (parseInt(timestamp) < nowTime) {
            const set = await getSettings(alertId);
            const settings = set.alerts[0];
            const userId = set.userId;
            console.log(settings);
            let newTime = +timestamp + +settings.schedule * 1000;
            console.log('new', newTime);
            if (nowTime - +timestamp > 10 * 1000) {
                newTime = nowTime + +settings.schedule * 1000;
                console.log('new', newTime);
                if (await redis.zadd('alert', 'CH', newTime.toString(), alertId)) {
                    const value = await getData(settings);
                    console.log(value, +settings.threshold);
                    if (settings.checkType === 'threshold') {
                        await thresholdCheck(value, settings, alertId, userId);
                    } else if (settings.checkType === 'alive') {
                        await aliveCheck(value, settings, alertId, userId);
                    }
                }
            } else {
                if (await redis.zadd('alert', 'CH', newTime.toString(), alertId)) {
                    const value = await getData(settings);
                    console.log(value, +settings.threshold);
                    if (settings.checkType === 'threshold') {
                        await thresholdCheck(value, settings, alertId, userId);
                    } else if (settings.checkType === 'alive') {
                        await aliveCheck(value, settings, alertId, userId);
                    }
                }
            }
        } else {
            if (+timestamp - nowTime < 10 * 1000) {
                console.log(+timestamp - nowTime);
                await delay(+timestamp - nowTime);
            } else {
                console.log(+timestamp - nowTime);
                await delay(10 * 1000);
            }
        }
    }
}
const thresholdCheck = async (value, settings, alertId, userId) => {
    if (settings.thresholdType === 'above') {
        // if (value >= +settings.threshold){
        //     const getCount = await addCount(alertId,1);
        //     if(settings.status === 'off' && getCount>=setCount){
        //         await addCount(alertId,-setCount);
        //         await changeStatus(alertId, 'on');
        //         await sendAlert(settings, 'threshold', userId);
        //     }
        // } else if (value <= +settings.threshold) && settings.status === 'on') {
        //     await changeStatus(alertId, 'off');
        //     await sendAlert(settings, 'ok', userId);
        // }
        if (value >= +settings.threshold && settings.status === 'off') {
            await changeStatus(alertId, 'on');
            await sendAlert(settings, 'threshold', userId);
        } else if (value <= +settings.threshold && settings.status === 'on') {
            await changeStatus(alertId, 'off');
            await sendAlert(settings, 'ok', userId);
        }
    } else if (settings.thresholdType === 'below') {
        if (value <= +settings.threshold && settings.status === 'off') {
            await changeStatus(alertId, 'on');
            await sendAlert(settings, 'threshold', userId);
        } else if (value >= +settings.threshold && settings.status === 'on') {
            await changeStatus(alertId, 'off');
            await sendAlert(settings, 'ok', userId);
        }
    }
};
const aliveCheck = async (value, settings, alertId, userId) => {
    console.log('here', value);
    if (value === 0 && settings.status === 'off') {
        await changeStatus(alertId, 'on');
        await sendAlert(settings, 'alive', userId);
    } else if (value === 0 && settings.status === 'on') {
        await changeStatus(alertId, 'off');
        await sendAlert(settings, 'ok', userId);
    }
};
checkAlert();
// mongoDisconnect();
const getData = async (data) => {
    return new Promise((resolve) => {
        try {
            console.log('data', data);
            let cpuFilter = '';
            if (data.measurement[0] === 'cpu') {
                cpuFilter = `|> filter(fn: (r) => r["cpu"] == "cpu-total")`;
            }
            let containerFilter = '';
            if (data.layer === 'container') {
                containerFilter = `|> filter(fn: (r) => r["container_name"] == "${data.container[0]}")`;
            }
            let minmaxFilter = '';
            if (data.checkType === 'threshold') {
                if (data.thresholdType === 'above') {
                    minmaxFilter = '|> max()';
                } else if (data.thresholdType === 'below') {
                    minmaxFilter = '|> min()';
                }
            } else if (data.checkType === 'alive') {
                console.log('deadtime');
                data.schedule = +data.deadTime - 5;
            }
            const chartData = [];
            let query;
            if (data.layer === 'application') {
                if (data.measurement[0] === 'requestCount') {
                    query = `from(bucket: "${bucketApp}")
                      |> range(start: -${+data.schedule + 10}s)
                      |> filter(fn: (r) => r["host"] == "${data.host[0]}")                        
                      |> filter(fn: (r) => r["_field"] == "duration")
                      |> group(columns: ["_field"])
                      |> count()
                      `;
                } else if (data.measurement[0] === 'customize') {
                    query = `from(bucket: "${bucketApp}")
                      |> range(start: -${+data.schedule + 10}s)
                      |> filter(fn: (r) => r["host"] == "${data.host[0]}")                        
                      |> filter(fn: (r) => r["_field"] == "${data.field[0]}")
                      ${minmaxFilter}`;
                } else {
                    if (data.info[0] === 'duration') {
                        query = `from(bucket: "${bucketApp}")
                        |> range(start: -${+data.schedule + 10}s)                      
                        |> filter(fn: (r) => r["host"] == "${data.host[0]}")
                        |> filter(fn: (r) => r["${data.measurement[0]}"] == "${data.field[0]}")
                        |> filter(fn: (r) => r["_field"] == "${data.info[0]}") 
                        |> group(columns: ["_field"])                     
                        ${minmaxFilter}`;
                    } else if (data.info[0] === 'count') {
                        query = `from(bucket: "${bucketApp}")
                      |> range(start: -${+data.schedule + 10}s)
                      |> filter(fn: (r) => r["host"] == "${data.host[0]}")
                      |> filter(fn: (r) => r["${data.measurement[0]}"] == "${data.field[0]}")
                      |> filter(fn: (r) => r["_field"] == "duration")
                      |> group(columns: ["_field"])
                      ${minmaxFilter}`;
                    }
                }
            } else {
                query = `from(bucket: "${bucketData}")
                    |> range(start: -${+data.schedule + 10}s)                      
                    |> filter(fn: (r) => r["host"] == "${data.host[0]}")
                    ${containerFilter}
                    |> filter(fn: (r) => r["_measurement"] == "${data.measurement[0]}")
                    |> filter(fn: (r) => r["_field"] == "${data.field[0]}")
                    ${cpuFilter}
                    ${minmaxFilter}`;
            }

            console.log(query);
            queryApi.queryRows(query, {
                next(row, tableMeta) {
                    const o = tableMeta.toObject(row);
                    if (o._value === null) {
                        o._value = 0;
                    }
                    chartData.push(o);
                },
                error(error) {
                    console.error(error);
                    console.log('Finished ERROR');
                    reject(error);
                },
                complete() {
                    console.log('c', chartData);
                    if (chartData[0]?._value === undefined) {
                        console.log('Finished SUCCESS');
                        resolve(0);
                    } else {
                        console.log('Finished SUCCESS');
                        resolve(chartData[0]._value);
                    }
                },
            });
        } catch (e) {
            console.log(e.message);
        }
    });
};
const changeStatus = async (alertId, data) => {
    try {
        console.log('id', alertId);
        const query = await alerts.findOneAndUpdate(
            {
                'alerts._id': alertId,
            },
            {
                'alerts.$.status': data,
            }
        );
        console.log('change status');
        console.log(query);
        return 'success';
    } catch (e) {
        console.log(e);
        return e;
    }
};
const sendAlert = async (data, text, userId) => {
    console.log('send alert here');
    let message = '';
    if (text === 'threshold') {
        message = `${data.host[0]} ${data.measurement[0]} is ${data.thresholdType} ${data.threshold}`;
    }
    if (text === 'alive') {
        message = `${data.host[0]} ${data.measurement[0]} haven't response for ${data.deadTime} seconds`;
    }
    if (text === 'ok') {
        message = `${data.host[0]} ${data.measurement[0]} is ok right now`;
    }
    console.log(message);
    console.log('user', userId);
    const userNotify = await getNotifyList(userId.toString());

    for (let i = 0; i < userNotify.length; i++) {
        if (userNotify[i].sendType === 'email') {
            sendEmail(userNotify[i].email, message);
        } else if (userNotify[i].sendType === 'discord') {
            sendDiscord(userNotify[i].id, userNotify[i].token, message);
        }
    }
};
const getNotifyList = async (id) => {
    try {
        const query = await notifies.find({ userId: id }, 'notify');
        if (!query[0]) {
            return '';
        }
        return query[0].notify;
    } catch (e) {
        console.log(e.message);
        return e;
    }
};
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
                userId: 1,
                alerts: { $elemMatch: { _id: alertId } },
            }
        );
        console.log(query);
        return query[0];
    } catch (e) {
        console.log(e);
        return e;
    }
}
