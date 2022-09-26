require('dotenv').config();
const notify = require('../models/notify_model');
const saveNotify = async (req, res) => {
    console.log('saveAlert');
    console.log(req.body);
    const data = await alert.saveAlert(req.session.user.id, req.body);
    res.status(200).send(data);
};
const delAlert = async (req, res) => {
    console.log('deleteAlert');
    console.log(req.body);
    const data = await alert.delAlert(req.session.user.id, req.body);
    res.status(200).send('delete');
};
const editAlert = async (req, res) => {
    console.log('editAlert');
    console.log(req.query);
    const data = await alert.getAlertSettings(req.session.user.id, req.query);
    res.status(200).send(data);
};

module.exports = {
    saveAlert,
    delAlert,
    editAlert,
};
