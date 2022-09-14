require('dotenv').config();
const chart = require('../models/chart_model');
const getHost = async (req, res) => {
    console.log('getHost');
    const host = await chart.getHost(Object.keys(req.query)[0]);
    console.log('host', host);
    res.status(200).send(host);
};
const getContainer = async (req, res) => {
    console.log('getContainer');
    // const query = JSON.parse(Object.keys(req.query)[0]);
    const container = await chart.getContainer();
    console.log('container', container);
    res.status(200).send(container);
};
const getChart = async (req, res) => {
    console.log('getChart');
    const data = await chart.getChart(req.query);
    res.status(200).send(data);
};
const saveChart = async (req, res) => {
    console.log('saveChart');
    const data = await chart.saveChart(req.body);
    res.status(200).send(data);
};
const delChart = async (req, res) => {
    console.log('delChart');
    const data = await chart.delChart(req.body);
    res.status(200).send(data);
};
module.exports = {
    getHost,
    getContainer,
    getChart,
    saveChart,
    delChart,
};
