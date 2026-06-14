import { Routes, Route } from "react-router-dom";
import Landing from "./pages/public/Landing";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Payment from "./pages/public/Payment";
import ResetPassword from "./pages/public/ResetPassword";
import Privacy from "./pages/public/Privacy";
import Security from "./pages/public/Security";
import Status from "./pages/public/Status";
import Terms from "./pages/public/Terms";
import Dashboard from "./pages/doctor/Dashboard";
import MySchedule from "./pages/doctor/MySchedule";
import PatientRecords from "./pages/doctor/PatientRecords";
import DoctorProfile from "./pages/doctor/DoctorProfile";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/security" element={<Security />} />
            <Route path="/status" element={<Status />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/doctor/dashboard" element={<Dashboard />} />
            <Route path="/doctor/schedule" element={<MySchedule />} />
            <Route path="/doctor/patients" element={<PatientRecords />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
        </Routes>
    );
}

export default App;