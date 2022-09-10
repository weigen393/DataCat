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

const dashboardSchema = new mongoose.Schema({
    userId: String,
    dashboards: [
        {
            dashboardId: String,
            title: String,
            description: String,
            charts: [
                {
                    chartId: String,
                    title: String,
                    layer: String,
                    type: String,
                    host: String,
                    measurement: String,
                    field: String,
                    timeRange: String,
                    interval: Number,
                },
            ],
        },
    ],
});

module.exports = {
    users: mongoose.model('users', userSchema),
    roles: mongoose.model('roles', roleSchema),
    dashboards: mongoose.model('dashboards', dashboardSchema),
};
