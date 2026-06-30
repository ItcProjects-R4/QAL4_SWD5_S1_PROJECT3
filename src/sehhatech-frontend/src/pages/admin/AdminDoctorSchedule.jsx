import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import portalApi from '../../api/portalApi';
import AdminModal from '../../components/AdminModal';

function toInputTime(t) { if (!t) return ''; return t.substring(0, 5); }

export default function AdminDoctorSchedule() {
    const { doctorId } = useParams();
    const { t } = useTranslation();
    const [doctorName, setDoctorName] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [form, setForm] = useState({ dayOfWeek: 0, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, maxPatientsPerSlot: 1 });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const DAYS = [
        { value: 0, label: t('admin.doctorSchedule.days.sunday') },
        { value: 1, label: t('admin.doctorSchedule.days.monday') },
        { value: 2, label: t('admin.doctorSchedule.days.tuesday') },
        { value: 3, label: t('admin.doctorSchedule.days.wednesday') },
        { value: 4, label: t('admin.doctorSchedule.days.thursday') },
        { value: 5, label: t('admin.doctorSchedule.days.friday') },
        { value: 6, label: t('admin.doctorSchedule.days.saturday') },
    ];

    useEffect(() => { loadDoctorInfo(); loadSchedules(); }, [doctorId]);

    async function loadDoctorInfo() {
        try {
            const res = await api.get('/api/admin/doctors');
            const list = res.data.data ?? res.data;
            const found = (list || []).find(d => String(d.id ?? d.Id) === String(doctorId));
            if (found) setDoctorName(found.fullName || found.FullName || '');
        } catch { }
    }

    async function loadSchedules() {
        setLoading(true); setError('');
        try {
            const res = await portalApi.get(`/api/portal/admin/slots/${doctorId}`);
            const list = Array.isArray(res.data) ? res.data : [];
            list.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));
            setSchedules(list);
        } catch (e) {
            setError(e.response?.data?.message || t('admin.doctorSchedule.errorLoad'));
        } finally { setLoading(false); }
    }

    async function submitAdd() {
        setFormError('');
        if (!form.startTime || !form.endTime) { setFormError(t('admin.doctorSchedule.errorFillTimes')); return; }
        if (form.startTime >= form.endTime) { setFormError(t('admin.doctorSchedule.errorEndAfterStart')); return; }
        setSubmitting(true);
        try {
            await portalApi.post('/api/portal/admin/slots', {
                doctorId: Number(doctorId), dayOfWeek: Number(form.dayOfWeek),
                startTime: `${form.startTime}:00`, endTime: `${form.endTime}:00`,
                slotDurationMinutes: Number(form.slotDurationMinutes),
                maxPatientsPerSlot: Number(form.maxPatientsPerSlot),
            });
            setAddOpen(false);
            setForm({ dayOfWeek: 0, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, maxPatientsPerSlot: 1 });
            loadSchedules();
        } catch (e) {
            setFormError(e.response?.data?.message || t('admin.doctorSchedule.errorAdd'));
        } finally { setSubmitting(false); }
    }

    async function confirmDelete() {
        if (!deleteTarget) return;
        try {
            await portalApi.delete(`/api/portal/admin/slots/${deleteTarget.id}`);
            setDeleteTarget(null); loadSchedules();
        } catch { setDeleteTarget(null); }
    }

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            <Link to="/admin/doctors" className="flex items-center gap-1 text-slate-500 hover:text-[#002045] transition-colors text-sm font-medium mb-5 sm:mb-6 w-fit">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                {t('admin.doctorSchedule.backToDoctors')}
            </Link>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002045]">
                        {t('admin.doctorSchedule.title')} {doctorName ? `— ${doctorName}` : ''}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{t('admin.doctorSchedule.subtitle')}</p>
                </div>
                <button
                    onClick={() => setAddOpen(true)}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#002045] text-white rounded-lg font-bold text-sm hover:bg-[#1a365d] transition-colors shadow self-start sm:self-auto shrink-0"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    {t('admin.doctorSchedule.addBtn')}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                    <table className="min-w-[320px] w-full text-left">
                        <thead>
                            <tr className="bg-slate-50">
                                {[
                                    { label: t('admin.doctorSchedule.colDay'), hide: false },
                                    { label: t('admin.doctorSchedule.colWorkingHours'), hide: false },
                                    { label: t('admin.doctorSchedule.colSlotDuration'), hide: true },
                                    { label: t('admin.doctorSchedule.colMaxPerSlot'), hide: true },
                                    { label: '', hide: false },
                                ].map(({ label, hide }, idx) => (
                                    <th key={idx} className={`px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap ${label === '' ? 'text-right' : ''} ${hide ? 'hidden md:table-cell' : ''}`}>{label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">{t('admin.doctorSchedule.loading')}</td></tr>
                            ) : error ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-red-500">{error}</td></tr>
                            ) : schedules.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">{t('admin.doctorSchedule.empty')}</td></tr>
                            ) : (
                                schedules.map((s) => {
                                    const dayLabel = DAYS.find(d => d.value === s.dayOfWeek)?.label || s.dayOfWeek;
                                    return (
                                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap"><span className="font-bold text-[#002045] text-sm">{dayLabel}</span></td>
                                            <td className="px-4 sm:px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{toInputTime(s.startTime)} — {toInputTime(s.endTime)}</td>
                                            <td className="px-4 sm:px-6 py-4 text-sm text-slate-500 whitespace-nowrap hidden md:table-cell">{s.slotDurationMinutes} {t('admin.doctorSchedule.minutesSuffix')}</td>
                                            <td className="px-4 sm:px-6 py-4 text-sm text-slate-500 hidden md:table-cell">{s.maxPatientsPerSlot}</td>
                                            <td className="px-4 sm:px-6 py-4 text-right">
                                                <button onClick={() => setDeleteTarget({ id: s.id, label: dayLabel })} className="p-1.5 sm:p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition-colors">
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

            <AdminModal open={addOpen} onClose={() => { setAddOpen(false); setFormError(''); }} title={t('admin.doctorSchedule.addModalTitle')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{t('admin.doctorSchedule.labelDay')}</label>
                        <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]">
                            {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {[
                            { key: 'startTime', label: t('admin.doctorSchedule.labelStartTime') },
                            { key: 'endTime', label: t('admin.doctorSchedule.labelEndTime') },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                                <input type="time" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{t('admin.doctorSchedule.labelSlotDuration')}</label>
                            <input type="number" min={5} step={5} value={form.slotDurationMinutes} onChange={(e) => setForm({ ...form, slotDurationMinutes: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{t('admin.doctorSchedule.labelMaxPatients')}</label>
                            <input type="number" min={1} value={form.maxPatientsPerSlot} onChange={(e) => setForm({ ...form, maxPatientsPerSlot: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]" />
                        </div>
                    </div>
                    {formError && <p className="text-red-500 text-sm">{formError}</p>}
                    <button onClick={submitAdd} disabled={submitting} className="w-full py-3 bg-[#002045] text-white font-bold rounded-lg hover:bg-[#1a365d] transition-colors disabled:opacity-50">
                        {submitting ? t('admin.doctorSchedule.submitting') : t('admin.doctorSchedule.submitBtn')}
                    </button>
                </div>
            </AdminModal>

            <AdminModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('admin.doctorSchedule.deleteModalTitle')}>
                <p className="text-slate-600 text-sm mb-6">{t('admin.doctorSchedule.deleteConfirmText', { day: deleteTarget?.label })}</p>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">{t('admin.doctorSchedule.cancel')}</button>
                    <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600">{t('admin.doctorSchedule.remove')}</button>
                </div>
            </AdminModal>
        </div>
    );
}
