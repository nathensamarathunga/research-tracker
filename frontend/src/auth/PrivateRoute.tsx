import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface Props {
    children: React.ReactNode;
    roles?: string[]; // Optional: restrict by role
}

const PrivateRoute: React.FC<Props> = ({ children, roles }) => {
    const { user, role } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (roles && (!role || !roles.includes(role))) {
        return <Navigate to="/" />; // or show "unauthorized"
    }

    return <>{children}</>;
};

export default PrivateRoute;