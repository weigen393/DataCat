require('dotenv').config();
const alert = require('../models/alert_model');
const saveAlert = async (req, res) => {
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
const setAlert = async (req, res) => {
    console.log('setAlert');
    console.log(req.body);
    const data = await alert.setAlert(req.session.user.id, req.body);
    res.status(200).send(data);
};

module.exports = {
    saveAlert,
    delAlert,
    setAlert,
};
