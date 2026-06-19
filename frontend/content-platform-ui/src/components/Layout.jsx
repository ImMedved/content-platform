/*
Layout
- navbar
- navigation
- logout
- header
- footer
- page container
*/

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const lastScrollY = useRef(0);
    const [collapsed, setCollapsed] = useState(false);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollingDown = currentScrollY > lastScrollY.current;

            if (currentScrollY < 24) {
                setCollapsed(false);
            } else {
                setCollapsed(scrollingDown);
            }

            lastScrollY.current = currentScrollY;
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className="app-shell">
            <header className={`site-header ${collapsed ? "site-header--collapsed" : ""}`}>
                <div className="site-header__inner">
                    <Link className="brand" to="/">
                        <div className="brand__logo">S</div>
                        <div className="brand__name">Smart Content Platform</div>
                    </Link>

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
                            to="/following"
                            className={({ isActive }) =>
                                `navbar__link ${isActive ? "navbar__link--active" : ""}`
                            }
                        >
                            Following
                        </NavLink>

                        <NavLink
                            to="/messages"
                            className={({ isActive }) =>
                                `navbar__link ${isActive ? "navbar__link--active" : ""}`
                            }
                        >
                            Messages
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
                        {typeof user?.wallet_balance === "number" && (
                            <span className="header-user__wallet">
                                Wallet: {user.wallet_balance}
                            </span>
                        )}
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
