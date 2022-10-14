const authSession = async (req, res, next) => {
    console.log(req.session);
    if (!req.session?.auth) {
        return res.redirect('/');
    }
    return next();
};

module.exports = {
    authSession,
};
