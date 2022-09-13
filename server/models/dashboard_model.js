require('dotenv').config();
const { dashboards, roles } = require('./mongodb_model');
const { queryApi } = require('../../util/influxdb');

const getBoardList = async (id) => {
    try {
        const query = await dashboards.find({ userId: id }, 'dashboards');
        const list = query[0].dashboards;
        return list;
    } catch (e) {
        console.log(e.message);
        return e;
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
        return console.log('add success');
    } catch (e) {
        console.log(e.message);
        return e;
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
        return console.log('delete success');
    } catch (e) {
        console.log(e.message);
        return e;
    }
};

const getDashboardPage = async (userId, dashboardId) => {
    try {
        console.log(dashboardId);
        const query = await dashboards.find(
            { 'dashboards.dashboardId': dashboardId },
            { dashboards: { $elemMatch: { dashboardId: dashboardId } } }
        );
        const list = query[0].dashboards;
        return list;
    } catch (e) {
        console.log(e.message);
        return e;
    }
};
module.exports = {
    getBoardList,
    addDashboard,
    delDashboard,
    getDashboardPage,
};
