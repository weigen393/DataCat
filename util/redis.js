require('dotenv').config();
const Redis = require('ioredis');
const { REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASSWORD } = process.env;

// const redis = new Redis(`rediss://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
const redis = new Redis({
    port: REDIS_PORT,
    host: REDIS_HOST,
    username: REDIS_USER,
    password: REDIS_PASSWORD,
});
module.exports = redis;
