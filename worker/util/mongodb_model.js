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
        },
    ],
});

module.exports = {
    alerts: mongoose.model('alerts', alertSchema),
};
