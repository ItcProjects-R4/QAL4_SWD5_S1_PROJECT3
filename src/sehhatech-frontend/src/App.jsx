import { Routes, Route } from "react-router-dom";

// Public
import Landing from "./pages/public/Landing";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Payment from "./pages/public/Payment";
import ResetPassword from "./pages/public/ResetPassword";
import Privacy from "./pages/public/Privacy";
import Security from "./pages/public/Security";
import Status from "./pages/public/Status";
import Terms from "./pages/public/Terms";

// Doctor
import Dashboard from "./pages/doctor/Dashboard";
import MySchedule from "./pages/doctor/MySchedule";
import PatientRecords from "./pages/doctor/PatientRecords";
import DoctorProfile from "./pages/doctor/DoctorProfile";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminReceptionists from "./pages/admin/AdminReceptionists";
import AdminSettings from "./pages/admin/AdminSettings";

function App() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/security" element={<Security />} />
            <Route path="/status" element={<Status />} />
            <Route path="/terms" element={<Terms />} />

            {/* Doctor */}
            <Route path="/doctor/dashboard" element={<Dashboard />} />
            <Route path="/doctor/schedule" element={<MySchedule />} />
            <Route path="/doctor/patients" element={<PatientRecords />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="doctors" element={<AdminDoctors />} />
                <Route path="receptionists" element={<AdminReceptionists />} />
                <Route path="settings" element={<AdminSettings />} />
            </Route>
        </Routes>
    );
}

export default App;