require('dotenv').config();
const dashboard = require('../models/dashboard_model');

const addDashboard = async (req, res) => {
    const add = await dashboard.addDashboard(req.body);
    res.status(200).send(req.body);
};
const delDashboard = async (req, res) => {
    const del = await dashboard.delDashboard(req.body);
    res.status(200).send(req.body);
};

module.exports = {
    addDashboard,
    delDashboard,
};
