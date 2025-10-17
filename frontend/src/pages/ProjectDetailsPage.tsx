import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { Project } from "../types/Project";
import { User } from "../types/User";
import Loader from "../components/Loader";
import { useAuth } from "../auth/AuthContext";

const ProjectDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, role } = useAuth();

    const [project, setProject] = useState<Project | null>(null);
    const [members, setMembers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [memberLoading, setMemberLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [addMemberUsername, setAddMemberUsername] = useState("");

    // Fetch project details
    useEffect(() => {
        const fetchProject = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get<Project>(`/projects/${id}`);
                setProject(res.data);
            } catch (err: any) {
                setError("Failed to fetch project");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    // Fetch members
    useEffect(() => {
        const fetchMembers = async () => {
            if (!id) return;
            try {
                const res = await axios.get<User[]>(`/projects/${id}/members`);
                setMembers(res.data);
            } catch {
                setMembers([]);
            }
        };
        fetchMembers();
    }, [id, project]);

    // Fetch all users for adding as members (ADMIN/PI only)
    useEffect(() => {
        const fetchAllUsers = async () => {
            if (role === "ADMIN" || role === "PI") {
                try {
                    // Ideally should use /users/all-for-membership for correct filtering
                    const res = await axios.get<User[]>("/users");
                    setAllUsers(res.data);
                } catch {
                    setAllUsers([]);
                }
            }
        };
        fetchAllUsers();
    }, [role]);

    const handleAddMember = async () => {
        if (!addMemberUsername) return;
        setMemberLoading(true);
        setError("");
        try {
            await axios.post(`/projects/${id}/members`, { username: addMemberUsername });
            setAddMemberUsername("");
            // Refresh member list
            const res = await axios.get<User[]>(`/projects/${id}/members`);
            setMembers(res.data);
        } catch (err: any) {
            setError(
                err?.response?.data?.error ||
                err?.message ||
                "Failed to add member"
            );
        } finally {
            setMemberLoading(false);
        }
    };

    const handleRemoveMember = async (username: string) => {
        if (!window.confirm(`Remove member "${username}" from this project?`)) return;
        setMemberLoading(true);
        setError("");
        try {
            await axios.delete(`/projects/${id}/members/${username}`);
            // Refresh member list
            const res = await axios.get<User[]>(`/projects/${id}/members`);
            setMembers(res.data);
        } catch (err: any) {
            setError(
                err?.response?.data?.error ||
                err?.message ||
                "Failed to remove member"
            );
        } finally {
            setMemberLoading(false);
        }
    };

    if (loading) return <Loader />;
    if (error)
        return (
            <div className="container" style={{ maxWidth: 700 }}>
                <div className="alert alert-danger mt-4">{error}</div>
                <button
                    className="btn btn-spud-secondary mt-2"
                    onClick={() => navigate(-1)}
                >Back</button>
            </div>
        );
    if (!project)
        return (
            <div className="container" style={{ maxWidth: 700 }}>
                <div className="alert alert-warning mt-4">Project not found</div>
                <button
                    className="btn btn-spud-secondary mt-2"
                    onClick={() => navigate(-1)}
                >Back</button>
            </div>
        );

    return (
        <div className="container card-spud" style={{ maxWidth: 700 }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <button className="btn btn-spud-secondary" onClick={() => navigate(-1)}>
                    &larr; Back
                </button>
                <h2 style={{ color: "var(--spud-purple)", fontWeight: "bold", marginBottom: 0 }}>{project.title}</h2>
            </div>
            <hr />
            <div className="mb-3">
                <div><strong>Status:</strong> <span className="badge bg-info text-dark">{project.status}</span></div>
                <div><strong>Principal Investigator:</strong> <span className="badge bg-secondary">{project.pi?.fullName} ({project.pi?.username})</span></div>
                <div><strong>Tags:</strong> <span className="text-muted">{project.tags || "-"}</span></div>
                <div><strong>Start Date:</strong> {project.startDate || "-"}</div>
                <div><strong>End Date:</strong> {project.endDate || "-"}</div>
            </div>
            <div className="mb-4">
                <strong>Summary:</strong>
                <div className="card mt-1 mb-0 p-2" style={{ background: "#eef7fa" }}>
                    {project.summary || <span className="text-muted">No summary provided.</span>}
                </div>
            </div>
            <hr />
            <div className="mb-4">
                <div className="d-flex align-items-center mb-2">
                    <h4 className="mb-0">Members</h4>
                    {memberLoading && <div className="ms-2"><Loader /></div>}
                </div>
                <ul className="list-group mb-2">
                    {members.length === 0 && (
                        <li className="list-group-item text-muted">No members in this project.</li>
                    )}
                    {members.map(m => (
                        <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                                <strong>{m.fullName}</strong> ({m.username}) <span className="badge bg-light text-dark">{m.role}</span>
                            </span>
                            {(role === "ADMIN" || role === "PI") && m.username !== project.pi?.username && (
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleRemoveMember(m.username)}
                                    disabled={memberLoading}
                                >Remove</button>
                            )}
                        </li>
                    ))}
                </ul>
                {(role === "ADMIN" || role === "PI") && (
                    <form
                        className="row g-2 align-items-center"
                        onSubmit={e => {
                            e.preventDefault();
                            handleAddMember();
                        }}
                    >
                        <div className="col">
                            <select
                                className="form-select"
                                value={addMemberUsername}
                                onChange={e => setAddMemberUsername(e.target.value)}
                            >
                                <option value="">--Select User--</option>
                                {allUsers
                                    .filter(
                                        u =>
                                            u.username !== project.pi?.username &&
                                            !members.some(m => m.username === u.username)
                                    )
                                    .map(u => (
                                        <option key={u.id} value={u.username}>
                                            {u.fullName} ({u.username}) [{u.role}]
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="col-auto">
                            <button
                                className="btn btn-spud-primary"
                                type="submit"
                                disabled={memberLoading || !addMemberUsername}
                            >
                                Add Member
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <hr />
            <div className="row mb-3">
                <div className="col">
                    <h4>Milestones</h4>
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate(`/projects/${project.id}/milestones`)}
                    >
                        View Milestones
                    </button>
                </div>
                <div className="col">
                    <h4>Documents</h4>
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate(`/projects/${project.id}/documents`)}
                    >
                        View Documents
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsPage;