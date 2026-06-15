import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { followUser, unfollowUser } from "../api/follow";
import { getApiErrorMessage } from "../api/response";
import {
    getMyFollowing,
    getMyProfile,
    getUserFollowers,
    getUserFollowing,
    getUserProfile
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
            const profileResponse = id === "me"
                ? await getMyProfile()
                : await getUserProfile(id);
            const profileData = profileResponse?.user || null;
            console.info("[profile] user response", profileData);

            if (!profileData?.id) {
                throw new Error("User was not found");
            }

            const [followersData, followingData, myFollowingData] = await Promise.all([
                getUserFollowers(profileData.id),
                getUserFollowing(profileData.id),
                getMyFollowing()
            ]);

            console.info("[profile] posts response", profileResponse?.posts);

            setProfile(profileData);
            setPosts(Array.isArray(profileResponse?.posts) ? profileResponse.posts : []);
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
            <h1 className="page-title">Profile</h1>

            {loading && <div className="muted-box">Loading profile...</div>}
            {error && <div className="muted-box">{error}</div>}

            {profile && !loading && (
                <div className="profile-layout">
                    <div className="profile-header">
                        <div className="profile-avatar" />

                        <div className="card profile-info">
                            <h2 className="profile-name">
                                {profile.display_name || profile.username || "User"}
                            </h2>
                            <p className="profile-username">@{profile.username || "unknown"}</p>
                            <p className="profile-bio">{profile.bio || "No bio yet."}</p>

                            <div className="profile-stats">
                                <span>Followers: {followers.length}</span>
                                <span>Following: {following.length}</span>
                                <span>Email: {profile.email}</span>
                            </div>

                            {!isOwnProfile && (
                                <div className="profile-actions">
                                    <button
                                        className="btn btn--secondary"
                                        onClick={handleFollowToggle}
                                        disabled={followLoading}
                                    >
                                        {followLoading
                                            ? "Saving..."
                                            : isFollowingProfile
                                                ? "Unfollow"
                                                : "Follow"}
                                    </button>
                                </div>
                            )}

                            {actionMessage && <div className="muted-box">{actionMessage}</div>}
                        </div>
                    </div>

                    <section className="post-list">
                        <h3 className="page-title page-title--section">User posts</h3>
                        {posts.length === 0 && <div className="muted-box">No posts yet.</div>}
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </section>
                </div>
            )}
        </div>
    );
}

export default ProfilePage;
