/*
Register page
*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register as registerApi } from "../api/auth";
import { getApiErrorMessage } from "../api/response";

function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccess("");
        console.info("[register] submit", { username, email });

        try {
            const res = await registerApi({ username, email, password });
            console.info("[register] response", res);
            setSuccess("Registration successful. Redirecting to login...");
            navigate("/login", {
                replace: true,
                state: { success: "Registration successful. Please log in." }
            });
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[register] failed", err);
            setError(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div>
            <h2>Register</h2>

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={submitting}
                />

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
                    {submitting ? "Registering..." : "Register"}
                </button>
            </form>

            {error && <p>{error}</p>}
            {success && <p>{success}</p>}
        </div>
    );
}

export default RegisterPage;
