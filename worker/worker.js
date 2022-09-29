require('dotenv').config({ path: './worker/.env' });
const { queryApi } = require('./util/influxdb');
const bucketData = process.env.INFLUX_BUCKET_DATA;
const bucketApp = process.env.INFLUX_BUCKET_APP;
const redis = require('./util/redis');
const { mongoConnect, mongoDisconnect } = require('./util/mongodb');
const { alerts } = require('./util/mongodb_model');
const { sendEmail, sendDiscord } = require('./util/notify');
const axios = require('axios');

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
                    const value = await getData(settings);
                    console.log(value, +settings.threshold);
                    if (value >= +settings.threshold && settings.status === 'off') {
                        await changeStatus(alertId, 'on');
                        await sendAlert(settings, 'alert');
                    } else if (value <= +settings.threshold && settings.status === 'on') {
                        await changeStatus(alertId, 'off');
                        await sendAlert(settings, 'ok');
                    } else {
                        console.log('pass');
                    }
                }
            } else {
                if (await redis.zadd('alert', 'CH', newTime.toString(), alertId)) {
                    console.log('run job 1 now');
                    const value = await getData(settings);
                    console.log(value, +settings.threshold);
                    if (value >= +settings.threshold && settings.status === 'off') {
                        await changeStatus(alertId, 'on');
                        await sendAlert(settings, 'alert');
                    } else if (value <= +settings.threshold && settings.status === 'on') {
                        await changeStatus(alertId, 'off');
                        await sendAlert(settings, 'ok');
                    } else {
                        console.log('pass');
                    }
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
            } else if (data.checkType === 'deadtime') {
                console.log('deadtime');
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
const sendAlert = async (data, text) => {
    console.log('send alert here');
    // const message = 'test';
    let message = `${data.host[0]} ${data.measurement[0]} is ${data.thresholdType} ${data.threshold}`;
    if (text === 'ok') {
        message = `${data.host[0]} ${data.measurement[0]} is ok right now`;
    }
    console.log(message);
    // const msg = { id: 1, name: 'datacat', content: message };
    // redis.publish('mychannel', JSON.stringify(msg));
    // const sendUrl = 'http://localhost:3000/streaming';
    // try {
    //     const send = await axios.get(sendUrl, { params: { data: message } });
    // } catch (e) {
    //     console.log(e);
    // }
    const id = id;
    const token = token;

    sendDiscord(id, token, message);
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