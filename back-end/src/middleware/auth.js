const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const ApiError = require('../utils/ApiError');


function authenticate(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if(scheme !== 'Bearer' || !token) {
        return next(ApiError.unauthorized('Missing or invalid authorization header'));
    }

    try{
        const payload = jwt.verify(token, env.jwtSecret);
        req.user = payload;
        return next();
    } catch (error) {
        return next(ApiError.unauthorized('Invalid or expired token'));
    }
}

function authorize(...allowedRoles) {
    return (req, res, next) => {
        if(!req.user) return next (ApiError.unauthorized('User not authenticated'));
        if(allowedRoles.length === 0) return next();
        if(!allowedRoles.includes(req.user.roleName)){
            return next(ApiError.forbidden(`Requires one of the following roles: ${allowedRoles.join(', ')}`));
        }
        return next();
    };
}

function optionalAuthenticate(req, res,next){
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if(scheme === 'Bearer' && token){
        try{
            req.user = jwt.verify(token, env.jwtSecret);
        } catch (error) {
            
        }
    }
    next();
}

module.exports = {authenticate, authorize, optionalAuthenticate};