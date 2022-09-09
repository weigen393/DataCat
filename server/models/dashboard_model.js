require('dotenv').config();
const { dashboards, roles } = require('./mongodb_model');
const { queryApi } = require('../../util/influxdb');

const getBoardList = async (id) => {
    //find dashboard list with userId
    try {
        // console.log(id);
        const query = await dashboards.find({ userId: id }, 'dashboards');
        // console.log(query[0].dashboards);
        const list = query[0].dashboards;
        return list;
    } catch (e) {
        console.log(e.message);
    }
};

module.exports = {
    getBoardList,
};
