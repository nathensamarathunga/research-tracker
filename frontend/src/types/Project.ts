export interface Project {
    id: string;
    title: string;
    summary: string;
    status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
    pi: User;
    tags: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
    members: User[];
}