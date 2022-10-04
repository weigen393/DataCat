require('dotenv').config();
const { mongoConnect } = require('./util/mongodb');
const { PORT, API_VERSION } = process.env;
const express = require('express');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const redis = require('./util/redis');
let test;
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

app.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');
    test = res;
});

redis.subscribe('mychannel', (e) => {
    console.log('subscribe channel: mychannel');
});

redis.on('message', (channel, message) => {
    console.log(`channel: ${channel},message: ${message}`);
    console.log('test', test);
    if (test) {
        test.write('data: ' + `${message}\n\n`);
    }
});

redis.on('error', (err) => {
    console.log('response err:' + err);
});

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
