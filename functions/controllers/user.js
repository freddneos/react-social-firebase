const { db, admin } = require('../utils/admin');

class User {

    signup(req, res) {
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

    }

    login(req, res) {
        const user = {
            email: req.body.email,
            password: req.body.password
        }

        firebase.auth().signInWithEmailAndPassword(user.email, user.password)
            .then(data => {
                return data.user.getIdToken();
            }).then(token => {
                return res.json({ token })
            }).catch(err => {
                console.error(err)
                res.status(500).json({ error: err.code })
            })

    }
}

module.exports = new User()