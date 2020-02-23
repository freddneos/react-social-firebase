const functions = require('firebase-functions');
const app = require('express')();
const firebase = require('firebase');
const fbMiddleware = require('./middlewares/fbAuth')
const config = require('./utils/config');

const Post = require('./controllers/post')
const User = require('./controllers/user')

const { db, admin } = require('./utils/admin')
firebase.initializeApp(config);

app.get('/helloWorld', (req, res) => {
    res.send("Hello from world!");
});
//posts
app.get('/posts', Post.index)
app.post('/posts', fbMiddleware, Post.create)

//users , auth
app.post('/signup', User.signup)
app.post('/login', User.login)

exports.api = functions.https.onRequest(app);