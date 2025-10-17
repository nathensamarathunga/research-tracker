import axios from "axios";

// You may need to adjust this if your backend runs on a different host/port
const api = axios.create({
    baseURL: "/api", // proxy to backend in development (setup in package.json)
});

// Add JWT token to every request if present
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Redirect to log in on 401/403 (expired/invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;