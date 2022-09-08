const express = require('express');
const app = express();
require('dotenv').config();
const urlRoutes = require('./server/routes/url');

app.use(express.static('public'));
app.use(express.json());

app.use(`/api/${process.env.API_VERSION}/`, urlRoutes);

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

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}....`);
});
