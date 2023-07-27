const { jobSchema } = require('../schemas');
const AppError = require('./AppError');

module.exports.ValidateJob = (req, res, next) => {
    const {error} = jobSchema.validate(req.body);
    if(error){
        console.log(error.details);
        throw new AppError('There was a validation error.', 403);
    } else {
        next();
    }
}