import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPost } from "../api/post";
import { getApiErrorMessage } from "../api/response";
import PostCard from "../components/PostCard";
import { normalizePostDetail } from "../utils/post";

function PostPage() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadPost();
    }, [id]);

    async function loadPost() {
        setLoading(true);
        setError("");
        console.info("[post-page] loading post", { id });

        try {
            const response = await getPost(id);
            console.info("[post-page] response", response);
            const normalized = normalizePostDetail(response);

            if (!normalized?.id) {
                throw new Error("Post was not found");
            }

            setPost(normalized);
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[post-page] failed", err);
            setError(message);
            setPost(null);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="post-page">
            <h1 className="page-title">Post</h1>

            {loading && <div className="muted-box">Loading post...</div>}
            {error && <div className="muted-box">{error}</div>}
            {post && !loading && <PostCard post={post} />}
        </div>
    );
}

export default PostPage;
