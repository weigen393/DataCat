require('dotenv').config();
const alert = require('../models/alert_model');
const saveAlert = async (req, res) => {
    console.log('saveAlert');
    console.log(req.body);
    const data = await alert.saveAlert(req.session.user.id, req.body);
    res.status(200).send(data);
};

module.exports = {
    saveAlert,
};
