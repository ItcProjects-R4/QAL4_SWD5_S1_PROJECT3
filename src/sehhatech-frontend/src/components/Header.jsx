import { useNavigate } from "react-router-dom";

export default function Header({ profile, onMenuClick, sidebarOpen }) {
    const navigate = useNavigate();
    const name = profile?.user?.fullName || "";
    const spec = profile?.specialization || "";
    const imgUrl = profile?.doctorProfileImageUrl || profile?.user?.userProfileImageUrl;

    return (
        <header
            id="mainHeader"
            className="fixed top-0 left-0 right-0 h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md z-[70] flex items-center px-4 sm:px-6 gap-4 transition-all duration-300"
            style={{ left: sidebarOpen ? "16rem" : "0" }}
        >
            <button
                onClick={onMenuClick}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 flex-shrink-0"
                aria-label="Toggle sidebar"
            >
                <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>

            <div className="flex-1 min-w-0" />

            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase truncate max-w-[140px]">{spec}</p>
                </div>
                <div
                    className="w-8 h-8 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:ring-2 hover:ring-blue-200 hover:shadow-md overflow-hidden bg-primary flex items-center justify-center flex-shrink-0"
                    onClick={() => navigate("/doctor/profile")}
                >
                    {imgUrl ? (
                        <img src={imgUrl} className="w-full h-full object-cover" alt={name} />
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