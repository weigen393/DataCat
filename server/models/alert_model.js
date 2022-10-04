require('dotenv').config();
const { alerts, dashboards, roles } = require('./mongodb_model');
const { queryApi } = require('../../util/influxdb');
// const redis = require('../../util/redis');
const Redis = require('ioredis');
const { REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASSWORD } = process.env;
const redis = new Redis({
    port: REDIS_PORT,
    host: REDIS_HOST,
    username: REDIS_USER,
    password: REDIS_PASSWORD,
});

const getAlertList = async (id) => {
    try {
        const query = await alerts.find({ userId: id }, 'alerts');
        if (!query[0]) {
            return '';
        }
        return query[0].alerts;
    } catch (e) {
        console.log(e.message);
        return e;
    }
};

const saveAlert = async (userId, data) => {
    try {
        let query;
        console.log('d', userId, data);
        if (!data.alertId) {
            query = await alerts.findOneAndUpdate(
                { userId: userId },
                {
                    $push: {
                        alerts: {
                            title: data.title,
                            description: data.description,
                            layer: data.layer,
                            host: data.host,
                            container: data.container,
                            measurement: data.measurement,
                            field: data.field,
                            info: data.info,
                            timeRange: data.timeRange,
                            interval: data.interval,
                            aggregate: data.aggregate,
                            schedule: data.schedule,
                            checkType: data.checkType,
                            thresholdType: data.thresholdType,
                            threshold: data.threshold,
                            deadTime: data.deadTime,
                            status: 'off',
                            // count: 0,
                        },
                    },
                },
                {
                    returnDocument: 'after',
                }
            );
        } else {
            query = await alerts.findOneAndUpdate(
                { 'alerts._id': data.alertId },
                {
                    'alerts.$.title': data.title,
                    'alerts.$.description': data.description,
                    'alerts.$.layer': data.layer,
                    'alerts.$.host': data.host,
                    'alerts.$.container': data.container,
                    'alerts.$.measurement': data.measurement,
                    'alerts.$.field': data.field,
                    'alerts.$.info': data.info,
                    'alerts.$.timeRange': data.timeRange,
                    'alerts.$.interval': data.interval,
                    'alerts.$.aggregate': data.aggregate,
                    'alerts.$.schedule': data.schedule,
                    'alerts.$.checkType': data.checkType,
                    'alerts.$.thresholdType': data.thresholdType,
                    'alerts.$.threshold': data.threshold,
                    'alerts.$.deadTime': data.deadTime,
                    'alerts.$.status': 'off',
                    // 'alerts.$.count': 0,
                }
            );
        }
        if (data.alertId === undefined) {
            console.log('q', query);
            // const id = query.alerts.pop()._id.valueOf();
            const id = query.alerts.pop()._id.valueOf();
            return { alertId: id, schedule: data.schedule };
        } else {
            return { alertId: data.alertId, schedule: data.schedule };
        }
    } catch (e) {
        console.log(e.message);
    }
};
const delAlert = async (userId, data) => {
    try {
        const query = await alerts.updateOne(
            {
                userId: userId,
            },
            { $pull: { alerts: { _id: data.alertId } } }
        );
        await delRedisAlert(data.alertId);
        return console.log('delete success');
    } catch (e) {
        console.log(e.message);
        return e;
    }
};
const delRedisAlert = async (alertId) => {
    try {
        redis.zrem('alert', alertId);
    } catch (e) {
        console.log(e);
        return e;
    }
};
const setAlert = async (userId, data) => {
    try {
        if (redis.status === 'ready') {
            console.log(Date.now());
            console.log(data.schedule);
            const timestamp = Date.now() + 1000 * +data.schedule;
            console.log(timestamp);
            await redis.zadd('alert', timestamp.toString(), data.alertId, (err) => {
                if (err) {
                    console.log(err);
                }
                console.log('write redis');
            });
        } else {
            console.log('redis connection failed');
        }

        return console.log('set success');
    } catch (e) {
        console.log(e.message);
        return e;
    }
};
const getAlertSettings = async (userId, data) => {
    try {
        console.log(data.alertId);
        const query = await alerts.find(
            {
                'alerts._id': data.alertId,
            },
            {
                alerts: { $elemMatch: { _id: data.alertId } },
            }
        );
        console.log(query);
        return query[0].alerts[0];
    } catch (e) {
        console.log(e);
        return e;
    }
};
module.exports = {
    getAlertList,
    saveAlert,
    delAlert,
    setAlert,
    getAlertSettings,
};
