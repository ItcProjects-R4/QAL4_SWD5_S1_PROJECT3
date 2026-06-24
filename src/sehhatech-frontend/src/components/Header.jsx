import { useNavigate } from "react-router-dom";
//export default function Header({ profile, onMenuClick }) {
export default function Header({ profile, onMenuClick, sidebarOpen }) { 
    const navigate = useNavigate();
    const name = profile?.user?.fullName || "";
    const spec = profile?.specialization || "";
    const imgUrl = profile?.doctorProfileImageUrl || profile?.user?.userProfileImageUrl;

    return (
        <header
            id="mainHeader"
            className={`fixed top-0 right-0 h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md z-[70] flex items-center px-6 gap-4 transition-all duration-300 ${sidebarOpen ? "left-64" : "left-0"
                }`}
        >
            <button
                onClick={onMenuClick}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            >
                <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <div className="flex-1"></div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">{name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">{spec}</p>
                </div>
                <div
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                    onClick={() => navigate("/doctor/profile")}
                >
                    {imgUrl ? (
                        <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                        <span
                            className="material-symbols-outlined text-white text-sm"
                            style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                            person
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
}