require('dotenv').config();
const dashboard = require('../models/dashboard_model');

const list = async (req, res) => {
    //list
    res.status(200).send({ data: { list: dashboard.getBoardList(1) } });
};

module.exports = {
    list,
};
