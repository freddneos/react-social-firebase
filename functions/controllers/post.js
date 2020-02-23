const { db } = require('../utils/admin')

class Post {
    index(req, res) {
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
    }

    create(req, res) {
        const newPost = {
            body: req.body.body,
            title: req.body.title,
            likes: req.body.likes,
            userHandle: req.user.handle,
            createdAt: new Date().toISOString()
        }

        db.collection('posts').add(newPost)
            .then(data => {
                return res.json({ message: `document ${data.id} created successfully!` })
            }).catch(err => {
                console.error(err);
                return res.status(500).json({ error: err })
            })
    }
}
module.exports = new Post()