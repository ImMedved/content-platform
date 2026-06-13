/*
Create post page
*/

import { useState } from "react";
import { createPost } from "../api/v1/posts";

function CreatePostPage() {
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");

    async function handleCreate() {
        await createPost({
            title,
            content: [{ type: "text", value: text }],
            access: { type: "free" }
        });

        setTitle("");
        setText("");
        alert("created");
    }

    return (
        <div>
            <h2>Create Post</h2>

            <input
                placeholder="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
                placeholder="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <button onClick={handleCreate}>Create</button>
        </div>
    );
}

export default CreatePostPage;