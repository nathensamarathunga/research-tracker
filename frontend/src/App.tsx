import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import MilestonesPage from "./pages/MilestonesPage";
import DocumentsPage from "./pages/DocumentsPage";
import AdminPage from "./pages/AdminPage";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";

const App: React.FC = () => (
    <AuthProvider>
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Navigate to="/projects" />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                    path="/projects"
                    element={
                        <PrivateRoute>
                            <ProjectsPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/projects/:id"
                    element={
                        <PrivateRoute>
                            <ProjectDetailsPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/projects/:projectId/milestones"
                    element={
                        <PrivateRoute>
                            <MilestonesPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/projects/:projectId/documents"
                    element={
                        <PrivateRoute>
                            <DocumentsPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute roles={["ADMIN"]}>
                            <AdminPage />
                        </PrivateRoute>
                    }
                />
                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    </AuthProvider>
);

export default App;