/*
Feed page
- show posts
*/

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getFeed } from "../api/feed";
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
        console.info("[feed] loading personalized feed");

        try {
            const res = await getFeed();
            console.info("[feed] feed response", res);

            if (!Array.isArray(res)) {
                throw new Error("Feed response is not an array");
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
        <>
            <h1 className="page-title">Feed</h1>
            <p className="page-subtitle">Recent publications from users you follow.</p>

            <div className="feed-layout">
                <section className="post-list">
                    {location.state?.success && (
                        <div className="muted-box">{location.state.success}</div>
                    )}
                    {loading && <div className="muted-box">Loading posts...</div>}
                    {error && <div className="muted-box">{error}</div>}
                    {!loading && !error && posts.length === 0 && (
                        <div className="center-empty card">
                            <div className="card__body">
                                Your feed is empty. Follow another user or publish your first post.
                            </div>
                        </div>
                    )}

                    {posts.map((p) => (
                        <PostCard key={p.id} post={p} />
                    ))}
                </section>

                <aside className="feed-sidebar">
                    <div className="card sidebar-block">
                        <h3 className="sidebar-title">Feed state</h3>
                        <p className="sidebar-text">
                            Posts loaded: {posts.length}
                        </p>
                    </div>

                    <div className="card sidebar-block">
                        <button className="btn btn--secondary btn--block" onClick={load}>
                            Refresh feed
                        </button>
                    </div>
                </aside>
            </div>
        </>
    );
}

export default FeedPage;
