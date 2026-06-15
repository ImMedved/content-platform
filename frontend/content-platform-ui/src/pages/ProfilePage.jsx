import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { followUser, unfollowUser } from "../api/follow";
import { getPosts } from "../api/post";
import { getApiErrorMessage } from "../api/response";
import {
    getMe,
    getMyFollowing,
    getUser,
    getUserFollowers,
    getUserFollowing
} from "../api/user";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

function ProfilePage() {
    const { id = "me" } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [myFollowingIds, setMyFollowingIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [error, setError] = useState("");
    const [actionMessage, setActionMessage] = useState("");

    useEffect(() => {
        loadProfile();
    }, [id]);

    async function loadProfile() {
        setLoading(true);
        setError("");
        setActionMessage("");
        console.info("[profile] loading profile", { id });

        try {
            const profileData = id === "me" ? await getMe() : await getUser(id);
            console.info("[profile] user response", profileData);

            if (!profileData?.id) {
                throw new Error("User was not found");
            }

            const [postsData, followersData, followingData, myFollowingData] = await Promise.all([
                getPosts({ authorId: profileData.id }),
                getUserFollowers(profileData.id),
                getUserFollowing(profileData.id),
                getMyFollowing()
            ]);

            console.info("[profile] posts response", postsData);

            setProfile(profileData);
            setPosts(Array.isArray(postsData) ? postsData : []);
            setFollowers(Array.isArray(followersData) ? followersData : []);
            setFollowing(Array.isArray(followingData) ? followingData : []);
            setMyFollowingIds(
                Array.isArray(myFollowingData) ? myFollowingData.map((item) => item.id) : []
            );
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[profile] failed", err);
            setError(message);
            setProfile(null);
            setPosts([]);
            setFollowers([]);
            setFollowing([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleFollowToggle() {
        if (!profile?.id) {
            return;
        }

        setFollowLoading(true);
        setActionMessage("");

        try {
            if (myFollowingIds.includes(profile.id)) {
                await unfollowUser(profile.id);
                setMyFollowingIds((current) => current.filter((item) => item !== profile.id));
                setFollowers((current) =>
                    current.filter((item) => item.id !== currentUser?.id)
                );
                setActionMessage("Unfollowed successfully.");
            } else {
                await followUser(profile.id);
                setMyFollowingIds((current) => [...current, profile.id]);
                if (currentUser) {
                    setFollowers((current) => {
                        if (current.some((item) => item.id === currentUser.id)) {
                            return current;
                        }

                        return [...current, currentUser];
                    });
                }
                setActionMessage("Followed successfully. Feed will show this user's posts.");
            }
        } catch (err) {
            const message = getApiErrorMessage(err);
            console.error("[profile] follow toggle failed", err);
            setError(message);
        } finally {
            setFollowLoading(false);
        }
    }

    const isOwnProfile = profile?.id === currentUser?.id || id === "me";
    const isFollowingProfile = profile ? myFollowingIds.includes(profile.id) : false;

    return (
        <div>
            <h2>Profile</h2>

            {loading && <p>Loading profile...</p>}
            {error && <p>{error}</p>}

            {profile && !loading && (
                <>
                    <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
                        <p>Username: {profile.username}</p>
                        <p>Display name: {profile.display_name}</p>
                        <p>Email: {profile.email}</p>
                        <p>Followers: {followers.length}</p>
                        <p>Following: {following.length}</p>
                    </div>

                    {!isOwnProfile && (
                        <button onClick={handleFollowToggle} disabled={followLoading}>
                            {followLoading
                                ? "Saving..."
                                : isFollowingProfile
                                    ? "Unfollow"
                                    : "Follow"}
                        </button>
                    )}

                    {actionMessage && <p>{actionMessage}</p>}

                    <h3>Posts</h3>
                    {posts.length === 0 && <p>No posts yet.</p>}
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </>
            )}
        </div>
    );
}

export default ProfilePage;
