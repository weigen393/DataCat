require('dotenv').config();
const { mongoConnect } = require('./util/mongodb');
const { PORT, API_VERSION } = process.env;
const express = require('express');
const app = express();

app.use(express.json());
app.set('view engine', 'pug');
app.use('/public', express.static('./public'));
app.use('/images', express.static('./images'));
//API routes
app.use('/api/' + API_VERSION, [require('./server/routes/dashboard_route'), require('./server/routes/main_route')]);

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
