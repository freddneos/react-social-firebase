const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
const firebase = require('firebase');
const config = require('../config');

// Initialize Firebase
firebase.initializeApp(config);
admin.initializeApp();

const db = admin.firestore();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
app.get('/helloWorld', (req, res) => {
    res.send("Hello from world!");
});

app.get('/posts', (req, res) => {
    db.collection('posts').orderBy('createdAt', 'desc').get()
        .then(data => {
            let posts = [];
            data.forEach(post => {
                posts.push({
                    postId: post.id,
                    body: post.data().body,
                    likes: post.data().likes,
                    userHandle: post.data().userHandle,
                    createdAt: post.data().createdAt

                })
            })
            return res.status(200).json(posts)
        }).catch(err => {
            console.error(`Error on request : ${err}`)
            return err
        })
})

app.post('/posts', (req, res) => {

    const newPost = {
        body: req.body.body,
        title: req.body.title,
        likes: req.body.likes,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    }

    db.collection('posts').add(newPost)
        .then(data => {
            return res.json({ message: `document ${data.id} created successfully!` })
        }).catch(err => {
            console.error(err);
            return res.status(500).json({ error: err })
        })
})

//signup route

app.post('/signup', (req, res) => {
    let token, userId;
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ handle: 'this handle already taken' })
            } else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        }).then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        }).then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            }
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        }).then(() => {
            return res.status(201).json({ token })
        }).catch(err => {
            console.log(err)
            return res.status(500).json({ error: err.code })
        })

})

exports.api = functions.https.onRequest(app);