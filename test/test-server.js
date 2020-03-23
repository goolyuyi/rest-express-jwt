const express = require('express');
const cookieParser = require('cookie-parser');
const secret = 'test.8e@af!g#';

const jwtAuth = require('../rest-express-jwt').auth({
    mode: 'jwt-in-cookie',
    secret: secret,
});

const jwtCreate = require('../rest-express-jwt').create({
    mode: 'jwt-in-cookie',
    secret: secret
});

const app = express();
app.use(cookieParser());

app.get('/user-info', jwtAuth, function (req, res, next) {
    console.log(req.auth);
    console.log(req.jwtid);
    res.send('okay');
});

app.get('/login', function (req, res, next) {
    let restjwt = jwtCreate({user: 'mock-user'}, {
        expiresIn: 60 * 60,
        issuer: 'yijiang.life',
        notBefore: 0
    });

    //*IMPORTANT* use this line when it's production mode!
    //res.cookie('jwt', restjwt.jwt, {httpOnly: true, sameSite: 'strict', secure: true});
    res.cookie('jwt', restjwt.jwt, {httpOnly: true, sameSite: 'strict'});
    res.json({jwtid_digest: restjwt.jwtid_digest});
});

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    console.log(err);

    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send(err.message);
});

module.exports = app;

