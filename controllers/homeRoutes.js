const router = require('express').Router();
const { User, Posts } = require('../models');
const withAuth = require('../utils/auth')

router.get('/', async (req, res) => {
    try {
        const postData = await Posts.findAll({
            include: [{
                model: User,
                attributes: ['name'],
            }],
        });

        const posts = postData.map((posts) => posts
        .get({ plain: true }))
        .map((post) => ({ ...post, isEditable: post.user_id === req.session.user_id }));

        res.render('homepage', {
            posts,
            logged_in: req.session.logged_in,
        });

        console.log(`session:${req.session.user_id}`);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/profile', withAuth, async (req, res) => {
    try {
        const userData = await Posts.findAll({
            where: {
                user_id: req.session.user_id
            },
        });

        const user = userData.map((posts) => 
        posts
            .get({ plain: true }))
            .map((post) => ({ ...post, isEditable: post.user_id === req.session.user_id }));

        res.render('profile', {
            user,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        res.status(500).json(err)
    }
});

router.get('/login', (req, res) => {
    if (req.session.logged_in) {
        res.redirect('/profile');
        return;
    }
    res.render('login');
});

module.exports = router;