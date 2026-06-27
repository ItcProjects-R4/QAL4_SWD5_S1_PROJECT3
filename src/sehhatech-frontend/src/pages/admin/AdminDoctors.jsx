import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import AdminModal from '../../components/AdminModal';

export default function AdminDoctors() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [form, setForm] = useState({ name: '', specialization: '', email: '' });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');

    useEffect(() => { loadDoctors(); }, []);

    async function loadDoctors() {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/doctors');
            setDoctors(res.data.data ?? res.data);
        } catch {
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }

    async function submitAdd() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.name || !form.specialization || !form.email) {
            setFormError(t('admin.doctors.errorFillFields')); return;
        }
        if (!emailRegex.test(form.email)) {
            setFormError(t('admin.doctors.errorInvalidEmail')); return;
        }
        setSubmitting(true);
        try {
            await api.post('/api/admin/doctors', {
                fullName: form.name,
                specialization: form.specialization,
                email: form.email,
                profileImageUrl: photoFile || null,
            });
            setAddOpen(false);
            setForm({ name: '', specialization: '', email: '' });
            setPhotoFile(null); setPhotoPreview(''); setFormError('');
            loadDoctors();
        } catch (e) {
            setFormError(e.response?.data?.message || t('admin.doctors.errorAdd'));
        } finally {
            setSubmitting(false);
        }
    }

    function handlePhotoChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { setPhotoFile(ev.target.result); setPhotoPreview(ev.target.result); };
        reader.readAsDataURL(file);
    }

    async function toggleDoctor(id) {
        try { await api.put(`/api/admin/doctors/${id}/toggle`); loadDoctors(); } catch { }
    }

    async function confirmDelete() {
        if (!deleteTarget) return;
        try {
            await api.delete(`/api/admin/doctors/${deleteTarget.id}`);
            setDeleteTarget(null); loadDoctors();
        } catch { setDeleteTarget(null); }
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002045]">{t('admin.doctors.title')}</h1>
                    <p className="text-slate-500 text-sm mt-1">{t('admin.doctors.subtitle')}</p>
                </div>
                <button
                    onClick={() => setAddOpen(true)}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#002045] text-white rounded-lg font-bold text-sm hover:bg-[#1a365d] transition-colors shadow self-start sm:self-auto"
                >
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    {t('admin.doctors.addBtn')}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[580px] w-full text-left">
                        <thead>
                            <tr className="bg-slate-50">
                                {[
                                    t('admin.doctors.colDoctor'),
                                    t('admin.doctors.colSpecialization'),
                                    t('admin.doctors.colContact'),
                                    t('admin.doctors.colStatus'),
                                    '',
                                ].map((h, idx) => (
                                    <th key={idx} className={`px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider ${h === '' ? 'text-right' : ''}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">{t('admin.doctors.loading')}</td></tr>
                            ) : doctors.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">{t('admin.doctors.empty')}</td></tr>
                            ) : (
                                doctors.map((d) => {
                                    const isActive = d.isActive ?? d.IsActive;
                                    const id = d.id || d.Id;
                                    const name = d.fullName || d.FullName || '?';
                                    const photo = d.profileImageUrl || d.ProfileImageUrl || d.photoUrl || d.PhotoUrl;
                                    return (
                                        <tr key={id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#002045] flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                                                        {photo ? <img src={photo} alt={name} className="w-full h-full object-cover" /> : name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-[#002045] text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{name}</p>
                                                        <p className="text-xs text-slate-400 truncate max-w-[100px] sm:max-w-none">{d.email || d.Email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-slate-700">{d.specialization || d.Specialization || '—'}</td>
                                            <td className="px-4 sm:px-6 py-4 text-xs text-slate-500">{d.email || d.Email || '—'}</td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-[10px] font-bold uppercase ${isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {isActive ? t('admin.doctors.active') : t('admin.doctors.inactive')}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1 sm:gap-2">
                                                    <button onClick={() => navigate(`/admin/doctors/${id}/schedule`)} className="p-1.5 sm:p-2 hover:bg-blue-50 hover:text-[#002045] rounded-lg text-slate-400 transition-colors" title={t('admin.doctors.manageSchedule')}>
                                                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                                                    </button>
                                                    <button onClick={() => toggleDoctor(id)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors" title={isActive ? t('admin.doctors.deactivate') : t('admin.doctors.activate')}>
                                                        <span className="material-symbols-outlined text-lg">{isActive ? 'toggle_on' : 'toggle_off'}</span>
                                                    </button>
                                                    <button onClick={() => setDeleteTarget({ id, name })} className="p-1.5 sm:p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition-colors">
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminModal open={addOpen} onClose={() => { setAddOpen(false); setFormError(''); setPhotoFile(null); setPhotoPreview(''); }} title={t('admin.doctors.addModalTitle')}>
                <div className="space-y-4">
                    {[
                        { id: 'name', label: t('admin.doctors.labelName'), placeholder: t('admin.doctors.placeholderName') },
                        { id: 'specialization', label: t('admin.doctors.labelSpecialization'), placeholder: t('admin.doctors.placeholderSpecialization') },
                        { id: 'email', label: t('admin.doctors.labelEmail'), placeholder: t('admin.doctors.placeholderEmail'), type: 'email' },
                    ].map((f) => (
                        <div key={f.id}>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                            <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.id]} onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]" />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                            {t('admin.doctors.labelPhoto')} <span className="font-normal normal-case text-slate-400">{t('admin.doctors.photoOptional')}</span>
                        </label>
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                            <span className="material-symbols-outlined text-slate-400 text-3xl mb-1">upload</span>
                            <span className="text-xs text-slate-400">{t('admin.doctors.photoUploadHint')}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        </label>
                        {photoPreview && (
                            <div className="mt-2 flex items-center gap-3">
                                <img src={photoPreview} alt="preview" className="w-14 h-14 rounded-full object-cover border-2 border-slate-200" />
                                <button onClick={() => { setPhotoFile(null); setPhotoPreview(''); }} className="text-xs text-red-500 hover:underline">{t('admin.doctors.removePhoto')}</button>
                            </div>
                        )}
                    </div>
                    {formError && <p className="text-red-500 text-sm">{formError}</p>}
                    <button onClick={submitAdd} disabled={submitting} className="w-full py-3 bg-[#002045] text-white font-bold rounded-lg hover:bg-[#1a365d] transition-colors disabled:opacity-50">
                        {submitting ? t('admin.doctors.submitting') : t('admin.doctors.submitBtn')}
                    </button>
                </div>
            </AdminModal>

            <AdminModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('admin.doctors.deleteModalTitle')}>
                <p className="text-slate-600 text-sm mb-6">{t('admin.doctors.deleteConfirmText', { name: deleteTarget?.name })}</p>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">{t('admin.doctors.cancel')}</button>
                    <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600">{t('admin.doctors.delete')}</button>
                </div>
            </AdminModal>
        </div>
    );
}
