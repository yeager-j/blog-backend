let express = require('express');
let router = express.Router();
let jwt = require('express-jwt');
let config = require('../../config/config.json');
let authentication = jwt({
    secret: config.secret_key,
    userProperty: 'payload'
});
let authorization = require('../util/authorization');
let article = require('../controllers/article.controller');

router.get('/', article.getAll);
router.get('/:id', article.get);
router.post('/', authentication, article.create);
router.patch('/:id', authentication, article.update);
router.delete('/:id', authentication, article.delete);

module.exports = router;
