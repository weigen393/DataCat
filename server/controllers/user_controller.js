require('dotenv').config();
const user = require('../models/user_model');

const signUp = async (req, res) => {
    const emailUsed = await user.emailCheck(req.body.email);
    if (emailUsed) {
        return res.status(400).send('email used');
    }
    const data = await user.signUp(req.body);
    if (data.error) {
        return res.status(400).send(data.error);
    }
    req.session.auth = true;
    req.session.user = data;
    res.status(200).send(data);
};
const signIn = async (req, res) => {
    const data = await user.signIn(req.body);
    console.log('d', data);
    if (data.error) {
        return res.status(400).send(data.error);
    }
    req.session.auth = true;
    req.session.user = data;
    res.status(200).send(data);
};

module.exports = {
    signUp,
    signIn,
};
