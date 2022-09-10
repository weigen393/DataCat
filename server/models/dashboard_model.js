require('dotenv').config();
const { dashboards, roles } = require('./mongodb_model');
const { queryApi } = require('../../util/influxdb');

const getBoardList = async (id) => {
    //find dashboard list with userId
    try {
        const query = await dashboards.find({ userId: id }, 'dashboards');
        // console.log(query[0].dashboards);
        const list = query[0].dashboards;
        return list;
    } catch (e) {
        console.log(e.message);
    }
};
const addDashboard = async (data) => {
    try {
        const query = await dashboards.updateOne(
            { userId: data.userId },
            {
                $push: {
                    dashboards: { dashboardId: data.dashboardId, title: data.title, description: data.description },
                },
            }
        );
        // console.log(query);
        return console.log('add success');
    } catch (e) {
        console.log(e.message);
    }
};
const delDashboard = async (data) => {
    try {
        const query = await dashboards.updateOne(
            {
                userId: data.userId,
            },
            { $pull: { dashboards: { dashboardId: data.dashboardId } } }
        );
        // console.log(query);
        return console.log('delete success');
    } catch (e) {
        console.log(e.message);
    }
};

module.exports = {
    getBoardList,
    addDashboard,
    delDashboard,
};
