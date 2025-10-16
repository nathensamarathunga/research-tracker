import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:8080/api", // Adjust if your backend runs elsewhere
});

// Attach JWT token from localStorage to every request
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default instance;