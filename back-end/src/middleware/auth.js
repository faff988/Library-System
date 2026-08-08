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

/**
 * requirePermission('inventory', 'delete') -> blocks the request unless the
 * user is Admin (Admins always bypass) or their `permissions` JSON grants
 * that module+action. Fails CLOSED: a missing module entry or a missing
 * `permissions` object on the token both mean "no access", not "allowed".
 *
 * Must run AFTER authenticate. Pair with authorize(...) for a coarse role
 * gate first if you want non-Admin/Librarian roles rejected outright.
 */
function requirePermission(moduleId, action) {
    return (req, res, next) => {
        if (!req.user) return next(ApiError.unauthorized('User not authenticated'));
        if (req.user.roleName === 'Admin') return next();

        const modulePerms = req.user.permissions?.[moduleId];
        if (!modulePerms || !modulePerms[action]) {
            return next(ApiError.forbidden(`You don't have permission to ${action} in ${moduleId}`));
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

module.exports = {authenticate, authorize, requirePermission, optionalAuthenticate};