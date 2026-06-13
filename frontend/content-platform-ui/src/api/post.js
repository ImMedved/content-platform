/*
Post API
*/

import client from "./client";
import { unwrapApiResponse } from "./response";

export async function createPost(data) {
    const res = await client.post("/posts", data);
    return unwrapApiResponse(res);
}

export async function getPosts() {
    const res = await client.get("/posts");
    return unwrapApiResponse(res);
}

export async function getPost(id) {
    const res = await client.get(`/posts/${id}`);
    return unwrapApiResponse(res);
}
