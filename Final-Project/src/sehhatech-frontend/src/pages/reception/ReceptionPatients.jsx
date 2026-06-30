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

function formatDate(value, locale) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString(locale);
}

function getPatientInputClass(hasError) {
    return `h-12 w-full rounded-2xl border bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:bg-white focus:ring-4 ${hasError
        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
        : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10"
        }`;
}

export default function ReceptionPatients() {
    const { openSidebar } = useOutletContext();
    const { toast, showToast } = useToast();
    const { t, i18n } = useTranslation("common");
    const locale = i18n.language === "ar" ? "ar-EG" : "en-US";

    const [patients, setPatients] = useState([]);
    const [queueItems, setQueueItems] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [combinedRows, setCombinedRows] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [patientModalOpen, setPatientModalOpen] = useState(false);
    const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);

    const [patientForm, setPatientForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        dateOfBirth: "",
        gender: "",
    });

    const [patientErrors, setPatientErrors] = useState({});
    const [savingPatient, setSavingPatient] = useState(false);

    const [appointmentForm, setAppointmentForm] = useState({
        patientId: "",
        doctorId: "",
        appointmentDate: "",
        duration: "00:30:00",
        notes: "",
    });

    const [appointmentErrors, setAppointmentErrors] = useState({});
    const [bookingAppointment, setBookingAppointment] = useState(false);

    const [slotDate, setSlotDate] = useState(todayISO());
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState("");

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError(false);

        try {
            const [dashboardData, patientsData, doctorsData] = await Promise.all([
                receptionApi.getDashboard(),
                receptionApi.getPatients(),
                receptionApi.getAvailableDoctors(),
            ]);

            const queue = dashboardData.queue?.data || [];
            const docs = doctorsData.data || dashboardData.availableDoctors?.data || [];
            const pts = patientsData.data || [];

            setQueueItems(queue);
            setDoctors(docs);
            setPatients(pts);

            const queueByPatientId = new Map();

            queue.forEach((q) => {
                if (q.patient?.id) queueByPatientId.set(q.patient.id, q);
            });

            const rows = pts.map((p) => {
                const q = queueByPatientId.get(p.id);

                return {
                    patientId: p.id,
                    fullName: p.fullName,
                    phone: p.phone,
                    email: p.email,
                    gender: p.gender,
                    dateOfBirth: p.dateOfBirth,
                    appointmentId: q?.appointmentId || null,
                    status: q?.status || "Registered",
                    waitingMinutes: q?.waitingMinutes || 0,
                    appointmentTime: q?.appointmentTime || null,
                    doctorSpecialization: q?.doctor?.specialization || "-",
                    inQueue: !!q,
                };
            });

            queue.forEach((q) => {
                const exists = rows.some((r) => r.patientId === q.patient?.id);

                if (!exists) {
                    rows.push({
                        patientId: q.patient?.id,
                        fullName: q.patient?.fullName || "Unknown Patient",
                        phone: q.patient?.phone || "-",
                        email: q.patient?.email || "-",
                        gender: "-",
                        dateOfBirth: null,
                        appointmentId: q.appointmentId,
                        status: q.status,
                        waitingMinutes: q.waitingMinutes || 0,
                        appointmentTime: q.appointmentTime,
                        doctorSpecialization: q.doctor?.specialization || "-",
                        inQueue: true,
                    });
                }
            });

            setCombinedRows(rows);
        } catch (err) {
            console.error(err);
            setError(true);
            showToast(err.message || t("reception.patients.failedLoad"), "error");
        } finally {
            setLoading(false);
        }
    }, [showToast, t]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const filteredRows = combinedRows.filter((r) => {
        const value = search.trim().toLowerCase();

        const matchesSearch =
            !value ||
            (r.fullName || "").toLowerCase().includes(value) ||
            (r.phone || "").toLowerCase().includes(value) ||
            String(r.patientId || "").includes(value);

        if (!matchesSearch) return false;

        if (statusFilter === "queue") return r.inQueue;
        if (statusFilter === "checkedin") return r.status === "CheckedIn";
        if (statusFilter === "scheduled") return r.status === "Scheduled";
        if (statusFilter === "registered") return r.status === "Registered";

        return true;
    });

    function StatusBadge({ row }) {
        if (row.status === "CheckedIn") {
            const text = row.waitingMinutes
                ? `${t("reception.patients.waitingStatus")} (${row.waitingMinutes}m)`
                : t("reception.patients.checkedIn");

            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    {text}
                </span>
            );
        }

        if (row.status === "Scheduled") {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    {t("reception.patients.scheduled")}{row.appointmentTime ? `: ${row.appointmentTime}` : ""}
                </span>
            );
        }

        if (row.status === "Registered") {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    {t("reception.patients.registered")}
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                {row.status || "-"}
            </span>
        );
    }

    function updatePatientField(field, value) {
        setPatientForm((prev) => ({ ...prev, [field]: value }));
        setPatientErrors((prev) => ({ ...prev, [field]: "", form: "" }));
    }

    function validatePatientForm(form) {
        const errors = {};
        const fullName = form.fullName.trim();
        const phone = form.phone.trim();
        const email = form.email.trim();
        const dateOfBirth = form.dateOfBirth;
        const gender = form.gender;

        if (!fullName) {
            errors.fullName = t("reception.patients.errFullName");
        } else if (fullName.length < 3) {
            errors.fullName = t("reception.patients.errFullNameShort");
        }

        if (!phone) {
            errors.phone = t("reception.patients.errPhone");
        } else if (!/^\d{10,15}$/.test(phone)) {
            errors.phone = t("reception.patients.errPhoneFormat");
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = t("reception.patients.errEmailFormat");
        }

        if (!dateOfBirth) {
            errors.dateOfBirth = t("reception.patients.errDateOfBirth");
        } else {
            const selectedDate = new Date(dateOfBirth);
            const today = new Date();
            const oldestAllowedDate = new Date();

            today.setHours(0, 0, 0, 0);
            oldestAllowedDate.setFullYear(today.getFullYear() - 120);

            if (selectedDate >= today) {
                errors.dateOfBirth = t("reception.patients.errDateOfBirthPast");
            } else if (selectedDate < oldestAllowedDate) {
                errors.dateOfBirth = t("reception.patients.errDateOfBirthUnrealistic");
            }
        }

        if (!gender) {
            errors.gender = t("reception.patients.errGender");
        }

        return errors;
    }

    function mapPatientBackendError(message) {
        const lowerMessage = String(message || "").toLowerCase();

        if (lowerMessage.includes("phone")) {
            return { phone: message };
        }

        if (lowerMessage.includes("email")) {
            return { email: message };
        }

        if (lowerMessage.includes("date of birth")) {
            return { dateOfBirth: message };
        }

        if (lowerMessage.includes("name")) {
            return { fullName: message };
        }

        return { form: message || t("reception.patients.failedLoad") };
    }

    function closePatientModal() {
        setPatientModalOpen(false);
        setPatientErrors({});
    }

    async function checkInPatient(appointmentId) {
        if (!appointmentId) return;

        try {
            const result = await receptionApi.checkInAppointment(appointmentId);
            showToast(result?.message || t("reception.patients.checkIn"));
            await loadAll();
        } catch (err) {
            showToast(err.message || t("reception.patients.failedLoad"), "error");
        }
    }

    async function openProfile(patientId) {
        try {
            const data = await receptionApi.getPatient(patientId);
            setProfileData(data.data);
            setProfileModalOpen(true);
        } catch (err) {
            showToast(err.message || t("reception.patients.failedLoad"), "error");
        }
    }

    async function handleAddPatient(e) {
        e.preventDefault();

        const validationErrors = validatePatientForm(patientForm);

        if (Object.keys(validationErrors).length > 0) {
            setPatientErrors(validationErrors);
            showToast(t("reception.patients.validationFix"), "error");
            return;
        }

        setSavingPatient(true);
        setPatientErrors({});

        try {
            const result = await receptionApi.addPatient({
                ...patientForm,
                fullName: patientForm.fullName.trim(),
                phone: patientForm.phone.trim(),
                email: patientForm.email.trim(),
            });

            showToast(result?.message || t("reception.patients.savePatient"));
            setPatientModalOpen(false);

            setPatientForm({
                fullName: "",
                phone: "",
                email: "",
                dateOfBirth: "",
                gender: "",
            });

            setPatientErrors({});
            await loadAll();
        } catch (err) {
            const message = err.message || t("reception.patients.failedLoad");
            setPatientErrors(mapPatientBackendError(message));
            showToast(message, "error");
        } finally {
            setSavingPatient(false);
        }
    }

    useEffect(() => {
        if (!appointmentModalOpen || !appointmentForm.doctorId || !slotDate) {
            setAvailableSlots([]);
            setSlotsError("");
            return;
        }

        let active = true;

        (async () => {
            setLoadingSlots(true);
            setSlotsError("");
            try {
                const data = await receptionApi.getDoctorSlots(appointmentForm.doctorId, slotDate);
                if (active) setAvailableSlots(data.data || []);
            } catch (err) {
                if (active) {
                    setAvailableSlots([]);
                    setSlotsError(err.message || t("reception.appointments.errSlotsLoad"));
                }
            } finally {
                if (active) setLoadingSlots(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [appointmentModalOpen, appointmentForm.doctorId, slotDate, t]);

    function pickSlot(slot) {
        if (!slot.isAvailable) return;
        setAppointmentForm((prev) => ({ ...prev, appointmentDate: `${slotDate}T${slot.time}` }));
        setAppointmentErrors((prev) => ({ ...prev, appointmentDate: "", form: "" }));
    }

    function updateApptField(field, value) {
        setAppointmentForm((prev) => ({ ...prev, [field]: value }));
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
        setSlotDate(todayISO());
        setAvailableSlots([]);
        setSlotsError("");
        setAppointmentModalOpen(true);
    }

    function closeAppointmentModal() {
        setAppointmentModalOpen(false);
        setAppointmentErrors({});
        setAvailableSlots([]);
        setSlotsError("");
    }

    async function handleBookAppointment(e) {
        e.preventDefault();

        const validationErrors = validateAppointmentForm(appointmentForm);

        if (Object.keys(validationErrors).length > 0) {
            setAppointmentErrors(validationErrors);
            showToast(t("reception.appointments.validationFix"), "error");
            return;
        }

        setBookingAppointment(true);
        setAppointmentErrors({});

        try {
            const result = await receptionApi.bookAppointment({
                patientId: Number(appointmentForm.patientId),
                doctorId: Number(appointmentForm.doctorId),
                appointmentDate: appointmentForm.appointmentDate,
                duration: appointmentForm.duration,
                notes: appointmentForm.notes.trim(),
            });

            showToast(result?.message || t("reception.patients.bookBtn"));
            closeAppointmentModal();
            setAppointmentForm({
                patientId: "",
                doctorId: "",
                appointmentDate: "",
                duration: "00:30:00",
                notes: "",
            });

            await loadAll();
        } catch (err) {
            const message = err.message || t("reception.patients.failedLoad");
            setAppointmentErrors(mapAppointmentBackendError(message));
            showToast(message, "error");
        } finally {
            setBookingAppointment(false);
        }
    }

    return (
        <>
            <ReceptionTopbar title={t("reception.patients.title")} onMenuClick={openSidebar}>
                <button
                    onClick={loadAll}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 inline-flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    {t("reception.patients.refresh")}
                </button>

                <button
                    onClick={openAppointmentModal}
                    className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 inline-flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">event_available</span>
                    {t("reception.patients.bookAppointment")}
                </button>

                <button
                    onClick={() => {
                        setPatientErrors({});
                        setPatientModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 inline-flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    {t("reception.patients.addNewPatient")}
                </button>
            </ReceptionTopbar>

            <div className="p-4 lg:p-8 max-w-[1440px] mx-auto space-y-6">
                {/* KPIs */}
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500">{t("reception.patients.todayQueue")}</p>
                        <h2 className="text-3xl font-black mt-2">{queueItems.length}</h2>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500">{t("reception.patients.availableDoctors")}</p>
                        <h2 className="text-3xl font-black mt-2">{doctors.length}</h2>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500">{t("reception.patients.patients")}</p>
                        <h2 className="text-3xl font-black mt-2">{patients.length}</h2>
                    </div>
                </section>

                {/* Search & Filter */}
                <section className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[24px]">
                            search
                        </span>

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none"
                            placeholder={t("reception.patients.searchPlaceholder")}
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-6 h-[58px] bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-slate-700 focus:ring-4 focus:ring-blue-600/10 outline-none"
                    >
                        <option value="all">{t("reception.patients.allStatuses")}</option>
                        <option value="queue">{t("reception.patients.inQueueToday")}</option>
                        <option value="checkedin">{t("reception.patients.checkedIn")}</option>
                        <option value="scheduled">{t("reception.patients.scheduled")}</option>
                        <option value="registered">{t("reception.patients.registeredOnly")}</option>
                    </select>
                </section>

                {/* Patient Table */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[850px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-8 py-5 text-xs text-slate-500 uppercase tracking-wider font-bold">
                                        {t("reception.patients.colPatientDetails")}
                                    </th>
                                    <th className="px-8 py-5 text-xs text-slate-500 uppercase tracking-wider font-bold">
                                        {t("reception.patients.colStatus")}
                                    </th>
                                    <th className="px-8 py-5 text-xs text-slate-500 uppercase tracking-wider font-bold">
                                        {t("reception.patients.colDoctor")}
                                    </th>
                                    <th className="px-8 py-5 text-xs text-slate-500 uppercase tracking-wider font-bold text-right">
                                        {t("reception.patients.colActions")}
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-10 text-center text-slate-400">
                                            {t("reception.patients.loadingPatients")}
                                        </td>
                                    </tr>
                                )}

                                {!loading && error && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-10 text-center text-red-500">
                                            {t("reception.patients.failedLoad")}
                                        </td>
                                    </tr>
                                )}

                                {!loading && !error && filteredRows.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-10 text-center text-slate-400">
                                            {t("reception.patients.noPatients")}
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    !error &&
                                    filteredRows.map((row) => {
                                        const disabled =
                                            !row.appointmentId ||
                                            row.status === "CheckedIn" ||
                                            row.status === "Completed";

                                        return (
                                            <tr
                                                key={row.patientId}
                                                className="hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg ring-2 ring-slate-100">
                                                            {getInitials(row.fullName)}
                                                        </div>

                                                        <div>
                                                            <p className="font-bold text-lg text-slate-900">
                                                                {row.fullName || "-"}
                                                            </p>
                                                            <p className="text-sm text-slate-500 font-medium">
                                                                {t("reception.patients.idPrefix")}{row.patientId || "-"} •{" "}
                                                                {row.phone || "-"}
                                                            </p>
                                                            <p className="text-xs text-slate-400">
                                                                {row.email || "-"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5">
                                                    <StatusBadge row={row} />
                                                </td>

                                                <td className="px-8 py-5">
                                                    <p className="font-semibold text-slate-700">
                                                        {row.doctorSpecialization || "-"}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {row.appointmentTime
                                                            ? `${t("reception.patients.todayAt")} ${row.appointmentTime}`
                                                            : t("reception.patients.noAppointmentToday")}
                                                    </p>
                                                </td>

                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            disabled={disabled}
                                                            onClick={() => checkInPatient(row.appointmentId)}
                                                            className={
                                                                disabled
                                                                    ? "px-5 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-bold cursor-not-allowed"
                                                                    : "px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-all"
                                                            }
                                                        >
                                                            {t("reception.patients.checkIn")}
                                                        </button>

                                                        <button
                                                            onClick={() => openProfile(row.patientId)}
                                                            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                                        >
                                                            {t("reception.patients.profile")}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Queue + Doctors */}
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <h2 className="text-xl font-semibold mb-2">{t("reception.patients.todayQueuePanel")}</h2>

                        <div className="space-y-3">
                            {queueItems.length === 0 && (
                                <p className="text-sm text-slate-400">
                                    {t("reception.patients.noQueuePatients")}
                                </p>
                            )}

                            {queueItems.slice(0, 5).map((q) => (
                                <div
                                    key={q.appointmentId}
                                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                                >
                                    <div>
                                        <p className="font-bold">{q.patient?.fullName || "-"}</p>
                                        <p className="text-sm text-slate-500">
                                            {q.patient?.phone || "-"} • {q.appointmentTime || "-"}
                                        </p>
                                    </div>

                                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                        {q.status || "-"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <h2 className="text-xl font-semibold mb-2">{t("reception.patients.availableDoctorsPanel")}</h2>

                        <div className="space-y-3">
                            {doctors.length === 0 && (
                                <p className="text-sm text-slate-400">
                                    {t("reception.patients.noAvailableDoctors")}
                                </p>
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
                                        <p className="font-bold">{d.user?.fullName || "Doctor"}</p>
                                        <p className="text-sm text-slate-500">{d.specialization || "-"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* Add Patient Modal */}
            {patientModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 backdrop-blur-sm p-4">
                    <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-7 py-6 bg-gradient-to-r from-white to-blue-50/40">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-sm">
                                    <span className="material-symbols-outlined text-[26px]">person_add</span>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                        {t("reception.patients.addPatientTitle")}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {t("reception.patients.addPatientDesc")}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closePatientModal}
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <span className="material-symbols-outlined text-[22px]">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddPatient} noValidate className="px-7 py-6">
                            {patientErrors.form && (
                                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                    {patientErrors.form}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <label className="md:col-span-2">
                                    <span className="mb-2 block text-sm font-bold text-slate-700">
                                        {t("reception.patients.fullName")}
                                    </span>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                                            badge
                                        </span>

                                        <input
                                            value={patientForm.fullName}
                                            onChange={(e) => updatePatientField("fullName", e.target.value)}
                                            placeholder={t("reception.patients.fullNamePlaceholder")}
                                            className={getPatientInputClass(patientErrors.fullName)}
                                        />
                                    </div>

                                    {patientErrors.fullName && (
                                        <p className="mt-2 text-sm font-medium text-red-600">{patientErrors.fullName}</p>
                                    )}
                                </label>

                                <label>
                                    <span className="mb-2 block text-sm font-bold text-slate-700">
                                        {t("reception.patients.phone")}
                                    </span>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                                            call
                                        </span>

                                        <input
                                            inputMode="numeric"
                                            value={patientForm.phone}
                                            onChange={(e) => updatePatientField("phone", e.target.value)}
                                            placeholder={t("reception.patients.phonePlaceholder")}
                                            className={getPatientInputClass(patientErrors.phone)}
                                        />
                                    </div>

                                    {patientErrors.phone && (
                                        <p className="mt-2 text-sm font-medium text-red-600">{patientErrors.phone}</p>
                                    )}
                                </label>

                                <label>
                                    <span className="mb-2 block text-sm font-bold text-slate-700">
                                        {t("reception.patients.email")}{" "}
                                        <span className="font-normal text-slate-400">({t("reception.patients.optional")})</span>
                                    </span>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                                            mail
                                        </span>

                                        <input
                                            type="text"
                                            inputMode="email"
                                            value={patientForm.email}
                                            onChange={(e) => updatePatientField("email", e.target.value)}
                                            placeholder={t("reception.patients.emailPlaceholder")}
                                            className={getPatientInputClass(patientErrors.email)}
                                        />
                                    </div>

                                    {patientErrors.email && (
                                        <p className="mt-2 text-sm font-medium text-red-600">{patientErrors.email}</p>
                                    )}
                                </label>

                                <label>
                                    <span className="mb-2 block text-sm font-bold text-slate-700">
                                        {t("reception.patients.dateOfBirth")}
                                    </span>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                                            calendar_month
                                        </span>

                                        <input
                                            type="date"
                                            value={patientForm.dateOfBirth}
                                            onChange={(e) => updatePatientField("dateOfBirth", e.target.value)}
                                            className={getPatientInputClass(patientErrors.dateOfBirth)}
                                        />
                                    </div>

                                    {patientErrors.dateOfBirth && (
                                        <p className="mt-2 text-sm font-medium text-red-600">{patientErrors.dateOfBirth}</p>
                                    )}
                                </label>

                                <label>
                                    <span className="mb-2 block text-sm font-bold text-slate-700">
                                        {t("reception.patients.gender")}
                                    </span>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                                            wc
                                        </span>

                                        <select
                                            value={patientForm.gender}
                                            onChange={(e) => updatePatientField("gender", e.target.value)}
                                            className={getPatientInputClass(patientErrors.gender)}
                                        >
                                            <option value="">{t("reception.patients.selectGender")}</option>
                                            <option value="Male">{t("reception.patients.male")}</option>
                                            <option value="Female">{t("reception.patients.female")}</option>
                                        </select>
                                    </div>

                                    {patientErrors.gender && (
                                        <p className="mt-2 text-sm font-medium text-red-600">{patientErrors.gender}</p>
                                    )}
                                </label>
                            </div>

                            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closePatientModal}
                                    className="h-12 rounded-2xl border border-slate-200 px-6 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                                >
                                    {t("reception.patients.cancel")}
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingPatient}
                                    className="h-12 rounded-2xl bg-blue-600 px-8 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {savingPatient ? t("reception.patients.saving") : t("reception.patients.savePatient")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Book Appointment Modal */}
            {appointmentModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <span className="material-symbols-outlined text-[26px]">event_available</span>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                        {t("reception.patients.bookApptTitle")}
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
                                        {t("reception.patients.patients")}
                                    </span>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                                            person
                                        </span>

                                        <select
                                            value={appointmentForm.patientId}
                                            onChange={(e) => updateApptField("patientId", e.target.value)}
                                            className={getPatientInputClass(appointmentErrors.patientId)}
                                        >
                                            <option value="">{t("reception.patients.selectPatient")}</option>
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
                                        {t("reception.patients.colDoctor")}
                                    </span>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                                            stethoscope
                                        </span>

                                        <select
                                            value={appointmentForm.doctorId}
                                            onChange={(e) => updateApptField("doctorId", e.target.value)}
                                            className={getPatientInputClass(appointmentErrors.doctorId)}
                                        >
                                            <option value="">{t("reception.patients.selectDoctor")}</option>
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

                                {appointmentForm.doctorId && (
                                    <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                                            <span className="text-sm font-bold text-slate-700">
                                                {t("reception.appointments.availableSlots")}
                                            </span>

                                            <input
                                                type="date"
                                                value={slotDate}
                                                min={todayISO()}
                                                onChange={(e) => setSlotDate(e.target.value)}
                                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-auto"
                                            />
                                        </div>

                                        {loadingSlots ? (
                                            <p className="text-sm text-slate-400">{t("reception.appointments.loadingSlots")}</p>
                                        ) : slotsError ? (
                                            <p className="text-sm text-red-500">{slotsError}</p>
                                        ) : availableSlots.length === 0 ? (
                                            <p className="text-sm text-slate-400">{t("reception.appointments.noSlotsForDay")}</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {availableSlots.map((slot) => {
                                                    const isSelected = appointmentForm.appointmentDate === `${slotDate}T${slot.time}`;
                                                    return (
                                                        <button
                                                            key={slot.time}
                                                            type="button"
                                                            disabled={!slot.isAvailable}
                                                            onClick={() => pickSlot(slot)}
                                                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${!slot.isAvailable
                                                                    ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through"
                                                                    : isSelected
                                                                        ? "bg-blue-600 text-white border-blue-600"
                                                                        : "bg-white text-slate-700 border-slate-200 hover:border-blue-600 hover:text-blue-600"
                                                                }`}
                                                        >
                                                            {slot.time}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <p className="text-xs text-slate-400 mt-3">
                                            {t("reception.appointments.slotsHint")}
                                        </p>
                                    </div>
                                )}

                                <label>
                                    <span className="mb-2 block text-sm font-bold text-slate-700">
                                        {t("reception.patients.appointmentDate")}
                                    </span>

                                    {appointmentForm.doctorId ? (
                                        <div
                                            className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm ${appointmentErrors.appointmentDate
                                                    ? "border-red-300 bg-red-50"
                                                    : appointmentForm.appointmentDate
                                                        ? "border-slate-200 bg-white text-slate-800 font-semibold"
                                                        : "border-slate-200 bg-slate-50 text-slate-400"
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[20px] text-slate-400">
                                                calendar_month
                                            </span>
                                            {appointmentForm.appointmentDate
                                                ? new Date(appointmentForm.appointmentDate).toLocaleString(
                                                    i18n.language === "ar" ? "ar-EG" : "en-GB",
                                                    { dateStyle: "medium", timeStyle: "short" }
                                                )
                                                : t("reception.appointments.pickSlotPrompt")}
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                                                calendar_month
                                            </span>

                                            <input
                                                type="datetime-local"
                                                value={appointmentForm.appointmentDate}
                                                onChange={(e) => updateApptField("appointmentDate", e.target.value)}
                                                className={getPatientInputClass(appointmentErrors.appointmentDate)}
                                            />
                                        </div>
                                    )}

                                    {appointmentErrors.appointmentDate && (
                                        <p className="mt-2 text-sm font-medium text-red-600">{appointmentErrors.appointmentDate}</p>
                                    )}
                                </label>

                                <label>
                                    <span className="mb-2 block text-sm font-bold text-slate-700">
                                        {t("reception.patients.duration")}
                                    </span>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                                            schedule
                                        </span>

                                        <select
                                            value={appointmentForm.duration}
                                            onChange={(e) => updateApptField("duration", e.target.value)}
                                            className={getPatientInputClass(appointmentErrors.duration)}
                                        >
                                            <option value="00:30:00">{t("reception.patients.duration30")}</option>
                                            <option value="01:00:00">{t("reception.patients.duration60")}</option>
                                            <option value="01:30:00">{t("reception.patients.duration90")}</option>
                                        </select>
                                    </div>

                                    {appointmentErrors.duration && (
                                        <p className="mt-2 text-sm font-medium text-red-600">{appointmentErrors.duration}</p>
                                    )}
                                </label>

                                <label className="md:col-span-2">
                                    <span className="mb-2 block text-sm font-bold text-slate-700">
                                        {t("reception.patients.notes")}
                                    </span>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-4 text-[22px] text-slate-400">
                                            notes
                                        </span>

                                        <textarea
                                            rows={4}
                                            value={appointmentForm.notes}
                                            onChange={(e) => updateApptField("notes", e.target.value)}
                                            placeholder={t("reception.appointments.notesPlaceholder")}
                                            className={`w-full resize-none rounded-2xl border bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:bg-white focus:ring-4 ${appointmentErrors.notes
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                                    : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10"
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
                                    {t("reception.patients.cancel")}
                                </button>

                                <button
                                    type="submit"
                                    disabled={bookingAppointment}
                                    className="h-12 rounded-2xl bg-emerald-600 px-8 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {bookingAppointment ? t("reception.patients.bookingBtn") : t("reception.patients.bookBtn")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {profileModalOpen && profileData && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-xl font-extrabold">{t("reception.patients.profileTitle")}</h3>

                            <button
                                onClick={() => setProfileModalOpen(false)}
                                className="text-slate-400 hover:text-slate-900 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-black text-xl">
                                {getInitials(profileData.fullName)}
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">{t("reception.patients.profileFullName")}</p>
                                <p className="font-bold">{profileData.fullName || "-"}</p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">{t("reception.patients.profilePhone")}</p>
                                <p className="font-bold">{profileData.phone || "-"}</p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">{t("reception.patients.profileEmail")}</p>
                                <p className="font-bold">{profileData.email || "-"}</p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">{t("reception.patients.profileGender")}</p>
                                <p className="font-bold">{profileData.gender || "-"}</p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">{t("reception.patients.profileDOB")}</p>
                                <p className="font-bold">{formatDate(profileData.dateOfBirth, locale)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Toast message={toast.message} type={toast.type} show={toast.show} />
        </>
    );
}