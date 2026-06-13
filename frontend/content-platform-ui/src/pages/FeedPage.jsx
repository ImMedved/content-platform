/*
Feed page
- show posts
*/

import { useEffect, useState } from "react";
import { getPosts } from "../v1/api/posts";
import PostCard from "../components/PostCard";

function FeedPage() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        const res = await getPosts();
        setPosts(res.data);
    }

    return (
        <div>
            <h2>Feed</h2>

            {posts.map(p => (
                <PostCard key={p.id} post={p} />
            ))}
        </div>
    );
}

export default FeedPage;