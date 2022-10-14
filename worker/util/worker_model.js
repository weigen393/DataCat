require('dotenv').config({ path: './worker/.env' });
const { queryApi } = require('./influxdb');
const bucketData = process.env.INFLUX_BUCKET_DATA;
const bucketApp = process.env.INFLUX_BUCKET_APP;
const { alerts, notifies } = require('./mongodb_model');
const scheduleDelayTime = 10;

const systemPattern = (data) =>
    `from(bucket: "${bucketData}")
    |> range(start: -${+data.schedule + scheduleDelayTime}s)
    |> filter(fn: (r) => r["host"] == "${data.host[0]}")
    |> filter(fn: (r) => r["_measurement"] == "${data.measurement[0]}")
    |> filter(fn: (r) => r["_field"] == "${data.field[0]}")`;
const systemPatternWithCPU = (data) => systemPattern(data) + '|> filter(fn: (r) => r["cpu"] == "cpu-total")';
const containerPattern = (data) =>
    `from(bucket: "${bucketData}")
    |> range(start: -${+data.schedule + scheduleDelayTime}s)
    |> filter(fn: (r) => r["host"] == "${data.host[0]}")
    |> filter(fn: (r) => r["container_name"] == "${data.container[0]}")
    |> filter(fn: (r) => r["_measurement"] == "${data.measurement[0]}")
    |> filter(fn: (r) => r["_field"] == "${data.field[0]}")
    `;
const applicationDurationPattern = (data) =>
    `from(bucket: "${bucketApp}")
    |> range(start: -${+data.schedule + scheduleDelayTime}s)
    |> filter(fn: (r) => r["host"] == "${data.host[0]}")
    |> filter(fn: (r) => r["${data.measurement[0]}"] == "${data.field[0]}")
    |> filter(fn: (r) => r["_field"] == "${data.info[0]}")`;
const applicationRequestCountPattern = (data) => applicationDurationPattern(data) + '|> count()';
const applicationCountPattern = (data) =>
    `from(bucket: "${bucketApp}")
    |> range(start: -${+data.schedule + scheduleDelayTime}s)
    |> filter(fn: (r) => r["host"] == "${data.host[0]}")
    |> filter(fn: (r) => r["${data.measurement[0]}"] == "${data.field[0]}")
    |> filter(fn: (r) => r["_field"] == "duration")
    |> group(columns: ["_field"])`;

const queryMap = {
    system: {
        cpu: systemPatternWithCPU,
        mem: systemPattern,
        net: systemPattern,
        processes: systemPattern,
        system: systemPattern,
    },
    container: {
        docker_container_cpu: containerPattern,
        docker_container_mem: containerPattern,
        docker_container_status: containerPattern,
        docker: containerPattern,
    },
    application: {
        method: {
            duration: applicationDurationPattern,
            count: applicationCountPattern,
        },
        url: {
            duration: applicationDurationPattern,
            count: applicationCountPattern,
        },
        statusCode: {
            duration: applicationDurationPattern,
            count: applicationCountPattern,
        },
        requestCount: {
            duration: applicationRequestCountPattern,
            count: applicationRequestCountPattern,
        },
        customize: {
            duration: (data) => `from(bucket: "${bucketApp}")
            |> range(start: -${+data.schedule + scheduleDelayTime}s)
            |> filter(fn: (r) => r["host"] == "${data.host[0]}")
            |> filter(fn: (r) => r["_field"] == "${data.field[0]}")
            `,
            count: (data) => `from(bucket: "${bucketApp}")
            |> range(start: -${+data.schedule + scheduleDelayTime}s)
            |> filter(fn: (r) => r["host"] == "${data.host[0]}")
            |> filter(fn: (r) => r["_field"] == "${data.field[0]}")
            `,
        },
    },
};
const appendThresholdAbove = (data) => data + '|> max()';
const appendThresholdBelow = (data) => data + '|> min()';
const thresholdMap = {
    above: appendThresholdAbove,
    below: appendThresholdBelow,
};
const getAlertData = async (data) => {
    return new Promise((resolve) => {
        try {
            const deadTimeOffset = 5;
            if (data.checkType === 'alive') {
                data.schedule = +data.deadTime - deadTimeOffset;
            }
            let query;
            if (data.layer === 'application') {
                query = queryMap[data.layer][data.measurement[0]][data.info[0]](
                    data,
                    data.measurement[0] === 'requestCount'
                );
            } else {
                query = queryMap[data.layer][data.measurement[0]](data, data.measurement[0] === 'cpu');
            }
            if (data.checkType === 'threshold') {
                query = thresholdMap[data.thresholdType](query);
                // query = appendThresholdQuery(query, data.thresholdType);
            }
            console.log(query);
            const chartData = [];
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
module.exports = { getSettings, getAlertData };
