import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useAuth } from "../auth/AuthContext";
import Loader from "../components/Loader";

interface User {
    id: string;
    username: string;
    fullName: string;
    role: string;
    createdAt: string;
}

const UserProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError("");
            try {
                // Fetch all users and find the matching one
                const res = await axios.get<User[]>("/users");
                const found = res.data.find(u => u.username === user);
                setProfile(found || null);
            } catch {
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchProfile();
    }, [user]);

    if (loading) return <Loader />;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!profile) return <div className="alert alert-warning">Profile not found.</div>;

    return (
        <div className="container" style={{maxWidth: 400}}>
            <h2>User Profile</h2>
            <div className="mb-2"><strong>Username:</strong> {profile.username}</div>
            <div className="mb-2"><strong>Full Name:</strong> {profile.fullName}</div>
            <div className="mb-2"><strong>Role:</strong> {profile.role}</div>
            <div className="mb-2"><strong>Created At:</strong> {profile.createdAt?.replace("T", " ").slice(0,16)}</div>
        </div>
    );
};

export default UserProfilePage;