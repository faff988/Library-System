const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');

const same = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase();

// Accept common field names so a differently-shaped token still works.
function normalizePayload(p) {
    return {
        ...p,
        userId: p.userId ?? p.id ?? p.user_id,
        roleName: p.roleName ?? p.role ?? p.role_name,
    };
}

function authenticate(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return next(ApiError.unauthorized('Missing or invalid authorization header'));
    }

    try {
        req.user = normalizePayload(jwt.verify(token, env.jwtSecret));
        return next();
    } catch (error) {
        return next(ApiError.unauthorized('Invalid or expired token'));
    }
}

function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) return next(ApiError.unauthorized('User not authenticated'));
        if (allowedRoles.length === 0) return next();
        if (!allowedRoles.some((r) => same(r, req.user.roleName))) {
            return next(ApiError.forbidden(`Requires one of the following roles: ${allowedRoles.join(', ')}`));
        }
        return next();
    };
}

const parseJson = (v) => {
    if (!v) return {};
    if (typeof v === 'object') return v;
    try { return JSON.parse(v); } catch { return {}; }
};

/**
 * Reads permissions fresh from the database on every request, so changes
 * apply immediately. Priority: override > user permissions > role permissions.
 */
function requirePermission(moduleId, action) {
    return async (req, res, next) => {
        try {
            if (!req.user) return next(ApiError.unauthorized('User not authenticated'));
            if (same('Admin', req.user.roleName)) return next();
            if (action === 'read') return next();

            const user = await prisma.users.findUnique({
                where: { user_id: Number(req.user.userId) },
                include: { roles: true },
            });
            if (!user || user.is_active === false) {
                return next(ApiError.forbidden('Account disabled'));
            }

            const rolePerms = parseJson(user.roles?.permissions);
            const userPerms = parseJson(user.permissions);
            const overrides = parseJson(user.permission_overrides);

            const allowed =
                overrides?.[moduleId]?.[action] ??
                userPerms?.[moduleId]?.[action] ??
                rolePerms?.[moduleId]?.[action] ??
                false;

            if (!allowed) {
                return next(ApiError.forbidden(`You don't have permission to ${action} in ${moduleId}`));
            }
            return next();
        } catch (e) {
            return next(e);
        }
    };
}

function optionalAuthenticate(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme === 'Bearer' && token) {
        try {
            req.user = normalizePayload(jwt.verify(token, env.jwtSecret));
        } catch (error) {
            // invalid token: continue as anonymous
        }
    }
    next();
}

module.exports = { authenticate, authorize, requirePermission, optionalAuthenticate };