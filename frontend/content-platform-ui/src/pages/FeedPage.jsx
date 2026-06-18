/*
Feed page
*/

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getFeed } from "../api/feed";
import { getPosts } from "../api/post";
import { getApiErrorMessage } from "../api/response";
import PostCard from "../components/PostCard";

function FeedPage() {
    const location = useLocation();
    const [followedPosts, setFollowedPosts] = useState([]);
    const [discoverPosts, setDiscoverPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [discoverLoading, setDiscoverLoading] = useState(true);
    const [error, setError] = useState("");
    const [discoverError, setDiscoverError] = useState("");
    const [tagFilter, setTagFilter] = useState("");
    const [appliedTag, setAppliedTag] = useState("");

    useEffect(() => {
        loadFeed();
    }, []);

    useEffect(() => {
        loadDiscover(appliedTag);
    }, [appliedTag]);

    useEffect(() => {
        if (typeof location.state?.restoreScrollY === "number") {
            window.scrollTo({ top: location.state.restoreScrollY, behavior: "auto" });
        }
    }, [location.state]);

    async function loadFeed() {
        setLoading(true);
        setError("");

        try {
            const data = await getFeed();
            setFollowedPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(getApiErrorMessage(err));
            setFollowedPosts([]);
        } finally {
            setLoading(false);
        }
    }

    async function loadDiscover(tag = "") {
        setDiscoverLoading(true);
        setDiscoverError("");

        try {
            const data = await getPosts(tag ? { tag } : {});
            setDiscoverPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            setDiscoverError(getApiErrorMessage(err));
            setDiscoverPosts([]);
        } finally {
            setDiscoverLoading(false);
        }
    }

    async function refreshAll() {
        await Promise.all([loadFeed(), loadDiscover(appliedTag)]);
    }

    function handleTagSubmit(event) {
        event.preventDefault();
        setAppliedTag(tagFilter.trim().toLowerCase());
    }

    return (
        <div className="page-stack">
            <div className="page-heading">
                <div>
                    <h1 className="page-title">Feed</h1>
                    <p className="page-subtitle">Followed posts first, new content right below.</p>
                </div>

                <div className="page-actions">
                    <Link className="btn btn--primary" to="/create">
                        Create post
                    </Link>
                    <button className="btn btn--secondary" onClick={refreshAll}>
                        Refresh
                    </button>
                </div>
            </div>

            {location.state?.success && <div className="muted-box">{location.state.success}</div>}

            <section className="section-stack">
                <div className="section-heading">
                    <h2 className="page-title page-title--section">Following feed</h2>
                </div>

                {loading && <div className="muted-box">Loading posts...</div>}
                {error && <div className="muted-box">{error}</div>}
                {!loading && !error && followedPosts.length === 0 && (
                    <div className="muted-box">
                        Your following feed is empty. Follow a few authors or browse the latest posts below.
                    </div>
                )}

                <div className="post-list">
                    {followedPosts.map((post) => (
                        <PostCard key={`followed-${post.id}`} post={post} onPurchased={loadFeed} onTagClick={setAppliedTag} />
                    ))}
                </div>
            </section>

            <section className="section-stack">
                <div className="section-heading">
                    <h2 className="page-title page-title--section">Latest posts</h2>
                </div>

                <form className="tag-search" onSubmit={handleTagSubmit}>
                    <input
                        className="field__input"
                        placeholder="Search by tag"
                        value={tagFilter}
                        onChange={(event) => setTagFilter(event.target.value)}
                    />
                    <button className="btn btn--secondary" type="submit">
                        Search
                    </button>
                    {appliedTag && (
                        <button className="btn btn--secondary" type="button" onClick={() => {
                            setTagFilter("");
                            setAppliedTag("");
                        }}>
                            Clear
                        </button>
                    )}
                </form>

                {discoverLoading && <div className="muted-box">Loading latest posts...</div>}
                {discoverError && <div className="muted-box">{discoverError}</div>}
                {!discoverLoading && !discoverError && discoverPosts.length === 0 && (
                    <div className="muted-box">No posts match the current tag filter.</div>
                )}

                <div className="post-list">
                    {discoverPosts.map((post) => (
                        <PostCard key={`discover-${post.id}`} post={post} onPurchased={() => loadDiscover(appliedTag)} onTagClick={setAppliedTag} />
                    ))}
                </div>
            </section>
        </div>
    );
}

export default FeedPage;
