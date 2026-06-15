/*
User API
*/

import client from "./client";
import { unwrapApiResponse } from "./response";

export async function getMe() {
    const res = await client.get("/users/me");
    return unwrapApiResponse(res);
}

export async function getUser(id) {
    const res = await client.get(`/users/${id}`);
    return unwrapApiResponse(res);
}

export async function getMyFollowing() {
    const res = await client.get("/users/me/following");
    return unwrapApiResponse(res);
}

export async function getMyFollowers() {
    const res = await client.get("/users/me/followers");
    return unwrapApiResponse(res);
}

export async function getUserFollowing(id) {
    const res = await client.get(`/users/${id}/following`);
    return unwrapApiResponse(res);
}

export async function getUserFollowers(id) {
    const res = await client.get(`/users/${id}/followers`);
    return unwrapApiResponse(res);
}
