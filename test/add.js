const createMessage = (data, text) => {
    console.log('here', data, text);
    const messageMap = {
        threshold: `Warning,${data.host[0]} ${data.measurement[0]} ${data.field[0]} is ${data.thresholdType} ${data.threshold}`,
        alive: `Warning,${data.host[0]} ${data.measurement[0]} haven't response for ${data.deadTime} seconds`,
        ok: `Notice,${data.host[0]} ${data.measurement[0]} ${data.field[0]} is ok right now`,
    };
    return messageMap[text];
};

module.exports = createMessage;
