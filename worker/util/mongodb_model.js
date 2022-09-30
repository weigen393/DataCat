const mongoose = require('mongoose');

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
            status: String,
            // count: Number,
        },
    ],
});
const notifySchema = new mongoose.Schema({
    userId: String,
    notify: [
        {
            title: String,
            description: String,
            sendType: String,
            email: String,
            id: String,
            token: String,
        },
    ],
});
module.exports = {
    alerts: mongoose.model('alerts', alertSchema),
    notifies: mongoose.model('notifies', notifySchema),
};
