import React, { useState } from "react";
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
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await axios.post("/auth/login", { username, password });
            login(String(res.data)); // Save JWT token
            navigate("/projects");
        } catch (err: any) {
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{maxWidth: 400}}>
            <h2>Login</h2>
            {loading && <Loader />}
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-2">
                    <label>Username</label>
                    <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div className="mb-2">
                    <label>Password</label>
                    <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading}>Login</button>
            </form>
        </div>
    );
};

export default LoginPage;