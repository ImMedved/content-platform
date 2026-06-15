/*
Post card
*/

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getComments, createComment } from "../api/comments";
import { addReaction, getReactions } from "../api/reactions";
import { getApiErrorMessage } from "../api/response";

function PostCard({ post }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [reactions, setReactions] = useState([]);
    const [commentLoading, setCommentLoading] = useState(false);
    const [reactionLoading, setReactionLoading] = useState(false);
    const [commentError, setCommentError] = useState("");
    const [reactionError, setReactionError] = useState("");

    useEffect(() => {
        if (!post?.id) {
            console.warn("[post-card] missing post id", post);
            return;
        }

        loadComments();
        loadReactions();
    }, [post?.id]);

    async function loadComments() {
        try {
            console.info("[post-card] loading comments", { postId: post.id });
            const res = await getComments(post.id);
            console.info("[post-card] comments response", res);
            setComments(Array.isArray(res) ? res : []);
            setCommentError("");
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[post-card] comments failed", err);
            setCommentError(message);
            setComments([]);
        }
    }

    async function loadReactions() {
        try {
            console.info("[post-card] loading reactions", { postId: post.id });
            const res = await getReactions(post.id);
            console.info("[post-card] reactions response", res);
            setReactions(Array.isArray(res) ? res : []);
            setReactionError("");
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[post-card] reactions failed", err);
            setReactionError(message);
            setReactions([]);
        }
    }

    async function handleComment() {
        setCommentLoading(true);
        setCommentError("");

        try {
            await createComment({
                postId: post.id,
                content: text
            });

            console.info("[post-card] comment created", { postId: post.id });
            setText("");
            await loadComments();
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[post-card] comment failed", err);
            setCommentError(message);
        } finally {
            setCommentLoading(false);
        }
    }

    async function handleLike() {
        setReactionLoading(true);
        setReactionError("");

        try {
            await addReaction(post.id);
            console.info("[post-card] reaction created", { postId: post.id });
            await loadReactions();
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[post-card] reaction failed", err);
            setReactionError(message);
        } finally {
            setReactionLoading(false);
        }
    }

    function renderContentItem(item) {
        const itemType = item.content_type || item.type;
        const textValue = item.text_content || (itemType === "text" ? item.value : "");
        const mediaUrl = item.content_url || (itemType !== "text" ? item.value : "");
        const key = item.id || `${itemType}-${mediaUrl || textValue}`;

        if (itemType === "image" && mediaUrl) {
            return <img key={key} src={mediaUrl} alt="" style={{ maxWidth: "100%" }} />;
        }

        if (itemType === "video" && mediaUrl) {
            return <video key={key} src={mediaUrl} controls style={{ maxWidth: "100%" }} />;
        }

        if (textValue) {
            return <p key={key}>{textValue}</p>;
        }

        return null;
    }

    return (
        <div style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <h3 style={{ margin: 0 }}>
                    <Link to={`/posts/${post.id}`}>{post.title || `Post #${post.id}`}</Link>
                </h3>

                {post.author_id && (
                    <Link to={`/users/${post.author_id}`}>Author #{post.author_id}</Link>
                )}
            </div>

            <p>{post.description}</p>

            {Array.isArray(post.content) && post.content.length > 0 && (
                <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                    {post.content.map(renderContentItem)}
                </div>
            )}

            <button onClick={handleLike} disabled={reactionLoading || !post?.id}>
                {reactionLoading ? "Saving..." : "Like"}
            </button>

            <div>
                {reactions.map(r => (
                    <span key={r.type}>
                        {r.type}: {r.count}{" "}
                    </span>
                ))}
            </div>

            {reactionError && <p>{reactionError}</p>}

            <h4>Comments</h4>

            {comments.map(c => (
                <div key={c.id}>{c.content}</div>
            ))}

            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={commentLoading || !post?.id}
            />

            <button onClick={handleComment} disabled={commentLoading || !text.trim() || !post?.id}>
                {commentLoading ? "Saving..." : "Add"}
            </button>

            {commentError && <p>{commentError}</p>}
        </div>
    );
}

export default PostCard;
