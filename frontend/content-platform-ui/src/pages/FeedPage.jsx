/*
Feed page
- show posts
*/

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getPosts } from "../api/post";
import { getApiErrorMessage } from "../api/response";
import PostCard from "../components/PostCard";

function FeedPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const location = useLocation();

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);
        setError("");
        console.info("[feed] loading posts");

        try {
            const res = await getPosts();
            console.info("[feed] posts response", res);

            if (!Array.isArray(res)) {
                throw new Error("Posts response is not an array");
            }

            setPosts(res);
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[feed] failed", err);
            setError(message);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h2>Feed</h2>

            {location.state?.success && <p>{location.state.success}</p>}
            {loading && <p>Loading posts...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && posts.length === 0 && <p>No posts yet.</p>}

            {posts.map(p => (
                <PostCard key={p.id} post={p} />
            ))}
        </div>
    );
}

export default FeedPage;
