# Introduction
A restful compatible jwt authorization/authentication/user-system middleware for express.  
It handle ALL the secure risk like jwt intercepted/stolen/leaking/forgery

# Installation
```bash
npm install -S rest-express-jwt
```
```bash
yarn add rest-express-jwt
```
# How to use
```js
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
        issuer: 'goolyuyi.com',
        notBefore: 0
    });

    res.cookie('jwt', restjwt.jwt, {httpOnly: true, sameSite: 'strict', secure: true});
    res.json({jwtid_digest: restjwt.jwtid_digest});
});
```
# How it works
### Schema: `jwt-in-header`
1. set a cookie session with `jwtid`(a big random number) when user login

2. create a `jwt` when user login,set `jwt.jwtid_digest = hash(session id)`
3. response the `jwt`, user agent should keep this in memory, like `localStorage` or `sessionStorage`)
4. request with `jwt` in `Bearer Authentication` header for every subsequent requests
4. verify `hash(jwtid)===jwt.jwtid_digest`

**FEATURE**:
* this handle all risks in [OWASP cheat sheet](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/JSON_Web_Token_Cheat_Sheet_for_Java.md)
* to prevent `XSS` or intercepted/stolen the jwt, attacker impossible to retrieve the `jwtid`
* to prevent `CSRF` attack, the attacker impossible retrieve `jwt` in user agent

**RISKS**:
* some information in `jwt` may be extract by attacker, if they intercepted/stolen the `jwt` even they are not able to use it.

## Schema `jwt-in-cookie`:

1. create a `jwt` when user login,set `jwt.jwtid` with a big random number.
2. set a cookie session `jwt`
3. response with `jwtid_digest = hash(jwt.jwtid)` when user login, user agent should keep this in memory, like `localStorage` or `sessionStorage`).
4. request with `jwtid_digest`'s value in header `"jwtid_digest"`.
5. verify `hash(jwt.jwtid)===jwtid_digest`

**FEATURE**:
* this handle all risks in [OWASP cheat sheet](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/JSON_Web_Token_Cheat_Sheet_for_Java.md)
* to prevent `XSS` or intercepted/stolen the jwt, attacker impossible to retrieve the `jwt`
* to prevent `CSRF` attack, the attacker impossible retrieve `jwtid_digest` in user agent

**RISKS**:
* NONE

# Schema Comparasion
| Schema        |                     jwt-in-header |                  jwt-in-cookie |
|:--------------|----------------------------------:|-------------------------------:|
| Cookie Stored |                             jwtid |             jwt with jwt.jwtid |
| Client Stored |         jwt with jwt.jwtid_digest |                   jwtid_digest |
| Client Header |        authorization(with Bearer) |                   jwtid_digest |
| Verify Method | hash(jwtid) ===  jwt.jwtid_digest | hash(jwt.jwtid)===jwtid_digest |

# Code:
###  jwt-in-header
```js
req.headers.authorization
req.cookies.jwtid
```

### jwt-in-cookie
```js
req.headers.jwtid_digest
req.cookies.jwt
```

# Upcoming
* jwt blacklist
* jwt local encrypt
