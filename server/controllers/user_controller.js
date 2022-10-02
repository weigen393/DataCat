require('dotenv').config();
const validator = require('validator');
const user = require('../models/user_model');

const signUp = async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password || !name) {
        return res.status(400).send({ error: 'name, email and password are required.' });
    }
    if (!validator.isByteLength(name, 0, 20)) {
        return res.status(400).send({ error: 'Name is too long.' });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).send({ error: 'Invalid email format.' });
    }

    if (!validator.isByteLength(password, 6, 16)) {
        return res.status(400).send({ error: 'Invalid password length.' });
    }

    if (
        !validator.isStrongPassword(password, {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0,
        })
    ) {
        return res.status(400).send({ error: 'Invalid password format.' });
    }
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
    // console.log(req.body);
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return res.status(400).send({ error: 'email and password are required.' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).send({ error: 'Invalid email format.' });
    }

    if (!validator.isByteLength(password, 6, 16)) {
        return res.status(400).send({ error: 'Invalid password length.' });
    }

    if (
        !validator.isStrongPassword(password, {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0,
        })
    ) {
        return res.status(400).send({ error: 'Invalid password format.' });
    }
    const data = await user.signIn(req.body);
    if (data.error) {
        return res.status(400).send(data.error);
    }
    req.session.auth = true;
    req.session.user = data;
    res.status(200).send(data);
};
const logout = async (req, res) => {
    console.log('logout');
    req.session.destroy();
    res.redirect('/');
};
module.exports = {
    signUp,
    signIn,
    logout,
};
