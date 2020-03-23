const jwt = require('jsonwebtoken');
const crypto = require('crypto');
/**
 * @typedef {Object} RESTJwt
 * @property {string} jwt
 * @property {string} tokenid
 * @property {string} tokenid_digest
 */
/**
 *
 * @param option
 * @param {string} option.secret
 * @param {object=null} option.signOptions
 * @param {number=160} option.jwtidSize
 * @param {boolean=true} option.hash
 * @param {string='sha1'} option.hashAlgo
 * @param  {string='jwt-in-cookie'} option.mode 'jwt-in-cookie','jwt-in-header'

 */
const create = function (option) {

    let secret = option && option.secret;
    if (!secret) throw new ReferenceError('secret must has a value');

    let opt = option || {};
    let mode = opt.mode || 'jwt-in-cookie';
    let signOptions = opt.signOptions;
    let jwtidSize = opt.jwtidSize ? Math.min(Math.max(opt.jwtidSize, 0), 512) : 160;
    let hash = opt.hash || true;
    let hashAlgo = opt.hashAlgo || 'sha1';

    function randomID() {
        return crypto.randomBytes(jwtidSize / 8).toString('hex');
    }

    /**
     * @param {object} payload
     * @param {object} signOptions
     * @return {RESTJwt}
     */
    return function (payload, signOptions) {
        let jwtid = randomID();
        let jwtid_digest = hash ? crypto.createHash(hashAlgo).update(jwtid).digest('hex') : jwtid;

        let jwt_p = mode === 'jwt-in-cookie' ? {jwtid: jwtid} : {jwtid_digest: jwtid_digest};
        let signed_token = jwt.sign(
            Object.assign({}, jwt_p, payload),
            secret,
            signOptions
        );

        return {
            jwt: signed_token,
            jwtid: jwtid,
            jwtid_digest: jwtid_digest
        }
    }
};
module.exports = create;
