require('dotenv').config();
const { users, roles } = require('./mongodb_model');
const bcrypt = require('bcrypt');

const emailCheck = async (email) => {
    // const query = await users.find();
    // if (query.length) {
    //     return true;
    // } else {
    //     return false;
    // }
};
const signUp = async (data) => {
    try {
        const saltRounds = 10;
        const pwd = await bcrypt.hash(data.password, saltRounds);
        const newData = {
            name: data.name,
            email: data.email,
            password: pwd,
        };
        const result = await users.create(newData);
        const id = result._id.valueOf();
        console.log(id);
        roleId = 1;
        const userData = {
            id: id,
            name: data.name,
            email: data.email,
            role: roleId,
        };
        return userData;
    } catch (e) {
        console.log(e);
        return e;
    }
};
const signIn = async (data) => {};
module.exports = {
    signUp,
    signIn,
    emailCheck,
};
