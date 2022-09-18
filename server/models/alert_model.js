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

module.exports = {
    getAlertList,
};
