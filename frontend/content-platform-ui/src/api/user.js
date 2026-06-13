/*
User API
*/

import client from "./client";
import { unwrapApiResponse } from "./response";

export async function getMe() {
    const res = await client.get("/users/me");
    return unwrapApiResponse(res);
}
