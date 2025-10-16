import React, { useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await axios.post("/auth/signup", { username, password, fullName });
            setSuccess("Registration successful! Please login.");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err: any) {
            setError("Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{maxWidth: 400}}>
            <h2>Register</h2>
            {loading && <Loader />}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-2">
                    <label>Full Name</label>
                    <input className="form-control" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div className="mb-2">
                    <label>Username</label>
                    <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div className="mb-2">
                    <label>Password</label>
                    <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading}>Register</button>
            </form>
        </div>
    );
};

export default RegisterPage;