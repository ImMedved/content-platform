/*
Create post page
*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/post";
import { getApiErrorMessage } from "../api/response";

function CreatePostPage() {
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    async function handleCreate(e) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccess("");
        console.info("[post-create] submit", { title });

        try {
            const result = await createPost({
                title,
                content: [{ type: "text", value: text }],
                access: { type: "free" }
            });

            console.info("[post-create] response", result);
            setTitle("");
            setText("");
            setSuccess("Post created. Redirecting to feed...");
            navigate("/", {
                replace: true,
                state: { success: "Post created successfully." }
            });
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[post-create] failed", err);
            setError(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div>
            <h2>Create Post</h2>

            <form onSubmit={handleCreate}>
                <input
                    placeholder="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={submitting}
                />

                <textarea
                    placeholder="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={submitting}
                />

                <button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create"}
                </button>
            </form>

            {error && <p>{error}</p>}
            {success && <p>{success}</p>}
        </div>
    );
}

export default CreatePostPage;
