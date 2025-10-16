export interface User {
    id: string;
    username: string;
    fullName: string;
    role: "ADMIN" | "PI" | "MEMBER" | "VIEWER";
    createdAt: string;
}