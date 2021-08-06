const router = require('express').Router();
const { Posts, User } = require('../../models');
const withAuth = require('../../utils/auth');
const bcrypt = require('bcrypt');

//Post routes
router.post('/createPost', withAuth, async (req, res) => {
    try {
        const post = await Posts.create({
            ...req.body,
            user_id: req.session.user_id,
        });

        res.status(200).json(post);
    } catch (err) {
        res.status(400).json(err);
    }
});


router.delete('/delete', withAuth, async (req, res) => {
    try {
        const post = await Posts.destroy({
            where: {
                id: req.body.id,
                user_id: req.session.user_id,
            },
        });

        if (!post) {
            res.status(404).json({ message: 'No post matches that ID.' })
        }

        res.status(200).json(post);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});


router.put('/:id', (req, res) => {
    console.log(req.body);
    Posts.update(
        {
            post_title: req.body.post_title,
            post_body: req.body.post_body,
        },
        {
            where: {
                id: req.body.where,
                user_id: req.session.user_id,
            },
        })
        .then((post) => {
            res.json(post);
        })
        .catch((err) => {
            console.log(err);
            res.json(err);
        });
});

//User routes
router.post('/newUser', async (req, res) => {
    try {
        const userData = req.body;
        newData.password = await bcrypt.hash(req.body.password, 10);
        const newUser = await User.create(userData);

        req.session.save(() => {
            req.session.user_id = newUser.id;
            req.session.logged_in = true;

            res.status(200).json({ user: newUser });
        });

    } catch (err) {
        res.status(400).json(err);
    }
});

router.post('/login', async (req, res) => {
    try {
        const userData = await User.findOne({ where: { email: req.body.email } });

        if (!userData) {
            res.status(400).json({ message: 'No account with that email' });
            return;
        }

        const password = await bcrypt.compare(req.body.password, userData.password);

        if (!password) {
            res.status(400).json({ message: 'Wrong password' });
            return;
        }

        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.logged_in = true;
            res.json({ user: userData})
        });
    } catch (err) {
        res.status(400).json(err);
    }
});


router.post('/logout', (req, res) => {
    if (req.session.logged_in) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});

module.exports = router;