/*
Layout
- navbar
- navigation
- logout
*/

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div>
            <nav style={{
                display: "flex",
                gap: 10,
                padding: 10,
                borderBottom: "1px solid gray"
            }}>
                <Link to="/">Feed</Link>
                <Link to="/users/me">Profile</Link>
                <Link to="/create">Create</Link>

                {user && (
                    <span style={{ marginLeft: "auto" }}>
                        {user.username}
                    </span>
                )}

                <button onClick={handleLogout}>Logout</button>
            </nav>

            <div style={{ padding: 20 }}>
                {children}
            </div>
        </div>
    );
}

export default Layout;
