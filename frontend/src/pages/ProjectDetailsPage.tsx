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
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!project) return <div className="alert alert-warning">Project not found</div>;

    return (
        <div className="container card-spud">
            <button className="btn btn-spud-secondary mb-3" onClick={() => navigate(-1)}>
                &larr; Back
            </button>
            <h2 style={{ color: "var(--spud-purple)", fontWeight: "bold" }}>{project.title}</h2>
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Principal Investigator:</strong> {project.pi?.fullName} ({project.pi?.username})</p>
            <p><strong>Tags:</strong> {project.tags}</p>
            <p><strong>Start Date:</strong> {project.startDate || "-"}</p>
            <p><strong>End Date:</strong> {project.endDate || "-"}</p>
            <p><strong>Summary:</strong> {project.summary}</p>

            <hr />

            <h4>Members</h4>
            {memberLoading && <Loader />}
            <ul>
                {members.map(m => (
                    <li key={m.id}>
                        {m.fullName} ({m.username}) [{m.role}]
                        {(role === "ADMIN" || role === "PI") && m.username !== project.pi?.username && (
                            <button
                                className="btn btn-sm btn-spud-secondary ms-2"
                                onClick={() => handleRemoveMember(m.username)}
                                disabled={memberLoading}
                            >Remove</button>
                        )}
                    </li>
                ))}
            </ul>
            {(role === "ADMIN" || role === "PI") && (
                <div className="mb-3">
                    <label>Add Member:</label>
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
                    <button
                        className="btn btn-spud-primary mt-2"
                        onClick={handleAddMember}
                        disabled={memberLoading || !addMemberUsername}
                    >
                        Add Member
                    </button>
                </div>
            )}

            <hr />

            <h4>Milestones</h4>
            <button
                className="btn btn-link"
                onClick={() => navigate(`/projects/${project.id}/milestones`)}
            >
                View Milestones
            </button>

            <h4>Documents</h4>
            <button
                className="btn btn-link"
                onClick={() => navigate(`/projects/${project.id}/documents`)}
            >
                View Documents
            </button>
        </div>
    );
};

export default ProjectDetailsPage;