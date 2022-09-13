require('dotenv').config();
const { dashboards, roles } = require('./mongodb_model');
const { queryApi } = require('../../util/influxdb');
const bucket = process.env.INFLUX_BUCKET;

const getHost = async (layer, type) => {
    return new Promise((resolve) => {
        try {
            console.log(layer, type);
            let data = [];
            const query = `from(bucket: "${bucket}")
                          |> range(start: -30s)
                          |> keyValues(keyColumns: ["host"])
                          |> group()`;
            queryApi.queryRows(query, {
                next(row, tableMeta) {
                    const o = tableMeta.toObject(row);
                    data.push(o);
                },
                error(error) {
                    console.error(error);
                    console.log('Finished ERROR');
                    reject(error);
                },
                complete() {
                    console.log(data[0]._value);
                    console.log('Finished SUCCESS');
                    resolve([data[0]._value]);
                },
            });
        } catch (e) {
            console.log(e.message);
            reject(e);
        }
    });
};
const getContainer = async (layer, type) => {
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
            const chartData = [];
            let query;
            if (data.measurement[0] === 'cpu') {
                query = `from(bucket: "${bucket}")
                        |> range(start: ${data.timeRange})
                        |> window(every: ${data.timeInterval})
                        |> mean()
                        |> duplicate(column: "_stop", as: "_time")
                        |> window(every: inf)
                        |> filter(fn: (r) => r["host"] == "${data.host[0]}")
                        |> filter(fn: (r) => r["_measurement"] == "${data.measurement[0]}")
                        |> filter(fn: (r) => r["_field"] == "usage_system")
                        |> filter(fn: (r) => r["cpu"] == "cpu-total")  
                        |> yield(name: "mean")`;
            } else {
                query = `from(bucket: "${bucket}")
                        |> range(start: ${data.timeRange})
                        |> window(every: ${data.timeInterval})
                        |> mean()
                        |> duplicate(column: "_stop", as: "_time")
                        |> window(every: inf)
                        |> filter(fn: (r) => r["host"] == "${data.host[0]}")
                        |> filter(fn: (r) => r["_measurement"] == "${data.measurement[0]}")
                        |> filter(fn: (r) => r["_field"] == "${data.field[0]}")
                        |> yield(name: "mean")`;
            }

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
