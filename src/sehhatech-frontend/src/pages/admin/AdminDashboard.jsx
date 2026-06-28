import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

export default function AdminDashboard() {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [monthlyReport, setMonthlyReport] = useState(null);
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const statusColors = {
        Completed: 'text-green-700 bg-green-50',
        NoShow: 'text-red-600 bg-red-50',
        Scheduled: 'text-blue-700 bg-blue-50',
    };

    const statusLabels = {
        Completed: t('admin.dashboard.statusCompleted'),
        NoShow: t('admin.dashboard.statusNoShow'),
        Scheduled: t('admin.dashboard.statusScheduled'),
    };

    useEffect(() => { loadDashboard(); loadMonthlyReport(); }, []);

    useEffect(() => {
        if (!data?.activityChart?.length) return;
        import('chart.js/auto').then(({ default: Chart }) => {
            if (chartInstance.current) chartInstance.current.destroy();
            const ctx = chartRef.current?.getContext('2d');
            if (!ctx) return;
            const sorted = [...data.activityChart].sort((a, b) =>
                (a.date || a.Date) > (b.date || b.Date) ? 1 : -1
            );
            chartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sorted.map((x) => x.date || x.Date),
                    datasets: [{
                        label: t('admin.dashboard.statTodayAppointments'),
                        data: sorted.map((x) => x.count || x.Count || 0),
                        backgroundColor: '#002045',
                        borderRadius: 6,
                    }],
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } },
                        x: { grid: { display: false } },
                    },
                },
            });
        });
        return () => chartInstance.current?.destroy();
    }, [data]);

    async function loadDashboard() {
        try {
            const res = await api.get('/api/admin/dashboard');
            setData(res.data.data ?? res.data);
        } catch {
            setError(t('admin.dashboard.error'));
        }
    }

    async function loadMonthlyReport() {
        try {
            const res = await api.get('/api/admin/monthly-report');
            setMonthlyReport(res.data.data ?? res.data);
        } catch {
            setMonthlyReport(null);
        }
    }

    if (error) return <p className="text-red-500 text-sm">{error}</p>;
    if (!data) return <p className="text-slate-400 text-sm">{t('admin.dashboard.loading')}</p>;

    const stats = [
        { label: t('admin.dashboard.statTotalDoctors'), value: data.totalDoctors ?? data.TotalDoctors ?? '—', icon: 'medical_information', color: 'hover:bg-[#002045]' },
        { label: t('admin.dashboard.statTotalReceptionists'), value: data.totalReceptionists ?? data.TotalReceptionists ?? '—', icon: 'support_agent', color: 'hover:bg-teal-700' },
        { label: t('admin.dashboard.statTodayAppointments'), value: data.todayAppointments ?? data.TodayAppointments ?? '—', icon: 'calendar_today', color: 'hover:bg-green-700' },
    ];

    return (
        <div>
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{t('admin.dashboard.title')}</h1>
                <p className="text-slate-500 mt-1 text-sm">{t('admin.dashboard.subtitle')}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className={`bg-white p-5 sm:p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-4 group ${s.color} transition-all duration-300 cursor-default`}
                    >
                        <div className="p-2 rounded-lg bg-slate-50 w-fit group-hover:bg-white/20">
                            <span className="material-symbols-outlined text-slate-600 group-hover:text-white">{s.icon}</span>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-white">{s.value}</div>
                            <div className="text-sm text-slate-500 group-hover:text-white/70">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Monthly Report Card */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 sm:p-6 mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h3 className="font-bold text-[#002045]">{t('admin.dashboard.monthlyReportTitle')}</h3>
                    {monthlyReport?.isLive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                            {t('admin.dashboard.monthlyReportLive')}
                        </span>
                    )}
                </div>
                {!monthlyReport ? (
                    <p className="text-slate-400 text-sm">{t('admin.dashboard.loading')}</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                                {Number(monthlyReport.totalRevenue ?? monthlyReport.TotalRevenue ?? 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-500">{t('admin.dashboard.monthlyReportRevenue')}</div>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                                {monthlyReport.totalAppointments ?? monthlyReport.TotalAppointments ?? '—'}
                            </div>
                            <div className="text-xs text-slate-500">{t('admin.dashboard.monthlyReportAppointments')}</div>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600">
                                {monthlyReport.completedAppointments ?? monthlyReport.CompletedAppointments ?? '—'}
                            </div>
                            <div className="text-xs text-slate-500">{t('admin.dashboard.monthlyReportCompleted')}</div>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                                {monthlyReport.newPatients ?? monthlyReport.NewPatients ?? '—'}
                            </div>
                            <div className="text-xs text-slate-500">{t('admin.dashboard.monthlyReportNewPatients')}</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                {/* Chart */}
                <div className="col-span-1 lg:col-span-7 bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6">
                    <h3 className="font-bold text-[#002045] mb-4">{t('admin.dashboard.activityChartTitle')}</h3>
                    <canvas ref={chartRef} height={160} />
                </div>

                {/* Recent Registrations */}
                <div className="col-span-1 lg:col-span-5 bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6">
                    <h3 className="font-bold text-[#002045] mb-4">{t('admin.dashboard.recentRegistrationsTitle')}</h3>
                    <div className="space-y-3">
                        {(data.recentRegistrations || data.RecentRegistrations || []).length === 0 && (
                            <p className="text-slate-400 text-sm">{t('admin.dashboard.noRecentRegistrations')}</p>
                        )}
                        {(data.recentRegistrations || data.RecentRegistrations || []).map((p, i) => {
                            const name = p.fullName || p.FullName || '?';
                            const role = p.role || p.Role || '';
                            const imgUrl = p.profileImageUrl || p.ProfileImageUrl || p.photoUrl || p.PhotoUrl;
                            const createdAt = p.createdAt || p.CreatedAt;
                            const roleColor = role === 'Doctor' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700';
                            return (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-[#002045] flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                                        {imgUrl ? <img src={imgUrl} alt={name} className="w-full h-full object-cover" /> : name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-sm text-slate-900 truncate">{name}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColor}`}>{role}</span>
                                    </div>
                                    {createdAt && (
                                        <p className="text-xs text-slate-400 flex-shrink-0">
                                            {new Date(createdAt).toLocaleDateString('en-GB')}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Queue */}
                <div className="col-span-1 lg:col-span-12 bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6">
                    <h3 className="font-bold text-[#002045] mb-4">{t('admin.dashboard.upcomingQueueTitle')}</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-[560px] w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    {[
                                        t('admin.dashboard.colPatient'),
                                        t('admin.dashboard.colDoctor'),
                                        t('admin.dashboard.colDate'),
                                        t('admin.dashboard.colTime'),
                                        t('admin.dashboard.colStatus'),
                                    ].map((h) => (
                                        <th key={h} className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-3 sm:px-4">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(data.upcomingAppointments || data.UpcomingAppointments || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-sm">
                                            {t('admin.dashboard.noUpcoming')}
                                        </td>
                                    </tr>
                                ) : (
                                    (data.upcomingAppointments || data.UpcomingAppointments || []).map((a, i) => {
                                        const status = a.status || a.Status || 'Scheduled';
                                        const dt = new Date(a.scheduledAt || a.ScheduledAt);
                                        const dateStr = isNaN(dt) ? '—' : dt.toLocaleDateString('en-GB');
                                        const timeStr = isNaN(dt) ? '—' : dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                                        return (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{a.patientName || a.PatientName || '—'}</td>
                                                <td className="px-3 sm:px-4 py-3 text-slate-500 text-xs sm:text-sm">{a.doctorName || a.DoctorName || '—'}</td>
                                                <td className="px-3 sm:px-4 py-3 text-slate-500 text-xs sm:text-sm">{dateStr}</td>
                                                <td className="px-3 sm:px-4 py-3 text-slate-500 text-xs sm:text-sm">{timeStr}</td>
                                                <td className="px-3 sm:px-4 py-3">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${statusColors[status] || statusColors.Scheduled}`}>
                                                        {statusLabels[status] || statusLabels.Scheduled}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}