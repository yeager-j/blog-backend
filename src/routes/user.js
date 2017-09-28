let express = require('express');
let router = express.Router();
let jwt = require('express-jwt');
let config = require('../../config/config.json');
let authentication = jwt({
    secret: config.secret_key,
    userProperty: 'payload'
});
let authorization = require('../util/authorization');
let user = require('../controllers/user.controller');

router.get('/', user.getAll);
router.get('/:id', user.get);
router.post('/', user.create);
router.post('/login', user.login);
router.patch('/', authentication, user.update);
router.patch('/change-password', authentication, user.changePassword);
router.patch('/:id', authentication, authorization(1), user.update);
router.delete('/:id', authentication, authorization(1), user.delete);

module.exports = router;
