import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import { Project, ProjectStatus } from "../types/Project";
import { User } from "../types/User";
import Loader from "./Loader";

interface ProjectFormProps {
    initial?: Partial<Project>;
    onSuccess: () => void;
    mode: "create" | "edit";
    projectId?: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
                                                     initial = {},
                                                     onSuccess,
                                                     mode,
                                                     projectId,
                                                 }) => {
    const [title, setTitle] = useState(initial.title || "");
    const [summary, setSummary] = useState(initial.summary || "");
    const [status, setStatus] = useState<ProjectStatus>(
        (initial.status as ProjectStatus) || "PLANNING"
    );
    const [tags, setTags] = useState(initial.tags || "");
    const [startDate, setStartDate] = useState(initial.startDate || "");
    const [endDate, setEndDate] = useState(initial.endDate || "");
    const [piUsername, setPiUsername] = useState("");
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (mode === "create") {
            (async function fetchUsers() {
                setLoading(true);
                try {
                    const res = await axios.get<User[]>("/users");
                    setAllUsers(res.data);
                } catch {
                    setAllUsers([]);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [mode]);

    useEffect(() => {
        if (mode === "edit" && initial.pi) {
            setPiUsername(initial.pi.username);
        }
    }, [initial.pi, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (mode === "create") {
                await axios.post(
                    "/projects",
                    {
                        title,
                        summary,
                        status,
                        tags,
                        startDate,
                        endDate,
                    },
                    {
                        params: { piUsername },
                    }
                );
            } else if (mode === "edit" && projectId) {
                await axios.put(`/projects/${projectId}`, {
                    title,
                    summary,
                    status,
                    tags,
                    startDate,
                    endDate,
                });
            }
            onSuccess();
        } catch (err: any) {
            setError(
                err?.response?.data?.error ||
                err?.message ||
                "Failed to submit project"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {loading && <Loader />}
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
                <label>Title</label>
                <input
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label>Summary</label>
                <textarea
                    className="form-control"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label>Status</label>
                <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                >
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
            </div>
            <div className="mb-3">
                <label>Tags (comma separated)</label>
                <input
                    className="form-control"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label>Start Date</label>
                <input
                    className="form-control"
                    type="date"
                    value={startDate || ""}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label>End Date</label>
                <input
                    className="form-control"
                    type="date"
                    value={endDate || ""}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
            {mode === "create" && (
                <div className="mb-3">
                    <label>Principal Investigator (PI)</label>
                    <select
                        className="form-select"
                        value={piUsername}
                        onChange={(e) => setPiUsername(e.target.value)}
                        required
                    >
                        <option value="">--Select PI--</option>
                        {allUsers.map((u) => (
                            <option key={u.id} value={u.username}>
                                {u.fullName} ({u.username}) [{u.role}]
                            </option>
                        ))}
                    </select>
                </div>
            )}
            <button className="btn btn-success" type="submit" disabled={loading}>
                {mode === "create" ? "Create Project" : "Update Project"}
            </button>
        </form>
    );
};

export default ProjectForm;