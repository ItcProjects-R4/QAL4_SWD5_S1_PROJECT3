import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/sehhatech-logo.jpeg";

const navItems = [
  { to: "/reception/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/reception/patients", icon: "group", label: "Patients" },
  { to: "/reception/appointments", icon: "calendar_month", label: "Appointments" },
  { to: "/reception/payments", icon: "payments", label: "Payments" },
];

export default function ReceptionSidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 px-6 py-3 mx-3 rounded-xl text-sm font-manrope transition-all duration-200 ${
      isActive
        ? "bg-blue-50 text-blue-600 font-semibold"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    }`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-slate-200/80 flex flex-col py-6 z-[70]
        transition-transform duration-300 ease-out lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:flex`}
      >
        {/* Brand */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
              <img
                src={logo}
                alt="SehhaTech Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 font-manrope leading-tight">
                SehhaTech
              </h2>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Reception Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-0 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              onClick={onClose}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-600 rounded-r-full" />
                  )}

                  <span
                    className={`material-symbols-outlined text-[22px] transition-transform duration-200 ${
                      isActive ? "scale-110" : "group-hover:scale-105"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 text-sm font-manrope font-medium transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}