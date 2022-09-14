require('dotenv').config();
const { dashboards, roles } = require('./mongodb_model');
const { queryApi } = require('../../util/influxdb');
const systemBucket = process.env.INFLUX_BUCKET_SYSTEM;
const containerBucket = process.env.INFLUX_BUCKET_CONTAINER;
const getHost = async (layer) => {
    //get host name from last 10 minutes
    return new Promise((resolve) => {
        let bucket;
        if (layer === 'system') {
            bucket = systemBucket;
        } else if (layer === 'container') {
            bucket = containerBucket;
        }
        try {
            let data = [];
            const query = `from(bucket: "${bucket}")
                          |> range(start: -10m)
                          |> keyValues(keyColumns: ["host"])
                          |> group()`;
            queryApi.queryRows(query, {
                next(row, tableMeta) {
                    const o = tableMeta.toObject(row);
                    if (!data.includes(o._value)) {
                        data.push(o._value);
                    }
                },
                error(error) {
                    console.error(error);
                    console.log('Finished ERROR');
                    reject(error);
                },
                complete() {
                    console.log('Finished SUCCESS');
                    resolve(data);
                },
            });
        } catch (e) {
            console.log(e.message);
            reject(e);
        }
    });
};
const getContainer = async () => {
    return new Promise((resolve) => {
        try {
            const query = `import "influxdata/influxdb/v1"
                          v1.tagValues(
                            bucket: "dataCat_Container",  
                            tag: "container_name"
                          )`;
            let data = [];
            queryApi.queryRows(query, {
                next(row, tableMeta) {
                    const o = tableMeta.toObject(row);
                    data.push(o._value);
                },
                error(error) {
                    console.error(error);
                    console.log('Finished ERROR');
                    reject(error);
                },
                complete() {
                    console.log(data);
                    console.log('Finished SUCCESS');
                    resolve(data);
                },
            });
        } catch (e) {
            console.log(e.message);
            reject(e);
        }
    });
};
const getChart = async (data) => {
    return new Promise((resolve) => {
        try {
            console.log('data', data);
            let bucket;
            if (data.layer === 'system') {
                bucket = systemBucket;
            } else if (data.layer === 'container') {
                bucket = containerBucket;
            }
            let cpuFilter = '';
            if (data.measurement[0] === 'cpu') {
                cpuFilter = `|> filter(fn: (r) => r["cpu"] == "cpu-total")`;
            }
            const chartData = [];
            let query;
            query = `from(bucket: "${bucket}")
                      |> range(start: ${data.timeRange})
                      |> window(every: ${data.timeInterval})
                      |> ${data.aggregate}()
                      |> duplicate(column: "_stop", as: "_time")
                      |> window(every: inf)
                      |> filter(fn: (r) => r["host"] == "${data.host[0]}")
                      |> filter(fn: (r) => r["_measurement"] == "${data.measurement[0]}")
                      |> filter(fn: (r) => r["_field"] == "${data.field[0]}")
                      ${cpuFilter}                          
                      |> yield(name: "mean")`;

            queryApi.queryRows(query, {
                next(row, tableMeta) {
                    const o = tableMeta.toObject(row);
                    chartData.push(o);
                },
                error(error) {
                    console.error(error);
                    console.log('Finished ERROR');
                    reject(error);
                },
                complete() {
                    console.log('Finished SUCCESS');
                    resolve(chartData);
                },
            });
        } catch (e) {
            console.log(e.message);
            reject(e);
        }
    });
};
const saveChart = async (data) => {
    try {
        const query = await dashboards.findOneAndUpdate(
            { 'dashboards._id': data.dashboardId },
            {
                $push: {
                    'dashboards.$.charts': {
                        title: data.title,
                        layer: data.layer,
                        type: data.type,
                        host: data.host,
                        measurement: data.measurement,
                        field: data.field,
                        timeRange: data.timeRange,
                        interval: data.interval,
                        aggregate: data.aggregate,
                    },
                },
            }
        );
        return 'save success';
    } catch (e) {
        console.log(e.message);
        return e;
    }
};
module.exports = {
    getHost,
    getContainer,
    getChart,
    saveChart,
};