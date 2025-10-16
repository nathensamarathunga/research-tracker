import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
    const { token, role: userRole } = useAuth();
    if (!token) return <Navigate to="/login" />;
    if (role && userRole !== role) return <Navigate to="/projects" />;
    return <>{children}</>;
};

export default PrivateRoute;