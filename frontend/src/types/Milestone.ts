import { User } from "./User";
import { Project } from "./Project";

export interface Milestone {
    id: string;
    project: Project;
    title: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
    createdBy: User;
    createdAt: string;
}