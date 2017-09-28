let mongoose = require('mongoose');
let User = mongoose.model('User');

module.exports = {
    get: async (req, res) => {
        let user;

        try {
            user = await User.findOne({
                _id: req.params.id,
                deleted: false
            });
            user = await user.populate({path: 'articles', model: 'Article'}).populate({path: 'comments'}).execPopulate();
        } catch (e) {
            console.log(e);
            res.status(404);
            res.json({message: 'Could not find that user.'});
        }

        res.status(200);
        res.json(user);
    },
    getAll: async (req, res) => {
        let users;

        try {
            users = await User.find({
                deleted: false
            });

            let promises = users.map(async user => {
                return user.populate({path: 'articles', model: 'Article'}).execPopulate();
            });

            users = await Promise.all(promises);
        } catch (e) {
            console.log(e);
        }

        res.status(200);
        res.json(users);
    },
    create: async (req, res) => {
        let validation = await req.Validate.check({
            'name': 'required|min:3|max:30',
            'email': 'required|email',
            'password': 'required|min:8|max:100|password'
        });

        if (validation.passed) {
            let user = new User({
                name: req.body.name,
                email: req.body.email
            });

            user.setPassword(req.body.password);

            try {
                await user.save();

                let token = user.generateJwt();

                res.status(200);
                res.json({user, token});
            } catch (e) {
                console.log(e);
                res.status(500);
                res.json({errors: ['Could not create user.']});
            }
        } else {
            res.status(400);
            res.json({errors: validation.errors});
        }
    },
    update: async (req, res) => {
        let validation = await req.Validate.check({
            'name': 'required|min:3|max:30',
            'email': 'required|email',
            'rank': 'required'
        });

        if (validation.passed) {
            let user;
            let id = req.params.id || req.payload._id;

            try {
                user = await User.findById(id);
                user.name = req.body.name;
                user.email = req.body.email;
                user.rank = req.body.rank;

                await user.save();

                res.status(200);
                res.json(user);
            } catch (e) {
                console.log(e);
                res.status(404);
                res.json({errors: ['Could not update that user.']});
            }
        } else {
            res.status(400);
            res.json({errors: validation.errors});
        }
    },
    changePassword: async (req, res) => {
        let validation = await req.Validate.check({
            'password': 'required',
            'new_password': 'required|min:8|max:100'
        });

        if (validation.passed) {
            let user;

            try {
                user = await User.findById(req.payload._id);

                if (user.checkPassword(req.body.password)) {
                    user.setPassword(req.body.new_password);

                    await user.save();

                    let token = user.generateJwt();

                    res.status(200);
                    res.json({user, token});
                } else {
                    res.status(403);
                    res.json({errors: ['Invalid password']});
                }
            } catch (e) {
                console.log(e);
                res.status(404);
                res.json({errors: ['Could not change password.']});
            }
        } else {
            res.status(400);
            res.json({errors: validation.errors});
        }
    },
    delete: async (req, res) => {
        let user;

        try {
            user = await User.findById(req.params.id);

            user.deleted = true;
            await user.save();
        } catch (e) {
            console.log(e);
            res.status(404);
            res.json({message: 'Could not find the user to remove.'});
        }

        res.status(200);
        res.json({user});
    },
    login: async (req, res) => {
        let validation = await req.Validate.check({
            'email': 'required|email',
            'password': 'required'
        });

        if (validation.passed) {
            let user;

            try {
                user = await User.findOne({email: req.body.email, deleted: false});

                if (user.checkPassword(req.body.password)) {
                    let token = user.generateJwt();
                    res.status(200);
                    res.json({user, token});
                } else {
                    res.status(401);
                    res.json({errors: ['Failed to authenticate']});
                }
            } catch (e) {
                console.log(e);
                res.status(401);
                res.json({errors: ['Failed to authenticated.']});
            }
        } else {
            res.status(400);
            res.json({errors: validation.errors});
        }
    }
};