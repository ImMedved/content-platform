/*
Reaction API
*/

import client from "./client";
import { unwrapApiResponse } from "./response";

export async function addReaction(postId) {
    const res = await client.post("/reactions", { postId });
    return unwrapApiResponse(res);
}

export async function getReactions(postId) {
    const res = await client.get(`/reactions/${postId}`);
    return unwrapApiResponse(res);
}
