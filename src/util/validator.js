let Validate = require('./validate');

module.exports = (app) => {
    return function (req, res, next) {
        req.Validate = new Validate(req, res);
        next();
    }
};