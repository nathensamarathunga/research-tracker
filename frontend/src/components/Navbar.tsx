import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Navbar: React.FC = () => {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
            <div className="container">
                <Link className="navbar-brand" to="/projects">Research Tracker</Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto">
                        {role && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/projects">Projects</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/milestones">Milestones</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/documents">Documents</Link>
                                </li>
                                {role === "ADMIN" && (
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/admin">Admin</Link>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>
                    <ul className="navbar-nav ms-auto">
                        {user ? (
                            <>
                                <li className="nav-item">
                                    <span className="navbar-text me-2">Hello, {user}</span>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">Register</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;