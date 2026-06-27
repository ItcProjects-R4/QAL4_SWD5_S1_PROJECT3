import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

export default function AdminSettings() {
    const { t } = useTranslation();
    const [form, setForm] = useState({ clinicName: '', phone: '', address: '' });
    const [sub, setSub] = useState({ active: false, expiry: '—' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    useEffect(() => { loadSettings(); }, []);

    async function loadSettings() {
        try {
            const res = await api.get('/api/admin/settings');
            const s = res.data.data ?? res.data;
            setForm({
                clinicName: s.clinicName || s.ClinicName || '',
                phone: s.phone || s.Phone || '',
                address: s.address || s.Address || '',
            });
            const expiry = s.subscriptionEnd || s.SubscriptionEnd;
            const isActive = s.isSubscriptionActive ?? s.IsSubscriptionActive ?? false;
            setSub({ active: isActive, expiry: expiry ? new Date(expiry).toLocaleDateString('en-GB') : '—' });
            localStorage.setItem('clinicName', s.clinicName || s.ClinicName || 'SehhaTech');
        } catch { setError(t('admin.settings.profile.errorLoad')); }
    }

    async function saveSettings() {
        setSaving(true); setMsg(''); setError('');
        try {
            await api.put('/api/admin/settings', {
                clinicName: form.clinicName || null,
                phone: form.phone || null,
                address: form.address || null,
            });
            localStorage.setItem('clinicName', form.clinicName || 'SehhaTech');
            setMsg(t('admin.settings.profile.successMsg'));
        } catch (e) { setError(e.response?.data?.message || t('admin.settings.profile.errorSave')); }
        finally { setSaving(false); }
    }

    const formFields = [
        { id: 'clinicName', label: t('admin.settings.profile.labelClinicName'), placeholder: t('admin.settings.profile.placeholderClinicName') },
        { id: 'phone', label: t('admin.settings.profile.labelPhone'), placeholder: t('admin.settings.profile.placeholderPhone') },
        { id: 'address', label: t('admin.settings.profile.labelAddress'), placeholder: t('admin.settings.profile.placeholderAddress') },
    ];

    return (
        <div className="max-w-2xl">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002045]">
                    {t('admin.settings.title')}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    {t('admin.settings.subtitle')}
                </p>
            </div>

            {/* Clinic Profile */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="font-bold text-[#002045] mb-4 sm:mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">business</span>
                    {t('admin.settings.profile.title')}
                </h3>
                <div className="space-y-4">
                    {formFields.map((f) => (
                        <div key={f.id}>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                            <input
                                type="text"
                                placeholder={f.placeholder}
                                value={form[f.id]}
                                onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                            />
                        </div>
                    ))}
                </div>

                {msg && <p className="mt-4 text-green-600 text-sm font-medium">{msg}</p>}
                {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="mt-5 sm:mt-6 px-5 sm:px-6 py-2.5 bg-[#002045] text-white font-bold rounded-lg hover:bg-[#1a365d] transition-colors disabled:opacity-50 text-sm"
                >
                    {saving ? t('admin.settings.profile.saving') : t('admin.settings.profile.saveBtn')}
                </button>
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6">
                <h3 className="font-bold text-[#002045] mb-4 sm:mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">verified</span>
                    {t('admin.settings.subscription.title')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">
                            {t('admin.settings.subscription.statusLabel')}
                        </p>
                        <span className={`text-sm font-bold ${sub.active ? 'text-green-600' : 'text-red-500'}`}>
                            {sub.active ? t('admin.settings.subscription.statusActive') : t('admin.settings.subscription.statusInactive')}
                        </span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">
                            {t('admin.settings.subscription.expiresLabel')}
                        </p>
                        <p className="font-bold text-slate-900">{sub.expiry}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}