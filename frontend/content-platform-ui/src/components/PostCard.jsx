/*
Post card
*/

import { useEffect, useState } from "react";
import { getComments, createComment } from "../api/comments";
import { addReaction, getReactions } from "../api/reactions";

function PostCard({ post }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [reactions, setReactions] = useState([]);

    useEffect(() => {
        loadComments();
        loadReactions();
    }, []);

    async function loadComments() {
        const res = await getComments(post.id);
        setComments(res.data);
    }

    async function loadReactions() {
        const res = await getReactions(post.id);
        setReactions(res.data);
    }

    async function handleComment() {
        await createComment({
            postId: post.id,
            content: text
        });

        setText("");
        loadComments();
    }

    async function handleLike() {
        await addReaction(post.id);
        loadReactions();
    }

    return (
        <div style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
            <h3>{post.title}</h3>
            <p>{post.description}</p>

            <button onClick={handleLike}>Like</button>

            <div>
                {reactions.map(r => (
                    <span key={r.type}>
                        {r.type}: {r.count}{" "}
                    </span>
                ))}
            </div>

            <h4>Comments</h4>

            {comments.map(c => (
                <div key={c.id}>{c.content}</div>
            ))}

            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <button onClick={handleComment}>Add</button>
        </div>
    );
}

export default PostCard;