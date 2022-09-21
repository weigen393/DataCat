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
    const container = await chart.getContainer(req.query);
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
    console.log(req.body);
    const data = await chart.saveChart(req.session.user.id, req.body);
    console.log(data);
    res.status(200).send(data);
};
const delChart = async (req, res) => {
    console.log('delChart');
    const data = await chart.delChart(req.body);
    res.status(200).send(data);
};
const editChart = async (req, res) => {
    console.log('editChart');
    console.log(req.query);
    const data = await chart.getChartSettings(req.query);
    res.status(200).send(data);
};

const getAppField = async (req, res) => {
    console.log('getAppField');
    // console.log(req);
    const field = await chart.getField(req.query);
    console.log('field', field);
    res.status(200).send(field);
};
module.exports = {
    getHost,
    getContainer,
    getChart,
    saveChart,
    delChart,
    editChart,
    getAppField,
};
