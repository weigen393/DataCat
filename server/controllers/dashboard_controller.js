require('dotenv').config();
const dashboard = require('../models/dashboard_model');

const addDashboard = async (req, res) => {
    console.log(typeof req.session);
    console.log(req.session);
    const add = await dashboard.addDashboard(req.body, req.session.user.id);

    console.log('add dashboard');
    res.status(200).send(add);
};
const delDashboard = async (req, res) => {
    const del = await dashboard.delDashboard(req.body, req.session.user.id);
    console.log('delete dashboard');
    res.status(200).send('delete');
};
const updateDashboardText = async (req, res) => {
    const maxText = 40;
    console.log(req.body);
    if (req.body.title.length > maxText || req.body.description.length > maxText) {
        res.status(400).send({ error: 'input too long' });
        return;
    }
    if (
        req.body.title.includes('<') ||
        req.body.title.includes('>') ||
        req.body.description.includes('<') ||
        req.body.description.includes('>')
    ) {
        res.status(400).send({ error: 'invalid symbol' });
        return;
    }
    const text = await dashboard.updateDashboardText(req.params.dashboardId, req.body);
    console.log('update dashboard text');
    res.status(200).send('update');
};

module.exports = {
    addDashboard,
    delDashboard,
    updateDashboardText,
};
