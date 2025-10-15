import React, { createContext, useContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";

interface AuthContextType {
    user: any;
    role: string | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    token: null,
    login: () => {},
    logout: () => {},
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            try {
                // You may need to adjust this depending on your JWT payload structure
                const decoded: any = jwtDecode(token);
                setUser(decoded.sub || decoded.username);
                setRole(decoded.role);
            } catch {
                setUser(null);
                setRole(null);
            }
        } else {
            setUser(null);
            setRole(null);
        }
    }, [token]);

    const login = (token: string) => {
        setToken(token);
        localStorage.setItem("token", token);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setRole(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, role, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
};
export const useAuth = () => useContext(AuthContext);