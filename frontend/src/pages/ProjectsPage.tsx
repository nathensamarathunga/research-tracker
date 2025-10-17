import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { Project } from "../types/Project";
import Loader from "../components/Loader";
import ProjectForm from "../components/ProjectForm";
import { useAuth } from "../auth/AuthContext";

const ProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [showForm, setShowForm] = useState(false);
    const [editProject, setEditProject] = useState<Project | null>(null);
    const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
    const { user, role } = useAuth();

    const fetchProjects = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get<Project[]>("/projects");
            let filtered: Project[] = [];
            if (role === "ADMIN" || role === "VIEWER") {
                filtered = res.data;
            } else {
                filtered = res.data.filter(
                    (project) =>
                        project.pi?.username === user ||
                        (project.members && project.members.some(m => m.username === user))
                );
            }
            setProjects(filtered);
        } catch (err: any) {
            setError(
                err?.response?.data?.error ||
                err?.message ||
                "Failed to fetch projects"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
        // eslint-disable-next-line
    }, [user, role]);

    const handleCreate = () => {
        setEditProject(null);
        setShowForm(true);
    };

    const handleEdit = (project: Project) => {
        setEditProject(project);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        fetchProjects();
    };

    const handleDelete = async (projectId: string) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this project? This action cannot be undone."
            )
        )
            return;
        setDeleteLoadingId(projectId);
        setError("");
        try {
            await axios.delete(`/projects/${projectId}`);
            fetchProjects();
        } catch (err: any) {
            setError(
                err?.response?.data?.error ||
                err?.message ||
                "Failed to delete project"
            );
        } finally {
            setDeleteLoadingId(null);
        }
    };

    // Only ADMIN and PI/MEMBER can create/edit/delete
    const canEdit = role === "ADMIN" || role === "PI" || role === "MEMBER";

    return (
        <div className="container">
            <h2>Projects</h2>
            {loading && <Loader />}
            {error && <div className="alert alert-danger my-3">{error}</div>}
            {canEdit && (
                <button className="btn btn-primary mb-3" onClick={handleCreate}>
                    Create Project
                </button>
            )}
            {showForm && canEdit && (
                <div className="mb-3">
                    <ProjectForm
                        initial={editProject || {}}
                        mode={editProject ? "edit" : "create"}
                        projectId={editProject?.id}
                        onSuccess={handleFormSuccess}
                    />
                    <button
                        className="btn btn-secondary mt-2"
                        onClick={() => setShowForm(false)}
                    >
                        Cancel
                    </button>
                </div>
            )}
            {!loading && !error && (
                <>
                    {projects.length === 0 && (
                        <div className="alert alert-info my-3">No projects found. You are not assigned to any project yet.</div>
                    )}
                    {projects.length > 0 && (
                        <table className="table table-bordered table-hover mt-3">
                            <thead className="table-light">
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>PI</th>
                                <th>Tags</th>
                                <th>Start</th>
                                <th>End</th>
                                {canEdit && <th>Actions</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {projects.map((project) => (
                                <tr key={project.id}>
                                    <td>
                                        {project.title}
                                    </td>
                                    <td>{project.status}</td>
                                    <td>
                                        {project.pi?.fullName || project.pi?.username}
                                    </td>
                                    <td>{project.tags}</td>
                                    <td>{project.startDate || "-"}</td>
                                    <td>{project.endDate || "-"}</td>
                                    {canEdit && (
                                        <td>
                                            <button
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => handleEdit(project)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                disabled={deleteLoadingId === project.id}
                                                onClick={() => handleDelete(project.id)}
                                            >
                                                {deleteLoadingId === project.id ? (
                                                    <span className="spinner-border spinner-border-sm" />
                                                ) : (
                                                    "Delete"
                                                )}
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
};

export default ProjectsPage;