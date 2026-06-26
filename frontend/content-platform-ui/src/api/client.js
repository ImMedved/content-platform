/*
Axios client
- base config
- attach jwt
*/

import axios from "axios";

function normalizeApiBaseUrl(rawValue) {
    const fallback = "/api/v1";
    const value = String(rawValue || fallback).trim();

    if (!value || value.startsWith("/")) {
        return value || fallback;
    }

    try {
        const url = new URL(value);

        if (typeof window !== "undefined" && window.location.protocol === "https:" && url.protocol === "http:") {
            url.protocol = "https:";
        }

        return url.toString().replace(/\/$/, "");
    } catch {
        return fallback;
    }
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL || "/api/v1");
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

const client = axios.create({
    baseURL: API_BASE_URL
});

// attach token
client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default client;
