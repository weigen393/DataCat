require('dotenv').config();
const { users, roles, alerts } = require('./mongodb_model');
const bcrypt = require('bcrypt');

const emailCheck = async (email) => {
    const query = await users.find({
        email: email,
    });
    if (query.length) {
        return true;
    } else {
        return false;
    }
};
const signUp = async (data) => {
    try {
        const roleId = 1;
        const saltRounds = 10;
        const pwd = await bcrypt.hash(data.password, saltRounds);
        const newData = {
            name: data.name,
            email: data.email,
            password: pwd,
            roleId: roleId,
        };
        const result = await users.create(newData);
        const id = result._id.valueOf();
        const sendData = {
            id: id,
            name: data.name,
            email: data.email,
            roleId: roleId,
        };
        const query = await alerts.create({
            userId: id,
            alerts: [],
        });
        return sendData;
    } catch (e) {
        console.log(e);
        return { error: e };
    }
};
const signIn = async (data) => {
    try {
        const userData = await users.find({ email: data.email });
        console.log(userData);
        if (!userData[0]) {
            return { error: 'email not found' };
        }
        const compare = await bcrypt.compare(data.password, userData[0].password);
        if (!compare) {
            return { error: 'wrong password or email' };
        }
        const sendData = {
            id: userData[0].id,
            name: userData[0].name,
            email: userData[0].email,
            role: userData[0].roleId,
        };
        return sendData;
    } catch (e) {
        console.log(e);
        return { error: e };
    }
};
module.exports = {
    signUp,
    signIn,
    emailCheck,
};
