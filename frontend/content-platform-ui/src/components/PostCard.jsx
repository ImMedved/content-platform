/*
Post card
*/

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import CommentItem from "./CommentItem";
import { createComment, deleteComment, getComments } from "../api/comments";
import { addReaction, getReactions, removeReaction } from "../api/reactions";
import { getApiErrorMessage } from "../api/response";
import { useAuth } from "../context/AuthContext";

function PostCard({ post }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [reactions, setReactions] = useState([]);
    const [commentLoading, setCommentLoading] = useState(false);
    const [reactionLoading, setReactionLoading] = useState(false);
    const [commentError, setCommentError] = useState("");
    const [reactionError, setReactionError] = useState("");
    const [hasReacted, setHasReacted] = useState(false);

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
            setHasReacted(true);
            await loadReactions();
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[post-card] reaction failed", err);
            setReactionError(message);
        } finally {
            setReactionLoading(false);
        }
    }

    async function handleRemoveReaction() {
        setReactionLoading(true);
        setReactionError("");

        try {
            await removeReaction(post.id);
            console.info("[post-card] reaction removed", { postId: post.id });
            setHasReacted(false);
            await loadReactions();
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[post-card] reaction removal failed", err);
            setReactionError(message);
        } finally {
            setReactionLoading(false);
        }
    }

    async function handleDeleteComment(commentId) {
        setCommentLoading(true);
        setCommentError("");

        try {
            await deleteComment(commentId);
            console.info("[post-card] comment deleted", { commentId, postId: post.id });
            await loadComments();
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[post-card] comment deletion failed", err);
            setCommentError(message);
        } finally {
            setCommentLoading(false);
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
        <article className="card post-card">
            <div className="post-card__head">
                <div className="post-card__title-row">
                    <h2 className="post-card__title">
                        <Link to={`/posts/${post.id}`}>{post.title || `Post #${post.id}`}</Link>
                    </h2>

                    {post.author_id && (
                        <Link className="post-card__author-link" to={`/users/${post.author_id}`}>
                            {post.authorName || post.author_username || `User #${post.author_id}`}
                        </Link>
                    )}
                </div>

                <div className="post-card__meta">
                    <span>
                        {post.created_at ? new Date(post.created_at).toLocaleString() : ""}
                    </span>
                    {post.access_type && <span>Access: {post.access_type}</span>}
                    {typeof post.price === "number" && post.access_type === "paid" && (
                        <span>Price: {post.price}</span>
                    )}
                </div>
            </div>

            <div className="post-card__content">
                {post.description && <p>{post.description}</p>}

                <div className="post-card__content-items">
                    {Array.isArray(post.content) && post.content.length > 0
                        ? post.content.map(renderContentItem)
                        : <p>Post content is empty.</p>}
                </div>
            </div>

            <div className="post-card__actions">
                <button
                    className="btn btn--secondary"
                    onClick={handleLike}
                    disabled={reactionLoading || !post?.id}
                >
                    {reactionLoading ? "Saving..." : "Like"}
                </button>

                <button
                    className="btn btn--secondary"
                    onClick={handleRemoveReaction}
                    disabled={reactionLoading || !post?.id || !hasReacted}
                >
                    {reactionLoading ? "Saving..." : "Remove reaction"}
                </button>

                <Link className="btn btn--secondary" to={`/posts/${post.id}`}>
                    Open post
                </Link>

                <div className="post-card__stats">
                    {reactions.length > 0
                        ? reactions.map((r) => `${r.type}: ${r.count}`).join(" • ")
                        : "No reactions yet"}
                </div>
            </div>

            <div className="post-card__comments">
                <h3 className="comments-title">Comments</h3>

                {comments.length > 0 ? (
                    <div className="comment-list">
                        {comments.map((c) => (
                            <CommentItem
                                key={c.id}
                                comment={c}
                                actions={
                                    user?.id === c.author_id ? (
                                        <button
                                            className="btn btn--danger"
                                            onClick={() => handleDeleteComment(c.id)}
                                            disabled={commentLoading}
                                        >
                                            Delete
                                        </button>
                                    ) : null
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <div className="muted-box">No comments yet.</div>
                )}

                {reactionError && <div className="muted-box">{reactionError}</div>}
                {commentError && <div className="muted-box">{commentError}</div>}

                <div className="comment-form">
                    <div className="comment-form__row">
                        <textarea
                            className="field__textarea"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={commentLoading || !post?.id}
                            placeholder="Write a comment"
                        />
                    </div>

                    <button
                        className="btn btn--primary"
                        onClick={handleComment}
                        disabled={commentLoading || !text.trim() || !post?.id}
                    >
                        {commentLoading ? "Saving..." : "Add comment"}
                    </button>
                </div>
            </div>
        </article>
    );
}

export default PostCard;
