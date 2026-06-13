/*
Comment API
*/

import client from "./client";

export async function createComment(data) {
    const res = await client.post("/comments", data);
    return res.data;
}

export async function getComments(postId) {
    const res = await client.get(`/comments/post/${postId}`);
    return res.data;
}