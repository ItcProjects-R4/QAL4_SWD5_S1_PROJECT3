import { Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Clinics from './pages/Clinics'
import BookAppointment from './pages/BookAppointment'
import MyBookings from './pages/MyBookings'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Contact from './pages/Contact'

export default function App() {
    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/clinics" element={<Clinics />} />
                <Route path="/book-appointment" element={<BookAppointment />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/contact" element={<Contact />} />
                {/* Fallback for unknown routes */}
                <Route path="*" element={<Landing />} />
            </Routes>
        </>
    )
}
