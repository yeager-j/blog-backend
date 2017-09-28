let mongoose = require('mongoose');
let User = mongoose.model('User');

module.exports = permission => {
    return async function (req, res, next) {
        let user;

        try {
            user = await User.findById(req.payload._id);
        } catch (e) {
            console.log(e);
            res.status(401);
            res.json({message: 'Failed to authenticate user.'});
        }

        if (user.rank <= permission) {
            next();
        } else {
            res.status(403);
            res.json({message: 'You are not authorized to perform this action.'});
        }
    }
};
