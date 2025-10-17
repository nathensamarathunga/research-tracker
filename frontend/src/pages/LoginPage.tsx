import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Loader from "../components/Loader";

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login, user } = useAuth();

    useEffect(() => {
        if (user) {
            navigate("/projects", { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await axios.post("/auth/login", { username, password });
            login(String(res.data));
            navigate("/projects", { replace: true });
        } catch (err: any) {
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container card-spud" style={{maxWidth: 400}}>
            <h2 style={{ color: "var(--spud-purple)", fontWeight: "bold" }}>Login</h2>
            {loading && <Loader />}
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-2">
                    <label style={{ color: "var(--spud-dark)" }}>Username</label>
                    <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div className="mb-2">
                    <label style={{ color: "var(--spud-dark)" }}>Password</label>
                    <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button className="btn btn-spud-primary" type="submit" disabled={loading}>Login</button>
            </form>
        </div>
    );
};

export default LoginPage;