import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import AdminModal from '../../components/AdminModal';

export default function AdminReceptionists() {
    const { t } = useTranslation();
    const [recs, setRecs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [form, setForm] = useState({ name: '', email: '' });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');

    useEffect(() => { loadRecs(); }, []);

    async function loadRecs() {
        setLoading(true);
        try { const res = await api.get('/api/admin/receptionists'); setRecs(res.data.data ?? res.data); }
        catch { setRecs([]); }
        finally { setLoading(false); }
    }

    async function submitAdd() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.name || !form.email) { setFormError(t('admin.receptionists.errorFillFields')); return; }
        if (!emailRegex.test(form.email)) { setFormError(t('admin.receptionists.errorInvalidEmail')); return; }
        setSubmitting(true);
        try {
            await api.post('/api/admin/receptionists', { fullName: form.name, email: form.email, profileImageUrl: photoFile || null });
            setAddOpen(false); setForm({ name: '', email: '' }); setPhotoFile(null); setPhotoPreview(''); setFormError('');
            loadRecs();
        } catch (e) { setFormError(e.response?.data?.message || t('admin.receptionists.errorAdd')); }
        finally { setSubmitting(false); }
    }

    function handlePhotoChange(e) {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { setPhotoFile(ev.target.result); setPhotoPreview(ev.target.result); };
        reader.readAsDataURL(file);
    }

    async function confirmDelete() {
        if (!deleteTarget) return;
        try { await api.delete(`/api/admin/receptionists/${deleteTarget.id}`); setDeleteTarget(null); loadRecs(); }
        catch { setDeleteTarget(null); }
    }

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002045]">{t('admin.receptionists.title')}</h1>
                    <p className="text-slate-500 text-sm mt-1">{t('admin.receptionists.subtitle')}</p>
                </div>
                <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#002045] text-white rounded-lg font-bold text-sm hover:bg-[#1a365d] transition-colors shadow self-start sm:self-auto shrink-0">
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    {t('admin.receptionists.addBtn')}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                    {/*
                        Table is forced to a fixed logical column order (Receptionist -> Email -> Status -> Actions)
                        regardless of document direction. We do this with `dir="ltr"` on the table itself and then
                        flip text-alignment with `start`/`end` (logical) classes so Arabic text still reads correctly,
                        but the column order never gets silently reversed by the browser's RTL table layout, which is
                        what was pushing the actions column outside the card.
                    */}
                    <table dir="ltr" className="min-w-[280px] w-full text-start">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-start whitespace-nowrap">
                                    {t('admin.receptionists.colReceptionist')}
                                </th>
                                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-start hidden md:table-cell whitespace-nowrap">
                                    {t('admin.receptionists.colEmail')}
                                </th>
                                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-start whitespace-nowrap">
                                    {t('admin.receptionists.colStatus')}
                                </th>
                                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-end">
                                    {/* actions column, no label */}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">{t('admin.receptionists.loading')}</td></tr>
                            ) : recs.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">{t('admin.receptionists.empty')}</td></tr>
                            ) : (
                                recs.map((r) => {
                                    const isActive = r.isActive ?? r.IsActive;
                                    const name = r.fullName || r.FullName || '?';
                                    const photo = r.profileImageUrl || r.ProfileImageUrl || r.photoUrl || r.PhotoUrl;
                                    return (
                                        <tr key={r.id || r.Id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 sm:px-6 py-4 text-start">
                                                <div dir="ltr" className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                                                        {photo ? <img src={photo} alt={name} className="w-full h-full object-cover" /> : name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p dir="auto" className="font-bold text-[#002045] text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{name}</p>
                                                        <p dir="ltr" className="text-xs text-slate-400 truncate max-w-[100px] sm:max-w-none">{r.email || r.Email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-xs text-slate-500 truncate max-w-[120px] sm:max-w-none text-start hidden md:table-cell" dir="ltr">
                                                {r.email || r.Email || '—'}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-start">
                                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-[10px] font-bold uppercase whitespace-nowrap ${isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {isActive ? t('admin.receptionists.active') : t('admin.receptionists.inactive')}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-end">
                                                <button onClick={() => setDeleteTarget({ id: r.id || r.Id, name })} className="p-1.5 sm:p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition-colors">
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminModal open={addOpen} onClose={() => { setAddOpen(false); setFormError(''); setPhotoFile(null); setPhotoPreview(''); }} title={t('admin.receptionists.addModalTitle')}>
                <div className="space-y-4">
                    {[
                        { id: 'name', label: t('admin.receptionists.labelName'), placeholder: t('admin.receptionists.placeholderName') },
                        { id: 'email', label: t('admin.receptionists.labelEmail'), placeholder: t('admin.receptionists.placeholderEmail'), type: 'email' },
                    ].map((f) => (
                        <div key={f.id}>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                            <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.id]} onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]" />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{t('admin.receptionists.labelPhoto')} <span className="font-normal normal-case text-slate-400">{t('admin.receptionists.photoOptional')}</span></label>
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                            <span className="material-symbols-outlined text-slate-400 text-3xl mb-1">upload</span>
                            <span className="text-xs text-slate-400">{t('admin.receptionists.photoUploadHint')}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        </label>
                        {photoPreview && (
                            <div className="mt-2 flex items-center gap-3">
                                <img src={photoPreview} alt="preview" className="w-14 h-14 rounded-full object-cover border-2 border-slate-200" />
                                <button onClick={() => { setPhotoFile(null); setPhotoPreview(''); }} className="text-xs text-red-500 hover:underline">{t('admin.receptionists.removePhoto')}</button>
                            </div>
                        )}
                    </div>
                    {formError && <p className="text-red-500 text-sm">{formError}</p>}
                    <button onClick={submitAdd} disabled={submitting} className="w-full py-3 bg-[#002045] text-white font-bold rounded-lg hover:bg-[#1a365d] transition-colors disabled:opacity-50">
                        {submitting ? t('admin.receptionists.submitting') : t('admin.receptionists.submitBtn')}
                    </button>
                </div>
            </AdminModal>

            <AdminModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('admin.receptionists.deleteModalTitle')}>
                <p className="text-slate-600 text-sm mb-6">{t('admin.receptionists.deleteConfirmText', { name: deleteTarget?.name })}</p>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">{t('admin.receptionists.cancel')}</button>
                    <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600">{t('admin.receptionists.delete')}</button>
                </div>
            </AdminModal>
        </div>
    );
}
