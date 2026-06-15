/*
App routes
- layout wrapper
*/

import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FeedPage from "./pages/FeedPage";
import CreatePostPage from "./pages/CreatePostPage";
import ProfilePage from "./pages/ProfilePage";
import PostPage from "./pages/PostPage";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<Navigate to="/users/me" replace />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <FeedPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/create"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <CreatePostPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/users/me"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <ProfilePage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/users/:id"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <ProfilePage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/posts/:id"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <PostPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
