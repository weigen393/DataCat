require('dotenv').config();
const mongoose = require('mongoose');
const { dashboard } = require('./mongodb_model');
const { queryApi } = require('../../util/influxdb');

const getBoardList = async (userId) => {
    //find dashboard list with userId
    return userId;
};

module.exports = {
    getBoardList,
};
