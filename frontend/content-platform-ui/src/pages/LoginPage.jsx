/*
Login page
*/

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { login as loginApi } from "../api/auth";
import { getApiErrorMessage } from "../api/response";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const auth = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        console.info("[login] submit", { email });

        try {
            const res = await loginApi({ email, password });
            console.info("[login] response", res);

            const token = res.token;
            auth.login(token);
            console.info("[login] redirecting to feed");
            navigate("/");
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[login] failed", err);
            setError(message);
        } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        if (location.state?.success) {
            setError("");
        }
    }, [location.state]);

    useEffect(() => {
        if (location.state?.error) {
            setError(location.state.error);
        }
    }, [location.state]);

    useEffect(() => {
        if (auth.token) {
            console.info("[login] token present, redirecting");
            navigate("/");
        }
    }, [auth.token, navigate]);

    return (
        <div>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                />

                <input
                    placeholder="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                />

                <button type="submit" disabled={submitting}>
                    {submitting ? "Logging in..." : "Login"}
                </button>
            </form>

            {error && <p>{error}</p>}
            {location.state?.success && !error && <p>{location.state.success}</p>}
            {auth.authError && !error && <p>{auth.authError}</p>}
        </div>
    );
}

export default LoginPage;
