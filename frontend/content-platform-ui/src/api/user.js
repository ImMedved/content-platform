/*
User API
*/

import client from "./client";

export async function getMe() {
    const res = await client.get("/users/me");
    return res.data;
}