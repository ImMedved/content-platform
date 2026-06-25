/*
Post card
*/

import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import CommentItem from "./CommentItem";
import { createComment, deleteComment, getComments } from "../api/comments";
import { addReaction, getReactionUsers, getReactions, removeReaction } from "../api/reactions";
import { purchasePost } from "../api/post";
import { getApiErrorMessage } from "../api/response";
import { useAuth } from "../context/AuthContext";
import { resolveMediaUrl } from "../utils/media";

function PostCard({
    post,
    showOpenButton = true,
    showBackButton = false,
    onBack = null,
    onPurchased = null,
    onTagClick = null,
    compact = false
}) {
    const { user, refreshUser } = useAuth();
    const location = useLocation();
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [reactions, setReactions] = useState([]);
    const [reactionUsers, setReactionUsers] = useState([]);
    const [commentLoading, setCommentLoading] = useState(false);
    const [reactionLoading, setReactionLoading] = useState(false);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [likersLoading, setLikersLoading] = useState(false);
    const [commentError, setCommentError] = useState("");
    const [reactionError, setReactionError] = useState("");
    const [purchaseError, setPurchaseError] = useState("");
    const [hasReacted, setHasReacted] = useState(false);
    const [showLikers, setShowLikers] = useState(false);

    const isAuthor = Number(user?.id) === Number(post?.author_id);
    const isLocked = Boolean(post?.is_locked);
    const canViewContent = Boolean(post?.can_view_content);
    const postLinkState = {
        from: location.pathname + location.search,
        scrollY: window.scrollY
    };

    useEffect(() => {
        if (!post?.id || isLocked) {
            setComments([]);
            setReactions([]);
            setReactionUsers([]);
            return;
        }

        loadComments();
        loadReactions();
    }, [post?.id, isLocked]);

    async function loadComments() {
        try {
            const res = await getComments(post.id);
            setComments(Array.isArray(res) ? res : []);
            setCommentError("");
        } catch (err) {
            setCommentError(getApiErrorMessage(err));
            setComments([]);
        }
    }

    async function loadReactions() {
        try {
            const res = await getReactions(post.id);
            setReactions(Array.isArray(res) ? res : []);
            setReactionError("");
        } catch (err) {
            setReactionError(getApiErrorMessage(err));
            setReactions([]);
        }
    }

    async function loadReactionUsers() {
        setLikersLoading(true);

        try {
            const data = await getReactionUsers(post.id);
            setReactionUsers(Array.isArray(data) ? data : []);
            setReactionError("");
        } catch (err) {
            setReactionError(getApiErrorMessage(err));
            setReactionUsers([]);
        } finally {
            setLikersLoading(false);
        }
    }

    async function handleComment() {
        setCommentLoading(true);
        setCommentError("");

        try {
            await createComment({
                postId: post.id,
                content: text.trim()
            });

            setText("");
            await loadComments();
        } catch (err) {
            setCommentError(getApiErrorMessage(err));
        } finally {
            setCommentLoading(false);
        }
    }

    async function handleLike() {
        setReactionLoading(true);
        setReactionError("");

        try {
            await addReaction(post.id);
            setHasReacted(true);
            await loadReactions();
            if (showLikers) {
                await loadReactionUsers();
            }
        } catch (err) {
            setReactionError(getApiErrorMessage(err));
        } finally {
            setReactionLoading(false);
        }
    }

    async function handleRemoveReaction() {
        setReactionLoading(true);
        setReactionError("");

        try {
            await removeReaction(post.id);
            setHasReacted(false);
            await loadReactions();
            if (showLikers) {
                await loadReactionUsers();
            }
        } catch (err) {
            setReactionError(getApiErrorMessage(err));
        } finally {
            setReactionLoading(false);
        }
    }

    async function handleDeleteComment(commentId) {
        setCommentLoading(true);
        setCommentError("");

        try {
            await deleteComment(commentId);
            await loadComments();
        } catch (err) {
            setCommentError(getApiErrorMessage(err));
        } finally {
            setCommentLoading(false);
        }
    }

    async function handlePurchase() {
        setPurchaseLoading(true);
        setPurchaseError("");

        try {
            await purchasePost(post.id);
            await refreshUser();
            if (typeof onPurchased === "function") {
                await onPurchased();
            }
        } catch (err) {
            setPurchaseError(getApiErrorMessage(err));
        } finally {
            setPurchaseLoading(false);
        }
    }

    async function handleToggleLikers() {
        const nextState = !showLikers;
        setShowLikers(nextState);

        if (nextState) {
            await loadReactionUsers();
        }
    }

    function renderContentItem(item) {
        const itemType = item.content_type || item.type;
        const textValue = item.text_content || (itemType === "text" ? item.value : "");
        const mediaUrl = item.content_url || (itemType !== "text" ? item.value : "");
        const key = item.id || `${itemType}-${mediaUrl || textValue}`;

        if (itemType === "image" && mediaUrl) {
            return (
                <div key={key} className="post-card__media">
                    <img src={resolveMediaUrl(mediaUrl)} alt="" />
                </div>
            );
        }

        if (itemType === "video" && mediaUrl) {
            return (
                <div key={key} className="post-card__media">
                    <video src={resolveMediaUrl(mediaUrl)} controls />
                </div>
            );
        }

        if (textValue) {
            return <p key={key}>{textValue}</p>;
        }

        return null;
    }

    return (
        <article className={`card post-card${compact ? " post-card--compact" : ""}`}>
            {showBackButton && onBack && (
                <div className="post-card__toolbar">
                    <button className="btn btn--secondary" onClick={onBack}>
                        Back to feed
                    </button>
                </div>
            )}

            <div className="post-card__head">
                <div className="post-card__title-row">
                    <div className="post-card__identity">
                        <img
                            className="avatar avatar--md"
                            src={resolveMediaUrl(post.author_avatar_url)}
                            alt=""
                        />

                        <div>
                            <h2 className="post-card__title">
                                <Link to={`/posts/${post.id}`} state={postLinkState}>
                                    {post.title || `Post #${post.id}`}
                                </Link>
                            </h2>

                            {post.author_id && (
                                <Link className="post-card__author-link" to={`/users/${post.author_id}`}>
                                    {post.authorName || post.author_username || `User #${post.author_id}`}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="post-card__meta">
                    <span>{post.created_at ? new Date(post.created_at).toLocaleString() : ""}</span>
                    {post.access_type && <span>Access: {post.access_type}</span>}
                    {typeof post.price === "number" && post.access_type === "paid" && (
                        <span>Price: {post.price}</span>
                    )}
                </div>

                {Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div className="tag-row">
                        {post.tags.map((tag) => (
                            <button
                                key={tag}
                                className="tag-chip"
                                onClick={() => onTagClick && onTagClick(tag)}
                                disabled={!onTagClick}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="post-card__content">
                {post.description && <p className={compact ? "post-card__description-preview" : ""}>{post.description}</p>}

                {canViewContent ? (
                    <div className="post-card__content-items">
                        {Array.isArray(post.content) && post.content.length > 0
                            ? post.content.map(renderContentItem)
                            : <p>Post content is empty.</p>}
                    </div>
                ) : (
                    <div className="muted-box">
                        This is a paid post. Purchase it to unlock the content.
                    </div>
                )}
            </div>

            <div className="post-card__actions">
                {canViewContent ? (
                    <>
                        <button
                            className="btn btn--secondary"
                            onClick={handleLike}
                            disabled={reactionLoading || !post?.id}
                        >
                            Like
                        </button>

                        <button
                            className="btn btn--secondary"
                            onClick={handleRemoveReaction}
                            disabled={reactionLoading || !post?.id || !hasReacted}
                        >
                            Remove reaction
                        </button>
                    </>
                ) : (
                    <button
                        className="btn btn--primary"
                        onClick={handlePurchase}
                        disabled={purchaseLoading}
                    >
                        {purchaseLoading ? "Purchasing..." : `Buy for ${post.price}`}
                    </button>
                )}

                {showOpenButton && (
                    <Link className="btn btn--secondary" to={`/posts/${post.id}`} state={postLinkState}>
                        Open post
                    </Link>
                )}

                {isAuthor && canViewContent && (
                    <button className="btn btn--secondary" onClick={handleToggleLikers}>
                        {showLikers ? "Hide likers" : "View likers"}
                    </button>
                )}

                <div className="post-card__stats">
                    {reactions.length > 0
                        ? reactions.map((item) => `${item.type}: ${item.count}`).join(" | ")
                        : "No reactions yet"}
                </div>
            </div>

            {purchaseError && <div className="post-card__message muted-box">{purchaseError}</div>}
            {reactionError && <div className="post-card__message muted-box">{reactionError}</div>}

            {showLikers && (
                <div className="post-card__likers">
                    {likersLoading && <div className="muted-box">Loading likers...</div>}

                    {!likersLoading && reactionUsers.length === 0 && (
                        <div className="muted-box">No likes yet.</div>
                    )}

                    <div className="user-grid user-grid--compact">
                        {reactionUsers.map((item) => (
                            <Link key={`${item.id}-${item.created_at}`} className="user-card" to={`/users/${item.id}`}>
                                <img
                                    className="avatar avatar--sm"
                                    src={resolveMediaUrl(item.avatar_url)}
                                    alt=""
                                />
                                <div>
                                    <div className="user-card__name">
                                        {item.display_name || item.username}
                                    </div>
                                    <div className="user-card__meta">@{item.username}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {!canViewContent && (
                <div className="post-card__message muted-box">
                    Comments are unavailable until you purchase this post.
                </div>
            )}

            {canViewContent && !compact && (
                <div className="post-card__comments">
                    <h3 className="comments-title">Comments</h3>

                    {comments.length > 0 ? (
                        <div className="comment-list">
                            {comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    actions={
                                        Number(user?.id) === Number(comment.author_id) ? (
                                            <button
                                                className="btn btn--danger"
                                                onClick={() => handleDeleteComment(comment.id)}
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
            )}
        </article>
    );
}

export default PostCard;
