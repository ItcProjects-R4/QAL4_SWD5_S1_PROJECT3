import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null); // { message, type }

    function showToast(message, type = "success") {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }

    function redirectByRole(role) {
        switch (role) {
            case "SuperAdmin":
                navigate("/superadmin/dashboard");
                break;
            case "ClinicAdmin":
                navigate("/admin/dashboard");
                break;
            case "Doctor":
                navigate("/doctor/dashboard");
                break;
            case "Reception":
                navigate("/reception/dashboard");
                break;
            default:
                navigate("/dashboard");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!email.trim() || !password) {
            showToast("Please enter your email and password.", "error");
            return;
        }

        setLoading(true);

        try {
            const res = await api.post("/api/auth/login", {
                email: email.trim(),
                password,
            });

            const data = res.data.data ?? res.data;

            if (data.mustResetPassword) {
                localStorage.setItem("token", data.token);
                navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
                return;
            }

            login(data, remember);
            showToast("Login successful! Redirecting...", "success");
            setTimeout(() => redirectByRole(data.role), 800);
        } catch (err) {
            const message =
                err.response?.data?.message || "Login failed. Please try again.";
            showToast(message, "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col relative">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-7 py-3.5 rounded-lg font-semibold text-sm z-[9999] shadow-lg text-white ${toast.type === "error" ? "bg-error" : "bg-[#1a365d]"
                        }`}
                >
                    {toast.message}
                </div>
            )}

            {/* Hero Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-surface/60 z-10" />
                <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLEUX0XffEEKxJ4F-2xT5bimcAwRt_JioNBVgcI8SdWVqnnwCZLlfiwkJ9eraAfi4DNeb8Imw-mYMXeFYTEjhb8sKe-6mFUcFtWF_ctvhMMlYn1qntxbjVLbGQ9r-jZwmgYRJVV9r9NmPZz8TAevSOkY4TFWtIRFF77BraJlTzq0hmnuitVYDPeMSoeXt8rGipYK5TP_K5465HrKBXTplCgJ5NDbhhxZXXwDXD5aUS5FRGMnrAR54TMzCpH0dEpXHYyh3VhJqny_Y"
                    alt=""
                />
            </div>

            <main className="relative z-20 flex-grow flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="mb-6">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary/70 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back to Home
                        </Link>
                    </div>

                    {/* Branding */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary text-white mb-6 shadow-xl">
                            <span className="material-symbols-outlined text-4xl">medical_services</span>
                        </div>
                        <h1 className="font-display font-extrabold text-3xl text-primary tracking-tight">
                            SehhaTech
                        </h1>
                        <p className="font-body text-on-surface-variant mt-2 font-medium tracking-wide">
                            Enter your credentials to access the portal
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white/85 backdrop-blur-md border-none rounded-xl shadow-2xl overflow-hidden p-8 md:p-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block font-label text-xs font-bold uppercase tracking-widest text-primary-container">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                                        mail
                                    </span>
                                    <input
                                        className="w-full pl-12 pr-4 py-3.5 bg-surface-container-highest text-on-surface rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all border-none placeholder:text-outline/60"
                                        placeholder="dr.ahmed@yourclinic.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="block font-label text-xs font-bold uppercase tracking-widest text-primary-container">
                                        Password
                                    </label>
                                    <Link
                                        to="/reset-password"
                                        className="text-xs font-semibold text-secondary hover:text-on-secondary-container transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                                        lock
                                    </span>
                                    <input
                                        className="w-full pl-12 pr-12 py-3.5 bg-surface-container-highest text-on-surface rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all border-none placeholder:text-outline/60"
                                        placeholder="••••••••••••"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center">
                                <input
                                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                                    type="checkbox"
                                    id="remember"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                />
                                <label
                                    htmlFor="remember"
                                    className="ml-2 text-sm font-medium text-on-surface-variant cursor-pointer select-none"
                                >
                                    Stay logged in on this device
                                </label>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-br from-[#002045] to-[#1a365d] text-on-primary font-headline font-bold py-4 rounded-lg shadow-lg hover:shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                <span>{loading ? "Please wait..." : "Login"}</span>
                                <span className="material-symbols-outlined text-xl">
                                    {loading ? "hourglass_empty" : "login"}
                                </span>
                            </button>
                        </form>
                    </div>

                    {/* Footer Meta */}
                    <div className="mt-8 flex flex-col items-center gap-6">
                        <a
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
                            href="#"
                        >
                            <span className="material-symbols-outlined text-lg">help</span>
                            Need help?
                        </a>
                        <div className="flex items-center gap-6 opacity-60">
                            <div className="flex items-center gap-1.5 grayscale hover:grayscale-0 transition-all cursor-default">
                                <span className="material-symbols-outlined text-sm">verified_user</span>
                                <span className="font-label text-[10px] font-extrabold uppercase tracking-widest">
                                    HIPAA Compliant
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 grayscale hover:grayscale-0 transition-all cursor-default">
                                <span className="material-symbols-outlined text-sm">lock_person</span>
                                <span className="font-label text-[10px] font-extrabold uppercase tracking-widest">
                                    SSL Secured
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="relative z-20 w-full py-8 text-center border-t border-outline-variant/10">
                <p className="text-xs font-medium text-on-surface-variant/40">
                    © 2026 SehhaTech Clinical Systems. All Patient Data Encrypted.
                </p>
            </footer>
        </div>
    );
}