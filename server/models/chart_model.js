require('dotenv').config();
const mongoose = require('mongoose');
const { dashboards, roles } = require('./mongodb_model');
const { queryApi } = require('../../util/influxdb');
const bucket = process.env.INFLUX_BUCKET;
const getTime = '-12h'; //get host and container name from last 1 hr

const getHost = async (layer) => {
    return new Promise((resolve) => {
        try {
            let data = [];
            const query = `from(bucket: "${bucket}")
                          |> range(start: ${getTime})
                          |> keyValues(keyColumns: ["host"])
                          |> group()
                          |> distinct(column: "host")`;
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
const getContainer = async (host) => {
    return new Promise((resolve) => {
        try {
            const query = `from(bucket: "${bucket}")
                            |> range(start: ${getTime})
                            |> filter(fn: (r) => r["host"] == "${host.host}")
                            |> keyValues(keyColumns: ["${host.host}","host"])  
                            |> group()
                            |> distinct(column: "container_name")`;
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
                    console.log(data.shift());
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
            let cpuFilter = '';
            if (data.measurement[0] === 'cpu') {
                cpuFilter = `|> filter(fn: (r) => r["cpu"] == "cpu-total")`;
            }
            let containerFilter = '';
            if (data.layer === 'container') {
                containerFilter = `|> filter(fn: (r) => r["container_name"] == "${data.container[0]}")`;
            }
            const chartData = [];
            let query;
            if (data.layer === 'application') {
                if (data.measurement[0] === 'requestCount') {
                    query = `from(bucket: "${bucket}")
                        |> range(start: ${data.timeRange})
                        |> filter(fn: (r) => r["host"] == "${data.host[0]}")                        
                        |> filter(fn: (r) => r["_field"] == "duration")
                        |> group(columns: ["_field"])
                        |> count()
                        `;
                } else {
                    if (data.info[0] === 'duration') {
                        query = `from(bucket: "${bucket}")
                          |> range(start: ${data.timeRange})                      
                          |> filter(fn: (r) => r["host"] == "${data.host[0]}")
                          |> filter(fn: (r) => r["${data.measurement[0]}"] == "${data.field[0]}")
                          |> filter(fn: (r) => r["_field"] == "${data.info[0]}") 
                          |> group(columns: ["_field"])                     
                          |> aggregateWindow(every: ${data.timeInterval}, fn: ${data.aggregate}, createEmpty: true)
                          |> yield(name: "${data.aggregate}")`;
                    } else if (data.info[0] === 'count') {
                        query = `from(bucket: "${bucket}")
                        |> range(start: ${data.timeRange})
                        |> filter(fn: (r) => r["host"] == "${data.host[0]}")
                        |> filter(fn: (r) => r["${data.measurement[0]}"] == "${data.field[0]}")
                        |> filter(fn: (r) => r["_field"] == "duration")
                        |> group(columns: ["_field"])
                        |> aggregateWindow(every: ${data.timeInterval}, fn: count, createEmpty: true)
                        `;
                    } else if (data.info[0] === 'countSum') {
                        query = `from(bucket: "${bucket}")
                        |> range(start: ${data.timeRange})
                        |> filter(fn: (r) => r["host"] == "${data.host[0]}")
                        |> filter(fn: (r) => r["${data.measurement[0]}"] == "${data.field[0]}")
                        |> filter(fn: (r) => r["_field"] == "duration")
                        |> group(columns: ["_field"])
                        |> count()
                        `;
                    }
                }
            } else {
                query = `from(bucket: "${bucket}")
                      |> range(start: ${data.timeRange})                      
                      |> filter(fn: (r) => r["host"] == "${data.host[0]}")
                      ${containerFilter}
                      |> filter(fn: (r) => r["_measurement"] == "${data.measurement[0]}")
                      |> filter(fn: (r) => r["_field"] == "${data.field[0]}")
                      ${cpuFilter}
                      |> aggregateWindow(every: ${data.timeInterval}, fn: ${data.aggregate}, createEmpty: false)
                      |> yield(name: "${data.aggregate}")`;
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
        let query;
        if (data.chartId === undefined) {
            query = await dashboards.findOneAndUpdate(
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
const delChart = async (data) => {
    try {
        const query = await dashboards.findOneAndUpdate(
            { 'dashboards._id': data.dashboardId },
            {
                $pull: {
                    'dashboards.$.charts': {
                        _id: data.chartId,
                    },
                },
            }
        );
        return 'delete success';
    } catch (e) {
        console.log(e.message);
        return e;
    }
};
const getChartSettings = async (data) => {
    try {
        console.log(data);
        const chartId = mongoose.Types.ObjectId(data.chartId);
        const query = await dashboards.aggregate([
            {
                $match: { 'dashboards.charts._id': chartId },
            },
            {
                $project: {
                    dashboards: {
                        $filter: {
                            input: {
                                $map: {
                                    input: '$dashboards',
                                    as: 'dashboard',
                                    in: {
                                        charts: {
                                            $filter: {
                                                input: '$$dashboard.charts',
                                                as: 'chart',
                                                cond: {
                                                    $setIsSubset: [[chartId], ['$$chart._id']],
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            as: 'dashboard',
                            cond: { $ne: ['$$dashboard.charts', []] },
                        },
                    },
                },
            },
        ]);
        console.log(query);
        return query[0].dashboards[0].charts;
    } catch (e) {
        console.log(e.message);
        return e;
    }
};
const getField = async (field) => {
    return new Promise((resolve) => {
        try {
            const query = `from(bucket: "${bucket}")
                            |> range(start: ${getTime})                            
                            |> keyValues(keyColumns: ["${field}"])  
                            |> group()
                            |> distinct(column: "${field}")`;
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
module.exports = {
    getHost,
    getContainer,
    getChart,
    saveChart,
    delChart,
    getChartSettings,
    getField,
};
