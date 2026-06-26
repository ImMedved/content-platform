/*
Auth context
- token
- user
- auto load user
*/

import { createContext, useContext, useState, useEffect } from "react";
import { getMyProfile } from "../api/user";
import { getApiErrorMessage } from "../api/response";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState("");

    async function loadUser() {
        console.info("[auth] loading current user");

        try {
            const profileData = await getMyProfile();
            setUser(profileData?.user || null);
            setAuthError("");
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[auth] failed to load current user", err);
            setAuthError(message);
            logout();
        } finally {
            setLoading(false);
        }
    }

    function login(nextToken) {
        if (!nextToken || typeof nextToken !== "string") {
            throw new Error("Login response does not include a valid token");
        }

        localStorage.setItem("token", nextToken);
        setToken(nextToken);
        setLoading(true);
        setAuthError("");
    }

    function logout() {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setLoading(false);
    }

    async function refreshUser() {
        if (!token) {
            return;
        }

        await loadUser();
    }

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{
            token,
            user,
            login,
            logout,
            refreshUser,
            loading,
            authError
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
