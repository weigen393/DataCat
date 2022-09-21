require('dotenv').config();
const { alerts, dashboards, roles } = require('./mongodb_model');
const { queryApi } = require('../../util/influxdb');
const redis = require('../../util/redis');

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
        console.log('d', data);
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
                            interval: data.interval,
                            aggregate: data.aggregate,
                            schedule: data.schedule,
                            checkType: data.checkType,
                            thresholdType: data.thresholdType,
                            threshold: data.threshold,
                            deadTime: data.deadTime,
                        },
                    },
                },
                {
                    returnDocument: 'after',
                }
            );
        } else {
            query = await alerts.findOne({ 'alerts._id': data.alertId }, function (e, dataset) {
                if (e) console.log(e);
                let part = dataset.alerts.id(data.alertId);
                part.title = data.title;
                part.description = data.description;
                part.layer = data.layer;
                part.host = data.host;
                part.container = data.container;
                part.measurement = data.measurement;
                part.field = data.field;
                part.info = data.info;
                part.interval = data.interval;
                part.aggregate = data.aggregate;
                part.schedule = data.schedule;
                part.checkType = data.checkType;
                part.thresholdType = data.thresholdType;
                part.threshold = data.threshold;
                part.deadTime = data.deadTime;
                dataset.save();
            });
        }
        if (data.alertId === undefined) {
            console.log(query);
            const id = query.alerts.pop()._id.valueOf();

            return { alertId: id, schedule: data.schedule };
        } else {
            return { alertId: data.alertId, schedule: data.schedule };
        }
    } catch (e) {
        console.log(e.message);
        return e;
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
        return console.log('delete success');
    } catch (e) {
        console.log(e.message);
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
module.exports = {
    getAlertList,
    saveAlert,
    delAlert,
    setAlert,
};
