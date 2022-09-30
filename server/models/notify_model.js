require('dotenv').config();
const { notifies, dashboards, roles } = require('./mongodb_model');

const getNotifyList = async (id) => {
    try {
        const query = await notifies.find({ userId: id }, 'notify');
        if (!query[0]) {
            return '';
        }
        return query[0].notify;
    } catch (e) {
        console.log(e.message);
        return e;
    }
};
const saveNotify = async (userId, data) => {
    try {
        let query;
        console.log('d', userId, data);
        if (!data.notifyId) {
            query = await notifies.findOneAndUpdate(
                { userId: userId },
                {
                    $push: {
                        notify: {
                            title: data.title,
                            description: data.description,
                            sendType: data.type,
                            email: data.email,
                            id: data.id,
                            token: data.token,
                        },
                    },
                },
                {
                    returnDocument: 'after',
                }
            );
        } else {
            query = await notifies.findOneAndUpdate(
                { 'notify._id': data.notifyId },
                {
                    'notify.$.title': data.title,
                    'notify.$.description': data.description,
                    'notify.$.sendType': data.type,
                    'notify.$.email': data.email,
                    'notify.$.id': data.id,
                    'notify.$.token': data.token,
                }
            );
        }
        if (data.notifyId === undefined) {
            console.log('q', query);
            // const id = query.alerts.pop()._id.valueOf();
            const id = query.notify.pop()._id.valueOf();
            return { notifyId: id };
        } else {
            return { notifyId: data.notifyId };
        }
    } catch (e) {
        console.log(e.message);
    }
};
const delNotify = async (userId, data) => {
    try {
        const query = await notifies.updateOne(
            {
                userId: userId,
            },
            { $pull: { notify: { _id: data.notifyId } } }
        );
        // await delRedisAlert(data.alertId);
        return console.log('delete success');
    } catch (e) {
        console.log(e.message);
        return e;
    }
};
const getNotifySettings = async (userId, data) => {
    try {
        console.log(data.notifyId);
        const query = await notifies.find(
            {
                'notify._id': data.notifyId,
            },
            {
                notify: { $elemMatch: { _id: data.notifyId } },
            }
        );
        console.log(query);
        return query[0].notify[0];
    } catch (e) {
        console.log(e);
        return e;
    }
};
module.exports = {
    getNotifyList,
    saveNotify,
    delNotify,
    getNotifySettings,
};
