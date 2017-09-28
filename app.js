let http = require('http');
let express = require('express');
let path = require('path');
let logger = require('morgan');
let bodyParser = require('body-parser');
let validator = require('./src/util/validator');

require('./src/models/db.model');
require('./src/models/article.model');
require('./src/models/user.model');

let article = require('./src/routes/article');
let comment = require('./src/routes/comment');
let users = require('./src/routes/user');


let app = express();
let server = http.createServer(app);
app.set('port', 3000);
server.listen(3000);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator(app));
// app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE, PATCH");
    next();
});

app.use('/api/articles', article);
app.use('/api/comments', comment);
app.use('/api/users', users);

module.exports = app;
