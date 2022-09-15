const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: String,
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

module.exports = {
    users: mongoose.model('users', userSchema),
    roles: mongoose.model('roles', roleSchema),
    dashboards: mongoose.model('dashboards', dashboardSchema),
};
