const sequelize = require('../config/connection');
const { User, Post } = require('../models');
const postSeedData = require('./posts.json');
const userSeedData = require('./users.json')

const seedDatabase = async () => {
    await sequelize.sync({ force: true });

    const users = await User.bulkCreate(userSeedData, { individualHooks: true, returning: true, });
    const blogPost = await Post.bulkCreate(postSeedData);

    for (const post of blogPost) {
        await Post.create({ ...post, user_id: users.id, });
    }

    process.exit(0);
};

seedDatabase();