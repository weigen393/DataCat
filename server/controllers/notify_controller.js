require('dotenv').config();
const notify = require('../models/notify_model');
const saveNotify = async (req, res) => {
    console.log('saveNotify');
    console.log(req.body);
    const data = await notify.saveNotify(req.session.user.id, req.body);
    res.status(200).send(data);
};
const delNotify = async (req, res) => {
    console.log('deleteNotify');
    console.log(req.body);
    const data = await notify.delNotify(req.session.user.id, req.body);
    res.status(200).send('delete');
};
const editNotify = async (req, res) => {
    console.log('editNotify');
    console.log(req.query);
    const data = await notify.getNotifySettings(req.session.user.id, req.query);
    res.status(200).send(data);
};

module.exports = {
    saveNotify,
    delNotify,
    editNotify,
};
