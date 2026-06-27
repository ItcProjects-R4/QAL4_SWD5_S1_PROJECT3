import { useTranslation } from 'react-i18next';

// Shared modal used across all Admin pages (was duplicated in
// AdminDoctors.jsx, AdminDoctorSchedule.jsx, AdminReceptionists.jsx).
// Import this instead of redefining Modal locally in each page, e.g.:
//   import Modal from '../../components/AdminModal';
export default function AdminModal({ open, onClose, title, children }) {
    const { t } = useTranslation();
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-[#002045] text-base sm:text-lg">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        aria-label={t('admin.common.close')}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-5 sm:p-6">{children}</div>
            </div>
        </div>
    );
}
