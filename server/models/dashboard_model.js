require('dotenv').config();
const { dashboards, roles } = require('./mongodb_model');
const { queryApi } = require('../../util/influxdb');

const getBoardList = async (id) => {
    try {
        const query = await dashboards.find({ userId: id }, 'dashboards');
        return query[0].dashboards;
    } catch (e) {
        console.log(e.message);
        return e;
    }
};

const addDashboard = async (data) => {
    try {
        const query = await dashboards.findOneAndUpdate(
            { userId: data.userId },
            {
                $push: {
                    dashboards: { title: data.title, description: data.description },
                },
            },
            {
                returnDocument: 'after',
            }
        );
        const id = query.dashboards.pop()._id.valueOf();
        return id;
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
            { $pull: { dashboards: { _id: data.dashboardId } } }
        );
        return console.log('delete success');
    } catch (e) {
        console.log(e.message);
        return e;
    }
};

const getDashboardPage = async (userId, dashboardId) => {
    try {
        const query = await dashboards.find(
            {
                'dashboards._id': dashboardId,
            },
            {
                dashboards: { $elemMatch: { _id: dashboardId } },
            }
        );
        console.log(query[0].dashboards[0]);
        return query[0].dashboards[0];
    } catch (e) {
        console.log(e.message);
        return e;
    }
};
const getDashboardTitle = async (userId, dashboardId) => {
    try {
        const query = await dashboards.find(
            {
                'dashboards._id': dashboardId,
            },
            {
                dashboards: { $elemMatch: { _id: dashboardId } },
            }
        );
        return query[0].dashboards[0].title;
    } catch (e) {
        console.log(e.message);
        return e;
    }
};
const updateDashboardText = async (dashboardId, text) => {
    try {
        const query = await dashboards.findOneAndUpdate(
            {
                'dashboards._id': dashboardId,
            },
            {
                'dashboards.$.title': text.title,
                'dashboards.$.description': text.description,
            }
        );
        return query;
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
    getDashboardTitle,
    updateDashboardText,
};
