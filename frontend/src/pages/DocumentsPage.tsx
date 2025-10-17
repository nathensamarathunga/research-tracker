import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import Loader from "../components/Loader";
import { useAuth } from "../auth/AuthContext";

interface Document {
    id: string;
    title: string;
    description?: string;
    urlOrPath: string;
    fileType?: string;
    uploadedBy: {
        username: string;
        fullName: string;
    };
    uploadedAt: string;
}

const DocumentsPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { user, role } = useAuth();
    const navigate = useNavigate();

    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canEdit = role === "ADMIN" || role === "PI" || role === "MEMBER";

    const fetchDocuments = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get<Document[]>("/documents", {
                params: { projectId }
            });
            setDocuments(res.data);
        } catch {
            setError("Failed to fetch documents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
        // eslint-disable-next-line
    }, [projectId]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileInputRef.current?.files?.length) return;
        const file = fileInputRef.current.files[0];
        setUploading(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("projectId", projectId || "");
            formData.append("uploaderUsername", user || "");
            if (title) formData.append("title", title);
            if (description) formData.append("description", description);

            await axios.post("/documents/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setTitle("");
            setDescription("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchDocuments();
        } catch {
            setError("Failed to upload document");
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (docId: string, docTitle: string) => {
        try {
            const res = await axios.get(`/documents/${docId}/download`, {
                responseType: "blob"
            });
            // Download using a temporary link
            const url = window.URL.createObjectURL(res.data as Blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", docTitle || "document");
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            setError("Failed to download file");
        }
    };

    const handleDelete = async (docId: string) => {
        if (!window.confirm("Delete this document?")) return;
        setError("");
        try {
            await axios.delete(`/documents/${docId}`);
            fetchDocuments();
        } catch {
            setError("Failed to delete document");
        }
    };

    return (
        <div className="container card-spud">
            <button className="btn btn-spud-secondary mb-3" onClick={() => navigate(-1)}>
                &larr; Back to Project
            </button>
            <h2 style={{ color: "var(--spud-purple)", fontWeight: "bold" }}>Documents</h2>
            {loading && <Loader />}
            {error && <div className="alert alert-danger">{error}</div>}

            {canEdit && (
                <form className="mb-4" onSubmit={handleUpload}>
                    <div className="mb-2">
                        <label>Title</label>
                        <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="mb-2">
                        <label>Description</label>
                        <input className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="mb-2">
                        <label>File</label>
                        <input className="form-control" type="file" ref={fileInputRef} required />
                    </div>
                    <button className="btn btn-spud-primary" type="submit" disabled={uploading}>
                        {uploading ? <span className="spinner-border spinner-border-sm" /> : "Upload"}
                    </button>
                </form>
            )}

            {!loading && documents.length === 0 && (
                <div className="alert alert-info">No documents found.</div>
            )}

            {documents.length > 0 && (
                <table className="table table-bordered table-spud">
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Uploader</th>
                        <th>Uploaded At</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {documents.map(doc => (
                        <tr key={doc.id}>
                            <td>{doc.title}</td>
                            <td>{doc.description}</td>
                            <td>{doc.fileType}</td>
                            <td>
                                {doc.uploadedBy?.fullName} ({doc.uploadedBy?.username})
                            </td>
                            <td>
                                {doc.uploadedAt
                                    ? doc.uploadedAt.substring(0, 16).replace("T", " ")
                                    : "-"}
                            </td>
                            <td>
                                <button
                                    className="btn btn-sm btn-spud-primary me-2"
                                    onClick={() => handleDownload(doc.id, doc.title)}
                                >
                                    Download
                                </button>
                                {canEdit && (
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(doc.id)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default DocumentsPage;