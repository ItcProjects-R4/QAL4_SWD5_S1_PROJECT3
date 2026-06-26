import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Public endpoints — must never send Authorization header.
// A stale token sent to these routes causes TenantMiddleware to return 403.
const PUBLIC_ENDPOINTS = [
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/reset-password",
    "/api/subscription/initiate",
    "/api/subscription/callback",
];

const isPublic = (url = "") =>
    PUBLIC_ENDPOINTS.some((path) => url.includes(path));

api.interceptors.request.use((config) => {
    if (isPublic(config.url)) return config;

    const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !isPublic(error.config?.url)) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;