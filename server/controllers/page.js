require('dotenv').config();
const dashboard = require('../models/dashboard_model');

const getListPage = async (req, res) => {
    req.body.userId = '2'; // for test
    const list = await dashboard.getBoardList(req.body.userId);
    // console.log(list);
    return res.render('list', { list: list, userId: req.body.userId });
};

const getDashboardPage = async (req, res) => {};

module.exports = {
    getListPage,
    getDashboardPage,
};
