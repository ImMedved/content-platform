/*
Layout
- navbar
- navigation
- logout
- header
- footer
- page container
*/

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="app-shell">
            <header className="site-header">
                <div className="site-header__inner">
                    <div className="brand">
                        <div className="brand__logo">S</div>
                        <div className="brand__name">Smart Content Platform</div>
                    </div>

                    <nav className="navbar">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `navbar__link ${isActive ? "navbar__link--active" : ""}`
                            }
                        >
                            Feed
                        </NavLink>

                        <NavLink
                            to="/create"
                            className={({ isActive }) =>
                                `navbar__link ${isActive ? "navbar__link--active" : ""}`
                            }
                        >
                            Create
                        </NavLink>

                        {user?.id && (
                            <NavLink
                                to={`/users/${user.id}`}
                                className={({ isActive }) =>
                                    `navbar__link ${isActive ? "navbar__link--active" : ""}`
                                }
                            >
                                Profile
                            </NavLink>
                        )}
                    </nav>

                    <div className="header-user">
                        <span className="header-user__name">
                            {user?.display_name || user?.username || "User"}
                        </span>
                        <button className="btn btn--secondary" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="site-main">
                <div className="page-container">{children}</div>
            </main>

            <footer className="site-footer">
                <div className="site-footer__inner">
                    Smart Content Platform - seminar implementation build
                </div>
            </footer>
        </div>
    );
}

export default Layout;
