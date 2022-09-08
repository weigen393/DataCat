require('dotenv').config();

const { InfluxDB } = require('@influxdata/influxdb-client');
const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG;

var client = new InfluxDB({ url: process.env.INFLUX_URL, token: token });
var queryApi = client.getQueryApi(org);

module.exports = {
    queryApi,
};
