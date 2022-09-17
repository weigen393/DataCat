require('dotenv').config();
const user = require('../models/user_model');

const signUp = async (req, res) => {
    const emailUsed = await user.emailCheck(req.body.email);
    if (emailUsed) {
        return res.status(400).send('email used');
    }
    const data = await user.signUp(req.body);
    req.session.auth = true;
    req.session.user = data;
    res.status(200).send('sign up');
};
const signIn = async (req, res) => {
    res.status(200).send('sign in');
};

module.exports = {
    signUp,
    signIn,
};
