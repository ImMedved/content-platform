/*
Reaction API
*/

import client from "./client";

export async function addReaction(postId) {
    return client.post("/reactions", { postId });
}

export async function getReactions(postId) {
    const res = await client.get(`/reactions/${postId}`);
    return res.data;
}