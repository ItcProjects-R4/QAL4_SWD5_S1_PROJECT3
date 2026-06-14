import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // لما المشروع يفتح، نقرأ بيانات المستخدم المحفوظة (لو موجودة)
    useEffect(() => {
        const storage = localStorage.getItem("token")
            ? localStorage
            : sessionStorage;

        const token = storage.getItem("token");
        const fullName = storage.getItem("fullName");
        const email = storage.getItem("email");
        const role = storage.getItem("role");
        const tenantId = storage.getItem("tenantId");

        if (token) {
            setUser({ token, fullName, email, role, tenantId });
        }

        setLoading(false);
    }, []);

    // تسجيل الدخول: نحفظ البيانات في localStorage أو sessionStorage
    function login(data, remember) {
        const storage = remember ? localStorage : sessionStorage;

        storage.setItem("token", data.token);
        storage.setItem("fullName", data.fullName);
        storage.setItem("email", data.email);
        storage.setItem("role", data.role);
        if (data.tenantId) storage.setItem("tenantId", data.tenantId);

        setUser({
            token: data.token,
            fullName: data.fullName,
            email: data.email,
            role: data.role,
            tenantId: data.tenantId,
        });
    }

    // تسجيل الخروج
    function logout() {
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// hook عشان نستخدم الـ context بسهولة في أي مكون
export function useAuth() {
    return useContext(AuthContext);
}