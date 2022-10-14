const { alerts, notifies } = require('./mongodb_model');
const { sendEmail, sendDiscord } = require('./notify');
const redis = require('./redis');
const changeStatus = async (alertId, data) => {
    try {
        const query = await alerts.findOneAndUpdate(
            {
                'alerts._id': alertId,
            },
            {
                'alerts.$.status': data,
            }
        );
        console.log('change status');
        console.log(query);
        return 'success';
    } catch (e) {
        console.log(e);
        return e;
    }
};
const createMessage = (data, text) => {
    console.log('here', data, text);
    const messageMap = {
        threshold: `Warning,${data.host[0]} ${data.measurement[0]} ${data.field[0]} is ${data.thresholdType} ${data.threshold}`,
        alive: `Warning,${data.host[0]} ${data.measurement[0]} haven't response for ${data.deadTime} seconds`,
        ok: `Notice,${data.host[0]} ${data.measurement[0]} ${data.field[0]} is ok right now`,
    };
    return messageMap[text];
};
const sendAlert = async (data, text, userId) => {
    console.log('send alert here');
    const message = createMessage(data, text);
    console.log('m', message);
    const userNotify = await getNotifyList(userId.toString());
    const alertReceiver = [];
    for (let i = 0; i < userNotify.length; i++) {
        alertReceiver.push(sendMap[userNotify[i].sendType](userNotify[i], message));
    }
    Promise.all(alertReceiver);
    redis.publish('mychannel', JSON.stringify(message));
};
const sendMap = {
    email: sendEmail,
    discord: sendDiscord,
};
const thresholdCheck = async (currentValue, settings, alertId, userId) => {
    console.log('c', currentValue, 's', settings);
    let checkThreshold = currentValue >= +settings;
    let tmpList = `${settings.thresholdType}-${checkThreshold}-${settings.status}`;
    let thresholdCheckMap = {
        'above-true-off': { changeStatusString: 'on', sendAlertString: 'threshold' },
        'below-false-off': { changeStatusString: 'on', sendAlertString: 'threshold' },
        'above-false-on': { changeStatusString: 'off', sendAlertString: 'ok' },
        'below-true-on': { changeStatusString: 'off', sendAlertString: 'ok' },
    };
    if (thresholdCheckMap[tmpList]) {
        return thresholdCheckMap[tmpList];
    }
};

const aliveCheck = async (currentValue, settings, alertId, userId) => {
    if (currentValue === 0) {
        const aliveCheckMap = {
            off: {
                changeStatusString: 'on',
                sendAlertString: 'alive',
            },
            on: {
                changeStatusString: 'off',
                sendAlertString: 'ok',
            },
        };
        return aliveCheckMap[settings.status];
    }
};

const checkTypeMap = {
    threshold: thresholdCheck,
    alive: aliveCheck,
};

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

module.exports = { checkTypeMap, changeStatus, sendAlert };
