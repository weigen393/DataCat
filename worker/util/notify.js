require('dotenv').config({ path: '../../worker/.env' });
const mailgun = require('mailgun-js');
const DOMAIN = process.env.DOMAIN_NAME;
const mg = mailgun({ apiKey: process.env.API_KEY, domain: DOMAIN });

const { WebhookClient } = require('discord.js');

const sendEmail = async (email, message) => {
    const data = {
        from: 'dataCat <meow@datacat.cloud>',
        to: email,
        subject: 'Alert',
        html: `<h1>${message}</h1>`,
    };
    try {
        // await mg.messages().send(data);
        console.log(email);
        console.log('send to mail');
    } catch (e) {
        console.log(e);
        return e;
    }
};
const sendDiscord = async (id, token, message) => {
    const webhookClient = new WebhookClient({
        id: id,
        token: token,
    });
    try {
        // await webhookClient.send({
        //     content: message,
        //     username: 'datacat',
        // });
        console.log(id, token);
        console.log('send to discord');
    } catch (e) {
        console.log(e);
        return e;
    }
};
module.exports = { sendEmail, sendDiscord };
