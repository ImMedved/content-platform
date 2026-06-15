/*
Post service
- create post
- fetch post
- invalidate feed cache
*/

const postRepo = require("../repositories/postRepository");
const followRepo = require("../repositories/followRepository");
const feedService = require("./feedService");

async function createPost(userId, data) {
    const { title, description, content, access } = data;

    const postId = await postRepo.createPost(userId, title, description);

    if (content) {
        await postRepo.addContent(postId, content);
    }

    await postRepo.setAccess(postId, access || { type: "free" });

    const followers = await followRepo.getFollowers(userId);

    for (const followerId of followers) {
        await feedService.invalidateFeed(followerId);
    }

    return { postId };
}

async function getPost(id) {
    return await postRepo.getPostById(id);
}

async function listPosts(filters = {}) {
    const { limit, authorId } = filters;

    return await postRepo.listPosts(limit || 20, authorId || null);
}

module.exports = {
    createPost,
    getPost,
    listPosts
};
