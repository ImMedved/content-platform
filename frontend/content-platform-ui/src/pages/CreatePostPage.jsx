/*
Create post page
*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/post";
import { getApiErrorMessage } from "../api/response";

function CreatePostPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [text, setText] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [accessType, setAccessType] = useState("free");
    const [price, setPrice] = useState("0");
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
            const content = [];

            if (text.trim()) {
                content.push({ type: "text", value: text.trim() });
            }

            if (imageUrl.trim()) {
                content.push({ type: "image", value: imageUrl.trim() });
            }

            const result = await createPost({
                title,
                description,
                content,
                access: {
                    type: accessType,
                    price: Number(price || 0)
                }
            });

            console.info("[post-create] response", result);
            setTitle("");
            setDescription("");
            setText("");
            setImageUrl("");
            setSuccess("Post created. Redirecting to feed...");
            navigate(`/posts/${result.postId}`, { replace: true });
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[post-create] failed", err);
            setError(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <h1 className="page-title">Create post</h1>
            <p className="page-subtitle">Publish new content and choose access settings.</p>

            <div className="card">
                <div className="card__body">
                    <form className="form-grid" onSubmit={handleCreate}>
                        <label className="field">
                            <span className="field__label">Title</span>
                            <input
                                className="field__input"
                                placeholder="Post title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span className="field__label">Description</span>
                            <input
                                className="field__input"
                                placeholder="Short description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={submitting}
                            />
                        </label>

                        <div className="form-grid form-grid--two">
                            <label className="field">
                                <span className="field__label">Access type</span>
                                <select
                                    className="field__select"
                                    value={accessType}
                                    onChange={(e) => setAccessType(e.target.value)}
                                    disabled={submitting}
                                >
                                    <option value="free">Free</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </label>

                            <label className="field">
                                <span className="field__label">Price</span>
                                <input
                                    className="field__input"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    disabled={submitting || accessType !== "paid"}
                                />
                            </label>
                        </div>

                        <label className="field">
                            <span className="field__label">Text content</span>
                            <textarea
                                className="field__textarea"
                                placeholder="Write your post text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={submitting}
                            />
                        </label>

                        <label className="field">
                            <span className="field__label">Image URL</span>
                            <input
                                className="field__input"
                                placeholder="https://..."
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                disabled={submitting}
                            />
                        </label>

                        {error && <div className="muted-box">{error}</div>}
                        {success && <div className="muted-box">{success}</div>}

                        <div className="form-actions">
                            <button className="btn btn--primary" type="submit" disabled={submitting}>
                                {submitting ? "Publishing..." : "Publish"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default CreatePostPage;
