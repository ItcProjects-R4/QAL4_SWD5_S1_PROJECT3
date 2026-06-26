import { useEffect, useState } from 'react';
import api from '../../api/axios';

function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-[#002045] text-base sm:text-lg">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-5 sm:p-6">{children}</div>
            </div>
        </div>
    );
}

export default function AdminReceptionists() {
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
        if (!form.name || !form.email) { setFormError('Please fill all required fields.'); return; }
        if (!emailRegex.test(form.email)) { setFormError('Please enter a valid email (e.g. name@example.com).'); return; }
        setSubmitting(true);
        try {
            await api.post('/api/admin/receptionists', { fullName: form.name, email: form.email, profileImageUrl: photoFile || null });
            setAddOpen(false); setForm({ name: '', email: '' }); setPhotoFile(null); setPhotoPreview(''); setFormError('');
            loadRecs();
        } catch (e) { setFormError(e.response?.data?.message || 'Failed to add receptionist.'); }
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
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002045]">Receptionists</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage reception staff and their access.</p>
                </div>
                <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#002045] text-white rounded-lg font-bold text-sm hover:bg-[#1a365d] transition-colors shadow self-start sm:self-auto">
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    Add Receptionist
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[480px] w-full text-left">
                        <thead>
                            <tr className="bg-slate-50">
                                {['Receptionist', 'Email', 'Status', ''].map((h) => (
                                    <th key={h} className={`px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider ${h === '' ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Loading...</td></tr>
                            ) : recs.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">No receptionists yet.</td></tr>
                            ) : (
                                recs.map((r) => {
                                    const isActive = r.isActive ?? r.IsActive;
                                    const name = r.fullName || r.FullName || '?';
                                    const photo = r.profileImageUrl || r.ProfileImageUrl || r.photoUrl || r.PhotoUrl;
                                    return (
                                        <tr key={r.id || r.Id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                                                        {photo ? <img src={photo} alt={name} className="w-full h-full object-cover" /> : name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-[#002045] text-xs sm:text-sm truncate">{name}</p>
                                                        <p className="text-xs text-slate-400 truncate">{r.email || r.Email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-xs text-slate-500 truncate max-w-[120px] sm:max-w-none">{r.email || r.Email || '—'}</td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-[10px] font-bold uppercase ${isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-right">
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

            <Modal open={addOpen} onClose={() => { setAddOpen(false); setFormError(''); setPhotoFile(null); setPhotoPreview(''); }} title="Add Receptionist">
                <div className="space-y-4">
                    {[
                        { id: 'name', label: 'Full Name *', placeholder: 'Nour Ahmed' },
                        { id: 'email', label: 'Email *', placeholder: 'reception@clinic.com', type: 'email' },
                    ].map((f) => (
                        <div key={f.id}>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                            <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.id]} onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]" />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Photo <span className="font-normal normal-case text-slate-400">(optional)</span></label>
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                            <span className="material-symbols-outlined text-slate-400 text-3xl mb-1">upload</span>
                            <span className="text-xs text-slate-400">Click to upload image</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        </label>
                        {photoPreview && (
                            <div className="mt-2 flex items-center gap-3">
                                <img src={photoPreview} alt="preview" className="w-14 h-14 rounded-full object-cover border-2 border-slate-200" />
                                <button onClick={() => { setPhotoFile(null); setPhotoPreview(''); }} className="text-xs text-red-500 hover:underline">Remove</button>
                            </div>
                        )}
                    </div>
                    {formError && <p className="text-red-500 text-sm">{formError}</p>}
                    <button onClick={submitAdd} disabled={submitting} className="w-full py-3 bg-[#002045] text-white font-bold rounded-lg hover:bg-[#1a365d] transition-colors disabled:opacity-50">
                        {submitting ? 'Adding...' : 'Add Receptionist'}
                    </button>
                </div>
            </Modal>

            <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete">
                <p className="text-slate-600 text-sm mb-6">Are you sure you want to remove <span className="font-bold text-slate-900">"{deleteTarget?.name}"</span>? This action cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600">Delete</button>
                </div>
            </Modal>
        </div>
    );
}