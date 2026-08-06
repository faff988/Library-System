const { Prisma } = require('@prisma/client');
const ApiError = require('../utils/ApiError');

function fromPrismaError(err, req) {
    if(err instanceof Prisma.PrismaClientKnownRequestError) {
        switch(err.code){
           case 'P2002': {
    const field = (err.meta && err.meta.target) || [];
    return ApiError.conflict(`A record with this ${[].concat(field).join(', ')} already exists.`);
}
             case 'P2003':
        if (req && req.method === 'DELETE') {
          return ApiError.badRequest('Cannot delete this record because other records still reference it.');
        }
        return ApiError.badRequest('This action references a record that does not exist (invalid foreign key).');
      case 'P2025':
        return ApiError.notFound('The record you tried to update/delete could not be found.');
      case 'P2014':
        return ApiError.badRequest('This change would violate a required relation between records.');
      default:
        return ApiError.badRequest(`Database error (${err.code}).`);
        }
    }

    if(err instanceof Prisma.PrismaClientValidationError){
        return ApiError.badRequest('Invalid data sent to the database layer');
    }
    return null;
}

function errorHandler(err, req, res, next){
    let apiErr = err instanceof ApiError ? err :
    fromPrismaError(err, req);

   if (!apiErr) {
    apiErr = new ApiError(500, err.message || 'Internal server error');
  }

 
  if (req.app.get('env') !== 'production') {
    console.error('❌ Error caught by Middleware:', err);
  }

    res.status(apiErr.statusCode || 500).json({
        success : false,
        message : apiErr.message,
        details : apiErr.details,
    });
}
module.exports = errorHandler;