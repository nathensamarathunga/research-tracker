import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { useAuth } from "../auth/AuthContext";
import Loader from "../components/Loader";

interface Milestone {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
    createdAt: string;
    createdBy: {
        username: string;
        fullName: string;
    };
}

const MilestonesPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { user, role } = useAuth();

    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editMilestone, setEditMilestone] = useState<Milestone | null>(null);

    // Form states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const canEdit = role === "ADMIN" || role === "PI" || role === "MEMBER";

    const fetchMilestones = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get<Milestone[]>(`/projects/${projectId}/milestones`);
            setMilestones(res.data);
        } catch (err: any) {
            setError("Failed to fetch milestones");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMilestones();
        // eslint-disable-next-line
    }, [projectId]);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setDueDate("");
        setIsCompleted(false);
        setEditMilestone(null);
        setShowForm(false);
        setFormLoading(false);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setError("");
        try {
            if (editMilestone) {
                // Edit
                await axios.put(`/milestones/${editMilestone.id}`, {
                    title,
                    description,
                    dueDate,
                    completed: isCompleted,
                });
            } else {
                // Create
                await axios.post(`/projects/${projectId}/milestones`, {
                    title,
                    description,
                    dueDate,
                }, {
                    params: { creatorUsername: user }
                });
            }
            resetForm();
            fetchMilestones();
        } catch (err: any) {
            setError("Failed to save milestone");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (m: Milestone) => {
        setEditMilestone(m);
        setTitle(m.title);
        setDescription(m.description || "");
        setDueDate(m.dueDate ? m.dueDate.substring(0, 10) : "");
        setIsCompleted(m.isCompleted);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this milestone?")) return;
        setFormLoading(true);
        setError("");
        try {
            await axios.delete(`/milestones/${id}`);
            fetchMilestones();
        } catch {
            setError("Failed to delete milestone");
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="container card-spud">
            <button className="btn btn-spud-secondary mb-3" onClick={() => navigate(-1)}>
                &larr; Back to Project
            </button>
            <h2 style={{ color: "var(--spud-purple)", fontWeight: "bold" }}>Milestones</h2>
            {loading && <Loader />}
            {error && <div className="alert alert-danger">{error}</div>}

            {canEdit && !showForm && (
                <button className="btn btn-spud-primary mb-3" onClick={() => setShowForm(true)}>
                    Add Milestone
                </button>
            )}

            {showForm && (
                <form onSubmit={handleFormSubmit} className="mb-3">
                    <div className="mb-2">
                        <label>Title</label>
                        <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div className="mb-2">
                        <label>Description</label>
                        <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="mb-2">
                        <label>Due Date</label>
                        <input className="form-control" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                    </div>
                    {editMilestone && (
                        <div className="form-check mb-2">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={isCompleted}
                                onChange={e => setIsCompleted(e.target.checked)}
                                id="isCompleted"
                            />
                            <label className="form-check-label" htmlFor="isCompleted">Completed</label>
                        </div>
                    )}
                    <button className="btn btn-spud-primary me-2" type="submit" disabled={formLoading}>
                        {editMilestone ? "Update" : "Add"}
                    </button>
                    <button className="btn btn-spud-secondary" type="button" onClick={resetForm} disabled={formLoading}>Cancel</button>
                </form>
            )}

            {!loading && milestones.length === 0 && (
                <div className="alert alert-info">No milestones found.</div>
            )}

            {milestones.length > 0 && (
                <table className="table table-bordered table-spud">
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Description</th>
                        <th>Created By</th>
                        <th>Created At</th>
                        {canEdit && <th>Actions</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {milestones.map(m => (
                        <tr key={m.id}>
                            <td>{m.title}</td>
                            <td>{m.dueDate ? m.dueDate.substring(0, 10) : "-"}</td>
                            <td>{m.isCompleted ? "Completed" : "Pending"}</td>
                            <td>{m.description}</td>
                            <td>{m.createdBy?.fullName} ({m.createdBy?.username})</td>
                            <td>{m.createdAt ? m.createdAt.substring(0, 16).replace("T", " ") : "-"}</td>
                            {canEdit && (
                                <td>
                                    <button className="btn btn-sm btn-spud-secondary me-2" onClick={() => handleEdit(m)}>
                                        Edit
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id)} disabled={formLoading}>
                                        Delete
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MilestonesPage;