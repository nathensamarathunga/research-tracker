import { User } from "./User";
import { Project } from "./Project";

export interface Document {
    id: string;
    project: Project;
    title: string;
    description: string;
    urlOrPath: string;
    fileType: string;
    uploadedBy: User;
    uploadedAt: string;
}