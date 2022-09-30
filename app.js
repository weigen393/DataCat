require('dotenv').config();
const { mongoConnect } = require('./util/mongodb');
const { PORT, API_VERSION } = process.env;
const express = require('express');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const redis = require('./util/redis');

app.use(express.json());
app.set('view engine', 'pug');
app.use('/public', express.static('./public'));
app.use('/images', express.static('./images'));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        name: 'sid',
        saveUninitialized: false,
        resave: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    })
);

// redis.subscribe('mychannel', (e) => {
//     console.log('subscribe channel: mychannel');
// });

// redis.on('message', (channel, message) => {
//     console.log(`channel: ${channel},message: ${message}`);
//     // sendToClient();
// });

// redis.on('error', (err) => {
//     console.log('response err:' + err);
// });

// app.get('/streaming', (req, res) => {
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Connection', 'keep-alive');
//     res.flushHeaders(); // flush the headers to establish SSE with client
//     console.log(req.body);
//     console.log(req.query);
// let counter = 0;
// let interValID = setInterval(() => {
// counter++;
// if (counter >= 10) {
//     clearInterval(interValID);
//     res.end(); // terminates SSE session
//     return;
// }
// res.write(`data: ${req.body}\n\n`); // res.write() instead of res.send()
// }, 1000);

// If client closes connection, stop sending events
// res.on('close', () => {
//     console.log('client dropped me');
//     // clearInterval(interValID);
//     res.end();
// });
// });
//API routes
app.use('/', require('./server/routes/main_route'));
app.use('/api/' + API_VERSION, [
    require('./server/routes/user_route'),
    require('./server/routes/chart_route'),
    require('./server/routes/dashboard_route'),
    require('./server/routes/alert_route'),
    require('./server/routes/notify_route'),
    // require('./server/routes/main_route'),
]);

// Handle 404
app.use(function (req, res, next) {
    console.log('404', req.url);
    return res.status(404).json({ error: 'error: 404' });
});

//Handle 500
app.use(function (err, req, res, next) {
    console.log('error handler: ', err);
    return res.status(500).render('error', { msg: 'error: 500' });
});

app.listen(PORT, () => {
    mongoConnect();
    console.log(`Server is listening on port ${PORT}....`);
});
