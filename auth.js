const jwtExpress = require('express-jwt');
const jwt = require('jsonwebtoken');
const Buffer = require('buffer').Buffer;
const crypto = require('crypto');
/**
 *
 * @param option
 * @param  {string='jwt-in-cookie'} option.mode 'jwt-in-cookie','jwt-in-header'
 * @todo implement mix mode?
 * @param {boolean=true} option.hash
 * @param {string="sha1"} option.hashAlgo
 * @param {string="jwtid"} option.jwtidProperty
 * @param {string="auth"} option.requestProperty
 * @param {string} option.secret
 */
const auth = function (option) {

    let secret = option && option.secret;
    if (!secret) throw new ReferenceError('secret must has a value');

    let requestProperty = option.requestProperty || 'auth';
    let jwtidProperty = option.jwtidProperty || 'jwtid';

    let mode = option.mode || 'jwt-in-cookie';
    let hash = option.hash || true;
    let hashAlgo = hash && option.hashAlgo || 'sha1';

    function getCookieToken(req) {
        return req.cookies.jwt;
    }

    function getHeaderID(req) {
        return req.headers.jwtid_digest;
    }

    function getCookieID(req) {
        return req.cookies.jwtid;
    }

    function getHeaderToken(req) {
        if (!(req.headers && req.headers.authorization))
            throw new ReferenceError('headers is missing')

        let parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {
            let scheme = parts[0];
            let credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                return credentials;
            } else {
                throw new jwtExpress.UnauthorizedError('credentials_bad_scheme', {message: 'Format is Authorization: Bearer [token]'});
            }
        } else {
            throw new jwtExpress.UnauthorizedError('credentials_bad_format', {message: 'Format is Authorization: Bearer [token]'});
        }
    }

    function getToken(req) {
        function verify(tohash, id) {
            let d = hash ? crypto.createHash(hashAlgo).update(tohash).digest('hex') : tohash;
            if (crypto.timingSafeEqual(Buffer.from(d), Buffer.from(id)))
                return true;
            else
                throw new jwtExpress.UnauthorizedError('jwtid and jwtid_digest mismatch');
        }

        if (mode === 'jwt-in-cookie') {
            let token = getCookieToken(req)
            let jwtid = jwt.decode(token).jwtid;
            let jwtid_digest = getHeaderID(req)

            if (verify(jwtid, jwtid_digest)) {
                req[jwtidProperty] = {
                    jwtid: jwtid,
                    jwtid_digest: jwtid_digest
                };
                return token;
            }
        } else if (mode === 'jwt-in-header') {
            let token = getHeaderToken(req);
            let jwtid_digest = jwt.decode(token).jwtid_digest;
            let jwtid = getCookieID(req);
            if (verify(jwtid, jwtid_digest)) {
                req[jwtidProperty] = {
                    jwtid: jwtid,
                    jwtid_digest: jwtid_digest
                };
                return token;
            }
        }
    }


    return jwtExpress({
        secret: secret,
        requestProperty: requestProperty,

        isRevoked: function (req, payload, done) {
            //console.log(req.tokenID);
            //TODO: blacklist
            //if (req.header.jwtd in blacklist) done(null,true);
            done(null, false);
        },

        getToken: getToken
    });
};

module.exports = auth;
