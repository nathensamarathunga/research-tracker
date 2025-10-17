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
        <nav
            className="navbar navbar-expand-lg mb-4"
            style={{
                backgroundColor: "var(--spud-dark)",
                color: "var(--spud-light-accent)",
                borderBottom: "4px solid var(--spud-purple)"
            }}
        >
            <div className="container">
                <Link
                    className="navbar-brand"
                    to="/"
                    style={{
                        color: "var(--spud-purple)",
                        fontWeight: "bold",
                        fontSize: "1.5rem"
                    }}
                >
                    Research Tracker
                </Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto">
                        {user && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/projects" style={{ color: "var(--spud-light-accent)" }}>
                                    Projects
                                </Link>
                            </li>
                        )}
                        {(role === "ADMIN") && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin" style={{ color: "var(--spud-light-accent)" }}>
                                    Admin
                                </Link>
                            </li>
                        )}
                        {user && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/profile" style={{ color: "var(--spud-light-accent)" }}>
                                    Profile
                                </Link>
                            </li>
                        )}
                    </ul>
                    <ul className="navbar-nav ms-auto">
                        {user ? (
                            <>
                                <li className="nav-item">
                                    <span className="navbar-text me-2" style={{ color: "var(--spud-purple-light)" }}>
                                        {user} <span className="badge" style={{ background: "var(--spud-purple)", color: "#fff" }}>{role}</span>
                                    </span>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className="btn btn-spud-primary"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login" style={{ color: "var(--spud-light-accent)" }}>Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register" style={{ color: "var(--spud-light-accent)" }}>Register</Link>
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