const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    roleId: Number,
});

const roleSchema = new mongoose.Schema({
    roleId: Number,
    permission: Array,
});
const chartSchema = new mongoose.Schema({
    title: String,
    layer: String,
    type: String,
    host: Array,
    container: Array,
    measurement: Array,
    field: Array,
    info: Array,
    timeRange: String,
    interval: String,
    aggregate: String,
});
const dashboardSchema = new mongoose.Schema({
    userId: String,
    dashboards: [
        {
            title: String,
            description: String,
            charts: [chartSchema],
        },
    ],
});
const alertSchema = new mongoose.Schema({
    userId: String,
    alerts: [
        {
            title: String,
            description: String,
            layer: String,
            host: Array,
            container: Array,
            measurement: Array,
            field: Array,
            info: Array,
            interval: String,
            aggregate: String,
            schedule: String,
            checkType: String,
            thresholdType: String,
            threshold: String,
            deadTime: String,
        },
    ],
});

module.exports = {
    users: mongoose.model('users', userSchema),
    roles: mongoose.model('roles', roleSchema),
    dashboards: mongoose.model('dashboards', dashboardSchema),
    alerts: mongoose.model('alerts', alertSchema),
};
