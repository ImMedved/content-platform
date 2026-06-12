/*
Post service
- create post
- fetch post
*/

const postRepo = require("../repositories/postRepository");

// create post
async function createPost(userId, data) {
    const { title, description, content, access } = data;

    const postId = await postRepo.createPost(userId, title, description);

    if (content) {
        await postRepo.addContent(postId, content);
    }

    await postRepo.setAccess(postId, access || { type: "free" });

    return { postId };
}

// get post
async function getPost(id) {
    return await postRepo.getPostById(id);
}

// list
async function listPosts() {
    return await postRepo.listPosts();
}

module.exports = {
    createPost,
    getPost,
    listPosts
};