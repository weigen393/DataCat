require('dotenv').config();
const dashboard = require('../models/dashboard_model');

const list = async (req, res) => {
    const list = await dashboard.getBoardList('1'); //req.userId
    console.log(list);
    res.status(200).send({ list: list });
};

module.exports = {
    list,
    addDashboard,
};
