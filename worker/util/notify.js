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
        await mg.messages().send(data);
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
        await webhookClient.send({
            content: message,
            username: 'datacat',
        });
        console.log('send to discord');
    } catch (e) {
        console.log(e);
        return e;
    }
};
// sendEmail('weigen393@gmail.com', '[Alert] mem over 75');
// sendDiscord(
//     id,
//     token,
//     '[Alert] mem over 75'
// );
module.exports = { sendEmail, sendDiscord };
