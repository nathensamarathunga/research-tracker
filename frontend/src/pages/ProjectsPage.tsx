import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { Project } from "../types/Project";
import Loader from "../components/Loader";
import ProjectForm from "../components/ProjectForm";

const ProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [showForm, setShowForm] = useState(false);
    const [editProject, setEditProject] = useState<Project | null>(null);

    const fetchProjects = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get<Project[]>("/projects");
            setProjects(res.data);
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
    }, []);

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

    return (
        <div className="container">
            <h2>Projects</h2>
            {loading && <Loader />}
            {error && <div className="alert alert-danger my-3">{error}</div>}
            <button className="btn btn-primary mb-3" onClick={handleCreate}>
                Create Project
            </button>
            {showForm && (
                <div className="mb-3">
                    <ProjectForm
                        initial={editProject || {}}
                        mode={editProject ? "edit" : "create"}
                        projectId={editProject?.id}
                        onSuccess={handleFormSuccess}
                    />
                    <button className="btn btn-secondary mt-2" onClick={() => setShowForm(false)}>
                        Cancel
                    </button>
                </div>
            )}
            {!loading && !error && (
                <>
                    {projects.length === 0 && (
                        <div className="alert alert-info my-3">No projects found.</div>
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
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {projects.map((project) => (
                                <tr key={project.id}>
                                    <td>{project.title}</td>
                                    <td>{project.status}</td>
                                    <td>{project.pi?.fullName || project.pi?.username}</td>
                                    <td>{project.tags}</td>
                                    <td>{project.startDate || "-"}</td>
                                    <td>{project.endDate || "-"}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-warning"
                                            onClick={() => handleEdit(project)}
                                        >
                                            Edit
                                        </button>
                                        {/* Add Delete button as needed */}
                                    </td>
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