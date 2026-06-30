import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout";
import api from "../../api/axios";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};

const itemSlide = {
    hidden: { opacity: 0, x: -16 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const card =
    "bg-white rounded-2xl border border-slate-200 shadow-subtle transition-all duration-300 ease-out hover:shadow-xl hover:border-slate-300";

export default function MySchedule() {
    const { t, i18n } = useTranslation("common");
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [patientDetails, setPatientDetails] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/api/Doctor/appointments/upcoming");
                const data = res.data.data ?? [];
                setAppointments(data);
                if (data.length) setSelected(data[0]);
            } catch (err) {
                console.error("Schedule load error:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function openPatientDetails() {
        if (!selected) return;
        try {
            const res = await api.get(`/api/Doctor/patients/${selected.patientId}`);
            setPatientDetails(res.data);
            setShowModal(true);
        } catch (err) {
            console.error("Error loading patient:", err);
        }
    }

    const locale = i18n.language === "ar" ? "ar-EG" : "en-US";

    const today = new Date();
    const count = appointments.length;
    const scheduleInfo =
        today.toLocaleDateString(locale, {
            weekday: "long", month: "long", day: "numeric", year: "numeric",
        }) +
        ` — ${count} ${count === 1
            ? t("doctor.schedule.appointmentRemaining")
            : t("doctor.schedule.appointmentsRemaining")}`;

    const apptDate = selected ? new Date(selected.appointmentDate) : null;

    return (
        <Layout>
            {/* header */}
            <motion.header
                className="mb-6 sm:mb-8"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                    {t("doctor.schedule.title")}
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium">
                    {loading ? t("doctor.schedule.loading") : scheduleInfo}
                </p>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                {/* appointment list */}
                <div className="col-span-1 lg:col-span-5">
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3].map((k) => (
                                <div key={k} className="h-20 bg-slate-100 rounded-2xl" />
                            ))}
                        </div>
                    ) : !appointments.length ? (
                        <p className="text-slate-400 text-sm px-2">{t("doctor.schedule.noUpcoming")}</p>
                    ) : (
                        <motion.div
                            className="space-y-3"
                            variants={stagger}
                            initial="hidden"
                            animate="show"
                        >
                            {appointments.map((app, i) => {
                                const date = new Date(app.appointmentDate);
                                const hour = date.getHours();
                                const displayHour = hour % 12 || 12;
                                const ampm = hour >= 12 ? "PM" : "AM";
                                const isActive = selected?.appointmentId === app.appointmentId;

                                return (
                                    <motion.div
                                        key={i}
                                        variants={itemSlide}
                                        onClick={() => setSelected(app)}
                                        className={`
                                            bg-white rounded-2xl border flex items-center justify-between p-3 sm:p-4
                                            transition-all duration-200 cursor-pointer group
                                            ${isActive
                                                ? "border-primary shadow-md"
                                                : "border-slate-200 hover:border-primary hover:shadow-sm"}
                                        `}
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                            <div className={`
                                                flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex-shrink-0
                                                transition-colors duration-200
                                                ${isActive ? "bg-primary text-white" : "bg-slate-50 text-slate-600"}
                                            `}>
                                                <span className="text-lg sm:text-xl font-bold leading-none">{displayHour}</span>
                                                <span className="text-[10px] font-bold uppercase">{ampm}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-900 text-sm truncate">
                                                    {app.patientName ?? t("doctor.unknown")}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-slate-500">{app.status}</p>
                                                <p className="text-xs text-slate-400">{date.toLocaleDateString(locale)}</p>
                                            </div>
                                        </div>
                                        <span className={`
                                            material-symbols-outlined transition-colors duration-200 flex-shrink-0
                                            ${isActive ? "text-primary" : "text-slate-300 group-hover:text-primary"}
                                        `}>
                                            chevron_right
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </div>

                {/* detail panel */}
                <div className="col-span-1 lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {selected ? (
                            <motion.section
                                key={selected.appointmentId}
                                className={`${card} overflow-hidden`}
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                                exit={{ opacity: 0, y: 10 }}
                            >
                                {/* top */}
                                <div className="p-5 sm:p-8">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                {t("doctor.schedule.selectedAppointment")}
                                            </p>
                                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                                                {selected.patientName ?? t("doctor.unknown")}
                                            </h3>
                                        </div>
                                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 flex-shrink-0 self-start">
                                            {selected.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        {t("doctor.schedule.scheduledForText")}{" "}
                                        <span className="font-semibold text-slate-700">
                                            {apptDate?.toLocaleDateString(locale, {
                                                weekday: "long", year: "numeric",
                                                month: "long", day: "numeric",
                                            })}
                                        </span>
                                    </p>
                                </div>

                                {/* bottom */}
                                <div className="bg-slate-50/50 p-5 sm:p-8">
                                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                                        <div className="flex-1 space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {t("doctor.schedule.scheduledFor")}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-[20px]">event</span>
                                                <p className="font-bold text-primary text-sm sm:text-base">
                                                    {apptDate ? apptDate.toLocaleDateString(locale) : "—"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {t("doctor.schedule.appointmentTime")}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                                                <p className="font-bold text-primary text-sm sm:text-base">
                                                    {apptDate
                                                        ? apptDate.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
                                                        : "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 sm:mt-8">
                                        <motion.button
                                            onClick={openPatientDetails}
                                            disabled={!selected}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.97 }}
                                            className="w-full bg-primary text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm
                                                flex items-center justify-center gap-2 shadow-sm
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                transition-opacity duration-200 hover:opacity-90"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">person</span>
                                            {t("doctor.schedule.viewPatientProfile")}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.section>
                        ) : (
                            <motion.div
                                key="empty"
                                className={`${card} p-8 flex items-center justify-center text-slate-400 text-sm`}
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                            >
                                {t("doctor.schedule.selectPrompt")}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* patient modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-[520px] shadow-2xl max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.92, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 20 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-5 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-primary">
                                    {t("doctor.schedule.patientDetails")}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {patientDetails && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        {[
                                            { label: t("doctor.schedule.labelName"), value: patientDetails.data?.fullName },
                                            { label: t("doctor.schedule.labelPhone"), value: patientDetails.data?.phone },
                                            { label: t("doctor.schedule.labelEmail"), value: patientDetails.data?.email },
                                            { label: t("doctor.schedule.labelGender"), value: patientDetails.data?.gender },
                                            {
                                                label: t("doctor.schedule.labelDob"),
                                                value: patientDetails.data?.dateOfBirth
                                                    ? new Date(patientDetails.data.dateOfBirth).toLocaleDateString(locale)
                                                    : null,
                                            },
                                        ].map(({ label, value }) => (
                                            <div key={label}>
                                                <p className="text-xs text-slate-400 uppercase font-bold">{label}</p>
                                                <p className="font-semibold text-slate-900 mt-1 text-sm break-words">{value ?? "—"}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {patientDetails.data?.medicalHistory && (
                                        <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                                                {t("doctor.schedule.medicalHistory")}
                                            </p>
                                            <p className="text-sm text-slate-700">{patientDetails.data.medicalHistory}</p>
                                        </div>
                                    )}

                                    {patientDetails.appointmentHistory?.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-xs text-slate-400 uppercase font-bold mb-2">
                                                {t("doctor.schedule.appointmentHistory")}
                                            </p>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {patientDetails.appointmentHistory.map((h, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm gap-2"
                                                    >
                                                        <span className="text-slate-700 text-xs sm:text-sm">
                                                            {new Date(h.appointmentDate).toLocaleDateString(locale)}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600 flex-shrink-0">
                                                            {h.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Layout>
    );
}