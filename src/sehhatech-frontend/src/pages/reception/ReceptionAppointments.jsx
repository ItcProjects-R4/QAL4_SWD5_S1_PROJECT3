import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { receptionApi } from "../../api/receptionApi";

import { useToast } from "../../hooks/useToast";
import ReceptionTopbar from "../../components/ReceptionTopbar";
import Toast from "../../components/Toast";

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

function getInitials(name) {
    if (!name) return "PT";
    return String(name)
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
}

function formatTime(value, locale) {
    if (!value) return "--:--";
    return new Date(value).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDateShort(value, locale) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
    });
}

function formatLongDate(value, locale) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString(locale, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatMonthTitle(value, locale) {
    if (!value) return "";
    return new Date(value).toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
    });
}

function StatusBadge({ status }) {
    const s = String(status || "").toLowerCase();

    const map = {
        checkedin: "bg-emerald-100 text-emerald-700",
        scheduled: "bg-blue-100 text-blue-700",
        cancelled: "bg-red-100 text-red-700",
        completed: "bg-slate-100 text-slate-600",
    };

    const cls = map[s] || "bg-amber-100 text-amber-700";
    const label = s === "checkedin" ? "Checked In" : (status || "-");

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cls}`}>
            {label}
        </span>
    );
}

function getAppointmentInputClass(hasError, color = "emerald") {
    const normalFocus =
        color === "blue"
            ? "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10"
            : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/10";

    return `h-12 w-full rounded-2xl border bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:bg-white focus:ring-4 ${hasError
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
            : normalFocus
        }`;
}

export default function ReceptionAppointments() {
    const { openSidebar } = useOutletContext();
    const { toast, showToast } = useToast();
    const { t, i18n } = useTranslation("common");
    const locale = i18n.language === "ar" ? "ar-EG" : "en-US";

    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [queueItems, setQueueItems] = useState([]);

    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState(todayISO());
    const [toDate, setToDate] = useState(todayISO());
    const [quickDate, setQuickDate] = useState(todayISO());
    const [quickDoctor, setQuickDoctor] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [booking, setBooking] = useState(false);
    const [appointmentErrors, setAppointmentErrors] = useState({});

    const [form, setForm] = useState({
        patientId: "",
        doctorId: "",
        appointmentDate: "",
        duration: "00:30:00",
        notes: "",
    });

    const loadStaticData = useCallback(async () => {
        try {
            const [dashboardData, patientsData, doctorsData] = await Promise.all([
                receptionApi.getDashboard(),
                receptionApi.getPatients(),
                receptionApi.getAvailableDoctors(),
            ]);

            setQueueItems(dashboardData.queue?.data || []);
            setPatients(patientsData.data || []);
            setDoctors(doctorsData.data || dashboardData.availableDoctors?.data || []);
        } catch (err) {
            console.error(err);
            showToast(err.message || t("reception.appointments.failedLoad"), "error");
        }
    }, [showToast, t]);

    const loadAppointments = useCallback(async () => {
        setLoading(true);
        setError(false);

        try {
            const params = new URLSearchParams();

            if (fromDate) params.append("from", fromDate);
            if (toDate) params.append("to", toDate);

            params.append("page", currentPage);
            params.append("pageSize", pageSize);

            const data = await receptionApi.getAppointments(params.toString());

            setAppointments(data.data || []);
            setTotalPages(data.totalPages || 1);
            setTotalCount(data.totalCount ?? (data.data || []).length);
        } catch (err) {
            console.error(err);
            setError(true);
            showToast(err.message || t("reception.appointments.failedLoad"), "error");
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, currentPage, showToast, t]);

    useEffect(() => {
        loadStaticData();
    }, [loadStaticData]);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    const filteredAppointments = search
        ? appointments.filter((a) => {
            const value = search.trim().toLowerCase();
            return (
                String(a.patientName || "").toLowerCase().includes(value) ||
                String(a.doctorSpecialization || "").toLowerCase().includes(value) ||
                String(a.status || "").toLowerCase().includes(value) ||
                String(a.notes || "").toLowerCase().includes(value)
            );
        })
        : appointments;

    const scheduledCount = appointments.filter(
        (a) => String(a.status).toLowerCase() === "scheduled"
    ).length;

    const checkedInCount = appointments.filter(
        (a) => String(a.status).toLowerCase() === "checkedin"
    ).length;

    const queueCount = queueItems.length;

    const waitValues = queueItems
        .map((q) => Number(q.waitingMinutes || 0))
        .filter((v) => v > 0);

    const avgWait = waitValues.length
        ? Math.round(waitValues.reduce((a, b) => a + b, 0) / waitValues.length)
        : 0;

    function updateAppointmentField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setAppointmentErrors((prev) => ({ ...prev, [field]: "", form: "" }));
    }

    function validateAppointmentForm(currentForm) {
        const errors = {};

        if (!currentForm.patientId) {
            errors.patientId = t("reception.appointments.errSelectPatient");
        }

        if (!currentForm.doctorId) {
            errors.doctorId = t("reception.appointments.errSelectDoctor");
        }

        if (!currentForm.appointmentDate) {
            errors.appointmentDate = t("reception.appointments.errDateRequired");
        } else {
            const selectedDate = new Date(currentForm.appointmentDate);
            const now = new Date();

            if (Number.isNaN(selectedDate.getTime())) {
                errors.appointmentDate = t("reception.appointments.errDateInvalid");
            } else if (selectedDate <= now) {
                errors.appointmentDate = t("reception.appointments.errDatePast");
            }
        }

        if (!currentForm.duration) {
            errors.duration = t("reception.appointments.errDuration");
        }

        if (currentForm.notes && currentForm.notes.length > 500) {
            errors.notes = t("reception.appointments.errNotesTooLong");
        }

        return errors;
    }

    function mapAppointmentBackendError(message) {
        const lowerMessage = String(message || "").toLowerCase();

        if (lowerMessage.includes("patient")) {
            return { patientId: message };
        }

        if (lowerMessage.includes("doctor already has an appointment")) {
            return { form: t("reception.appointments.errDoctorBusy") };
        }

        if (lowerMessage.includes("doctor")) {
            return { doctorId: message };
        }

        if (lowerMessage.includes("date") || lowerMessage.includes("time")) {
            return { appointmentDate: message };
        }

        if (lowerMessage.includes("duration")) {
            return { duration: message };
        }

        return { form: message || t("reception.appointments.errGeneral") };
    }

    function openAppointmentModal() {
        setAppointmentErrors({});
        setModalOpen(true);
    }

    function closeAppointmentModal() {
        setModalOpen(false);
        setAppointmentErrors({});
    }

    async function checkInAppointment(appointmentId) {
        if (!appointmentId) return;

        try {
            const result = await receptionApi.checkInAppointment(appointmentId);
            showToast(result?.message || t("reception.appointments.checkIn"));
            await Promise.all([loadAppointments(), loadStaticData()]);
        } catch (err) {
            showToast(err.message || t("reception.appointments.failedLoad"), "error");
        }
    }

    function applyQuickSearch() {
        if (quickDate) {
            setFromDate(quickDate);
            setToDate(quickDate);
        }
        setCurrentPage(1);
    }

    async function handleBookAppointment(e) {
        e.preventDefault();

        const validationErrors = validateAppointmentForm(form);

        if (Object.keys(validationErrors).length > 0) {
            setAppointmentErrors(validationErrors);
            showToast(t("reception.appointments.validationFix"), "error");
            return;
        }

        setBooking(true);
        setAppointmentErrors({});

        try {
            const result = await receptionApi.bookAppointment({
                patientId: Number(form.patientId),
                doctorId: Number(form.doctorId),
                appointmentDate: form.appointmentDate,
                duration: form.duration,
                notes: form.notes.trim(),
            });

            showToast(result?.message || t("reception.appointments.bookBtn"));

            setModalOpen(false);
            setForm({
                patientId: "",
                doctorId: "",
                appointmentDate: "",
                duration: "00:30:00",
                notes: "",
            });

            setAppointmentErrors({});
            setCurrentPage(1);

            await Promise.all([loadAppointments(), loadStaticData()]);
        } catch (err) {
            const message = err.message || t("reception.appointments.errGeneral");
            setAppointmentErrors(mapAppointmentBackendError(message));
            showToast(message, "error");
        } finally {
            setBooking(false);
        }
    }

    return (
        <>
            <ReceptionTopbar title={t("reception.appointments.title")} onMenuClick={openSidebar}>
                <div className="relative w-full xl:max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                        search
                    </span>

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                        placeholder={t("reception.appointments.searchPlaceholder")}
                    />
                </div>

                <button
                    onClick={loadAppointments}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 inline-flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    {t("reception.appointments.refresh")}
                </button>

                <button
                    onClick={openAppointmentModal}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 inline-flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">event_available</span>
                    {t("reception.appointments.newAppointment")}
                </button>
            </ReceptionTopbar>

            <div className="p-4 lg:p-8 max-w-[1440px] mx-auto space-y-6">
                {/* Header + Date Filter */}
                <section className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-manrope">
                            {t("reception.appointments.dailySchedule")}
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            {loading
                                ? t("reception.appointments.loadingAppointments")
                                : `${formatLongDate(fromDate, locale)} • ${totalCount} ${t("reception.appointments.appointmentsLoaded")}`}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto">
                        <label className="block">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {t("reception.appointments.from")}
                            </span>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="mt-1 w-full rounded-lg border-slate-200 bg-white text-sm focus:ring-blue-600 focus:border-blue-600"
                            />
                        </label>

                        <label className="block">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {t("reception.appointments.to")}
                            </span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="mt-1 w-full rounded-lg border-slate-200 bg-white text-sm focus:ring-blue-600 focus:border-blue-600"
                            />
                        </label>

                        <button
                            onClick={() => setCurrentPage(1)}
                            className="mt-5 sm:mt-6 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 inline-flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">filter_alt</span>
                            {t("reception.appointments.apply")}
                        </button>
                    </div>
                </section>

                {/* KPIs */}
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500">{t("reception.appointments.appointments")}</p>
                        <h2 className="text-3xl font-black mt-2">{totalCount}</h2>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500">{t("reception.appointments.scheduled")}</p>
                        <h2 className="text-3xl font-black mt-2">{scheduledCount}</h2>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500">{t("reception.appointments.checkedIn")}</p>
                        <h2 className="text-3xl font-black mt-2">{checkedInCount}</h2>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500">{t("reception.appointments.availableDoctors")}</p>
                        <h2 className="text-3xl font-black mt-2">{doctors.length}</h2>
                    </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    {/* Appointments List */}
                    <section className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                    {t("reception.appointments.appointmentQueue")}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    {loading
                                        ? t("reception.appointments.loadingEntries")
                                        : `${t("reception.dashboard.loading").replace("جارٍ التحميل...", "")}${filteredAppointments.length} ${t("reception.appointments.showingAppointments")}`}
                                </p>
                            </div>

                            <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded w-fit">
                                {t("reception.appointments.liveUpdates")}
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {loading && (
                                <div className="px-6 py-10 text-center text-slate-500">
                                    {t("reception.appointments.loadingList")}
                                </div>
                            )}

                            {!loading && error && (
                                <div className="px-6 py-10 text-center text-red-500">
                                    {t("reception.appointments.failedLoad")}
                                </div>
                            )}

                            {!loading && !error && filteredAppointments.length === 0 && (
                                <div className="px-6 py-10 text-center text-slate-500">
                                    {t("reception.appointments.noAppointments")}
                                </div>
                            )}

                            {!loading &&
                                !error &&
                                filteredAppointments.map((a) => {
                                    const status = a.status || "Scheduled";
                                    const disabled = ["CheckedIn", "Completed", "Cancelled"].includes(status);
                                    const patientName = a.patientName || `Patient #${a.patientId || "-"}`;

                                    return (
                                        <div
                                            key={a.id}
                                            className={`group flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 sm:px-6 py-5 hover:bg-slate-50 transition-colors ${status === "CheckedIn" ? "bg-emerald-50/40" : ""
                                                }`}
                                        >
                                            <div className="flex items-start sm:items-center gap-5">
                                                <div className="text-center w-16 shrink-0">
                                                    <span
                                                        className={`block text-lg font-extrabold ${status === "CheckedIn" ? "text-emerald-600" : "text-slate-900"
                                                            }`}
                                                    >
                                                        {formatTime(a.appointmentDate, locale)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                                                        {formatDateShort(a.appointmentDate, locale)}
                                                    </span>
                                                </div>

                                                <div className="h-12 w-px bg-slate-200 hidden sm:block" />

                                                <div>
                                                    <h4 className="text-base font-bold text-slate-900">{patientName}</h4>

                                                    <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1 mt-1">
                                                        <span className="material-symbols-outlined text-[14px]">stethoscope</span>
                                                        {a.doctorSpecialization || "Doctor"} •{" "}
                                                        {a.notes || t("reception.dashboard.visit")}
                                                    </p>

                                                    <div className="mt-2">
                                                        <StatusBadge status={status} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-3 lg:justify-end">
                                                <button
                                                    disabled
                                                    className="px-5 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-bold cursor-not-allowed"
                                                >
                                                    {t("reception.appointments.reschedule")}
                                                </button>

                                                {disabled ? (
                                                    <button
                                                        disabled
                                                        className="px-5 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-bold cursor-not-allowed"
                                                    >
                                                        {t("reception.appointments.checkIn")}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => checkInAppointment(a.id)}
                                                        className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
                                                    >
                                                        {t("reception.appointments.checkIn")}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-xs text-slate-500">
                                {t("reception.appointments.page")} {currentPage} {t("reception.appointments.of")} {totalPages}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage <= 1}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-white disabled:opacity-50"
                                >
                                    {t("reception.appointments.previous")}
                                </button>

                                <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-white disabled:opacity-50"
                                >
                                    {t("reception.appointments.next")}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Right Panel */}
                    <aside className="xl:col-span-4 space-y-6">
                        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900">
                                    {formatMonthTitle(fromDate, locale)}
                                </h3>
                                <span className="material-symbols-outlined text-slate-400">calendar_month</span>
                            </div>

                            <p className="text-4xl font-black text-blue-600">
                                {fromDate ? new Date(fromDate).getDate() : "--"}
                            </p>
                            <p className="text-sm text-slate-500 mt-2">
                                {t("reception.appointments.appointmentsFromBackend")}
                            </p>
                        </section>

                        <section className="bg-slate-900 p-6 rounded-xl shadow-xl">
                            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-400 text-lg">monitoring</span>
                                {t("reception.appointments.clinicStatus")}
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">{t("reception.appointments.todayQueue")}</span>
                                    <span className="text-white font-bold">{queueCount}</span>
                                </div>

                                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-full transition-all"
                                        style={{ width: `${Math.min(100, queueCount * 10)}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">{t("reception.appointments.avgWaitTime")}</span>
                                    <span className="text-amber-400 font-bold">{avgWait} {t("reception.appointments.min")}</span>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900">{t("reception.appointments.availableDoctorsPanel")}</h3>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {doctors.length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {doctors.length === 0 && (
                                    <p className="text-sm text-slate-400">{t("reception.appointments.noAvailableDoctors")}</p>
                                )}

                                {doctors.slice(0, 5).map((d) => (
                                    <div
                                        key={d.id}
                                        className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[18px]">stethoscope</span>
                                        </div>

                                        <div>
                                            <p className="font-bold text-sm text-slate-900">{d.user?.fullName || "Doctor"}</p>
                                            <p className="text-xs text-slate-500">{d.specialization || "-"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-blue-600">
                            <h3 className="font-bold text-slate-900 mb-4">
                                {t("reception.appointments.quickSlotSearch")}
                            </h3>

                            <div className="space-y-3">
                                <label>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                        {t("reception.appointments.doctor")}
                                    </span>

                                    <select
                                        value={quickDoctor}
                                        onChange={(e) => setQuickDoctor(e.target.value)}
                                        className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm py-2 px-3 focus:ring-blue-600 focus:border-blue-600"
                                    >
                                        <option value="">{t("reception.appointments.allDoctors")}</option>
                                        {doctors.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.user?.fullName || "Doctor"} - {d.specialization || "-"}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                        {t("reception.appointments.date")}
                                    </span>

                                    <input
                                        type="date"
                                        value={quickDate}
                                        onChange={(e) => setQuickDate(e.target.value)}
                                        className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm py-2 px-3 focus:ring-blue-600 focus:border-blue-600"
                                    />
                                </label>

                                <button
                                    onClick={applyQuickSearch}
                                    className="w-full mt-2 py-3 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">event_available</span>
                                    {t("reception.appointments.checkSchedule")}
                                </button>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>

            {/* Book Appointment Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 backdrop-blur-sm p-4">
                    <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-7 py-6 bg-gradient-to-r from-white to-emerald-50/50">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                                    <span className="material-symbols-outlined text-[26px]">event_available</span>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                        {t("reception.appointments.bookAppointmentTitle")}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {t("reception.appointments.bookAppointmentDesc")}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeAppointmentModal}
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <span className="material-symbols-outlined text-[22px]">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleBookAppointment} noValidate className="px-7 py-6">
                            {appointmentErrors.form && (
                                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                    {appointmentErrors.form}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <label className="md:col-span-2">
                                    <span className="mb-2 block text-sm font-bold text-slate-700">
                                        {t("reception.appointments.patient")}
                                    </span>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                                            person
                                        </span>

                                        <select
                                            value={form.patientId}
                                            onChange={(e) => updateAppointmentField("patientId", e.target.value)}
                                            className={getAppointmentInputClass(appointmentErrors.patientId)}
                                        >
                                            <option value="">{t("reception.appointments.selectPatient")}</option>
                                            {patients.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.fullName} - {p.phone}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {appointmentErrors.patientId && (
                                        <p className="mt-2 text-sm font-medium text-red-600">{appointmentErrors.patientId}</p>
                                    )}
                                </label>

                                <label className="md:col-span-2">
                                    <span className="mb-2 block text-sm font-bold text-slate-700">
                                        {t("reception.appointments.doctor")}
                                    </span>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                                            stethoscope
                                        </span>

                                        <select
                                            value={form.doctorId}
                                            onChange={(e) => updateAppointmentField("doctorId", e.target.value)}
                                            className={getAppointmentInputClass(appointmentErrors.doctorId)}
                                        >
                                            <option value="">{t("reception.appointments.selectDoctor")}</option>
                                            {doctors.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.user?.fullName || "Doctor"} - {d.specialization || "-"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {appointmentErrors.doctorId && (
                                        <p className="mt-2 text-sm font-medium text-red-600">{appointmentErrors.doctorId}</p>
                                    )}
                                </label>

                                <label>
                                    <span className="mb-2 block text-sm font-bold text-slate-700">
                                        {t("reception.appointments.appointmentDateTime")}
                                    </span>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                                            calendar_month
                                        </span>

                                        <input
                                            type="datetime-local"
                                            value={form.appointmentDate}
                                            onChange={(e) => updateAppointmentField("appointmentDate", e.target.value)}
                                            className={getAppointmentInputClass(appointmentErrors.appointmentDate)}
                                        />
                                    </div>

                                    {appointmentErrors.appointmentDate && (
                                        <p className="mt-2 text-sm font-medium text-red-600">{appointmentErrors.appointmentDate}</p>
                                    )}
                                </label>

                                <label>
                                    <span className="mb-2 block text-sm font-bold text-slate-700">
                                        {t("reception.appointments.duration")}
                                    </span>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                                            schedule
                                        </span>

                                        <select
                                            value={form.duration}
                                            onChange={(e) => updateAppointmentField("duration", e.target.value)}
                                            className={getAppointmentInputClass(appointmentErrors.duration)}
                                        >
                                            <option value="00:30:00">{t("reception.appointments.duration30")}</option>
                                            <option value="01:00:00">{t("reception.appointments.duration60")}</option>
                                            <option value="01:30:00">{t("reception.appointments.duration90")}</option>
                                        </select>
                                    </div>

                                    {appointmentErrors.duration && (
                                        <p className="mt-2 text-sm font-medium text-red-600">{appointmentErrors.duration}</p>
                                    )}
                                </label>

                                <label className="md:col-span-2">
                                    <span className="mb-2 block text-sm font-bold text-slate-700">
                                        {t("reception.appointments.notes")}
                                    </span>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-4 text-[22px] text-slate-400">
                                            notes
                                        </span>

                                        <textarea
                                            rows={4}
                                            value={form.notes}
                                            onChange={(e) => updateAppointmentField("notes", e.target.value)}
                                            placeholder={t("reception.appointments.notesPlaceholder")}
                                            className={`w-full resize-none rounded-2xl border bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:bg-white focus:ring-4 ${appointmentErrors.notes
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                                    : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/10"
                                                }`}
                                        />
                                    </div>

                                    {appointmentErrors.notes && (
                                        <p className="mt-2 text-sm font-medium text-red-600">{appointmentErrors.notes}</p>
                                    )}
                                </label>
                            </div>

                            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeAppointmentModal}
                                    className="h-12 rounded-2xl border border-slate-200 px-6 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                                >
                                    {t("reception.appointments.cancel")}
                                </button>

                                <button
                                    type="submit"
                                    disabled={booking}
                                    className="h-12 rounded-2xl bg-emerald-600 px-8 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {booking ? t("reception.appointments.booking") : t("reception.appointments.bookBtn")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Toast message={toast.message} type={toast.type} show={toast.show} />
        </>
    );
}