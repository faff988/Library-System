// FIX: Changed parameter 'MediaQueryList' to 'query'
function getPagination(query, defaultLimit = 10, maxLimit = 100) {
    // Now 'query' is accessible here
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
    const skip = (page - 1) * limit;
    
    return { page, limit, skip, take: limit };
}

function buildMeta(page, limit, totalItems) {
    return {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    };
}

module.exports = { getPagination, buildMeta };