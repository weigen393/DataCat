require('dotenv').config();
const { alerts, dashboards, roles } = require('./mongodb_model');
const { queryApi } = require('../../util/influxdb');

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
        if (data.chartId === undefined) {
            query = await alerts.findOneAndUpdate(
                { 'dashboards._id': data.dashboardId },
                {
                    $push: {
                        'dashboards.$.charts': {
                            title: data.title,
                            layer: data.layer,
                            type: data.type,
                            host: data.host,
                            container: data.container,
                            measurement: data.measurement,
                            field: data.field,
                            info: data.info,
                            timeRange: data.timeRange,
                            interval: data.interval,
                            aggregate: data.aggregate,
                        },
                    },
                }
            );
        } else {
            query = await dashboards.findById('631ac29e8fcde150bcb8415d', function (e, dataset) {
                if (e) console.log(e);
                let part = dataset.dashboards.id(data.dashboardId).charts.id(data.chartId);
                part.title = data.title;
                part.layer = data.layer;
                part.type = data.type;
                part.host = data.host;
                part.container = data.container;
                part.measurement = data.measurement;
                part.field = data.field;
                part.info = data.info;
                part.timeRange = data.timeRange;
                part.interval = data.interval;
                part.aggregate = data.aggregate;
                dataset.save();
            });
        }
        return 'save success';
    } catch (e) {}
};

module.exports = {
    getAlertList,
    saveAlert,
};
