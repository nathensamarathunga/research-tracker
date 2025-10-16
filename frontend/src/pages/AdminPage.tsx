import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import Loader from "../components/Loader";
import { useAuth } from "../auth/AuthContext";

interface User {
    id: string;
    username: string;
    fullName: string;
    role: string;
    createdAt: string;
}

const AdminPage: React.FC = () => {
    const { role } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get<User[]>("/users");
            setUsers(res.data);
        } catch (err: any) {
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (role === "ADMIN") fetchUsers();
    }, [role]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this user? This cannot be undone.")) return;
        setDeleteId(id);
        setError("");
        try {
            await axios.delete(`/users/${id}`);
            setUsers(users => users.filter(u => u.id !== id));
        } catch {
            setError("Failed to delete user");
        } finally {
            setDeleteId(null);
        }
    };

    if (role !== "ADMIN") {
        return <div className="container"><div className="alert alert-danger my-4">You are not authorized to view this page.</div></div>;
    }

    return (
        <div className="container">
            <h2>Admin Dashboard</h2>
            <h4 className="mb-3">User Management</h4>
            {loading && <Loader />}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && users.length === 0 && (
                <div className="alert alert-info">No users found.</div>
            )}
            {users.length > 0 && (
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>Username</th>
                        <th>Full Name</th>
                        <th>Role</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.username}</td>
                            <td>{u.fullName}</td>
                            <td>{u.role}</td>
                            <td>{u.createdAt ? u.createdAt.substring(0, 16).replace("T", " ") : "-"}</td>
                            <td>
                                <button
                                    className="btn btn-sm btn-danger"
                                    disabled={deleteId === u.id}
                                    onClick={() => handleDelete(u.id)}
                                >
                                    {deleteId === u.id ? <span className="spinner-border spinner-border-sm" /> : "Delete"}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminPage;