let mongoose = require('mongoose');
let Article = mongoose.model('Article');
let User = mongoose.model('User');

module.exports = {
    get: async (req, res) => {
        let article;

        try {
            article = await Article.findOne({
                _id: req.params.id,
                deleted: false
            });
            article = await article.populate({path: 'author', model: 'User'}).execPopulate();

            res.status(200);
            res.json(article);
        } catch (e) {
            console.log(e);
            res.status(404);
            res.json({error: 'Could not find that article.'});
        }
    },
    getAll: async (req, res) => {
        let articles;

        try {
            articles = await Article.find({
                deleted: false
            });

            let promises = articles.map(async article => {
                return article.populate({path: 'author', model: 'User'}).execPopulate();
            });

            articles = await Promise.all(promises);

            articles = articles.sort((a, b) => {
                return new Date(b.date_created) - new Date(a.date_created);
            });

            res.status(200);
            res.json(articles);
        } catch (e) {
            console.log(e);
            res.status(500);
            res.json({error: 'Could not get all articles.'});
        }
    },
    create: async (req, res) => {
        let validation = await req.Validate.check({
            'title': 'required|min:3|max:30',
            'body': 'required|min:30|max:1000'
        });

        if (validation.passed) {
            let article = new Article({
                title: req.body.title,
                body: req.body.body,
                author: req.payload._id
            });

            try {
                let user = await User.findById(req.payload._id);
                user.articles.push(article._id);

                await user.save();
                await article.save();

                res.status(200);
                res.json(article);
            } catch (e) {
                res.status(500);
                res.json({message: 'Internal server error.'});
                return;
            }
        } else {
            res.status(400);
            console.log(validation.errors);
            res.json({errors: validation.errors});
        }
    },
    update: async (req, res) => {
        let validation = await req.Validate.check({
            'title': 'required|min:3|max:30',
            'body': 'required|min:30|max:1000'
        });

        if (validation.passed) {
            let article;

            try {
                article = await Article.findById(req.params.id);

                article.title = req.body.title;
                article.body = req.body.body;
                article.date_updated = req.body.date_updated;
                await article.save();

                res.status(200);
                res.json(article);
            } catch (e) {
                console.log(e);
                res.status(404);
                res.json({errors: ['Could not find that article.']});
            }
        } else {
            res.status(400);
            res.json({errors: validation.errors});
        }
    },
    delete: async (req, res) => {
        let article;

        try {
            article = await Article.findById(req.params.id);

            article.deleted = true;
            await article.save();

            res.status(200);
            res.json(article);
        } catch (e) {
            console.log(e);
            res.status(404);
            res.json({error: 'Could not find that article.'});
        }
    }
};
