import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "../../components/Layout";
import api from "../../api/axios";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
};

const rowFade = {
    hidden: { opacity: 0, x: -8 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const card =
    "bg-white rounded-2xl border border-slate-200 shadow-subtle transition-all duration-300 ease-out hover:shadow-xl hover:border-slate-300";

export default function PatientRecords() {
    const [profile, setProfile] = useState(null);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [profileRes, patientsRes, apptRes] = await Promise.all([
                    api.get("/api/Doctor/profile"),
                    api.get("/api/Doctor/patients"),
                    api.get("/api/Doctor/appointments/upcoming"),
                ]);
                setProfile(profileRes.data.data);
                setPatients(patientsRes.data);
                setAppointments(apptRes.data.data ?? []);
            } catch (err) {
                console.error("Patient records load error:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const d = profile;
    const name = d?.user?.fullName;
    const spec = d?.specialization;
    const imgUrl = d?.doctorProfileImageUrl || d?.user?.userProfileImageUrl;

    return (
        <Layout>

            {/* doctor info */}
            <motion.section
                className={`${card} p-4 sm:p-6`}
                variants={fadeUp}
                initial="hidden"
                animate="show"
            >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {imgUrl ? (
                            <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <span
                                className="material-symbols-outlined text-white text-3xl"
                                style={{ fontVariationSettings: '"FILL" 1' }}
                            >
                                person
                            </span>
                        )}
                    </div>
                    <div className="flex-grow min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h1 className="text-xl sm:text-2xl font-extrabold text-primary truncate">{name ?? "—"}</h1>
                            <span className="text-[11px] font-bold text-on-primary-container bg-surface-container px-2.5 py-1 rounded tracking-wider uppercase w-fit">
                                {d ? `Doctor ID: ${d.id}` : ""}
                            </span>
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-slate-500 mb-2">{spec}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{d?.bio ?? ""}</p>
                    </div>
                </div>
            </motion.section>

            {/* tab bar */}
            <nav className="flex border-b border-slate-200 overflow-x-auto">
                <button className="px-5 sm:px-8 py-3 text-sm font-bold text-primary border-b-2 border-primary whitespace-nowrap">
                    Patients & Appointments
                </button>
            </nav>

            {/* main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* patients table */}
                <motion.section
                    className={`${card} col-span-1 lg:col-span-8 overflow-hidden`}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.1 }}
                >
                    <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex justify-between items-center gap-3">
                        <h2 className="text-base sm:text-lg font-extrabold text-primary">My Patients</h2>
                        <span className="text-xs text-slate-400 font-semibold flex-shrink-0">
                            {!loading && patients.count !== undefined ? `${patients.count} patients` : ""}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-[500px] w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {["Patient", "Phone", "Email", "Gender"].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 sm:px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8">
                                            <div className="animate-pulse space-y-3">
                                                <div className="h-4 bg-slate-200 rounded w-40" />
                                                <div className="h-4 bg-slate-200 rounded w-28" />
                                                <div className="h-4 bg-slate-200 rounded w-36" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : !patients.data?.length ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-6 text-slate-400 text-sm">
                                            No patients found.
                                        </td>
                                    </tr>
                                ) : (
                                    patients.data.map((p, i) => (
                                        <motion.tr
                                            key={i}
                                            variants={rowFade}
                                            initial="hidden"
                                            animate="show"
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-slate-50/60 transition-colors"
                                        >
                                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                        <span
                                                            className="material-symbols-outlined text-slate-400 text-sm"
                                                            style={{ fontVariationSettings: '"FILL" 1' }}
                                                        >
                                                            person
                                                        </span>
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-semibold text-primary truncate max-w-[100px] sm:max-w-none">{p.fullName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">{p.phone ?? "—"}</td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 truncate max-w-[120px] sm:max-w-none">{p.email ?? "—"}</td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">{p.gender ?? "—"}</td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.section>

                {/* upcoming aside */}
                <motion.aside
                    className="col-span-1 lg:col-span-4"
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.15 }}
                >
                    <div className={`${card} p-4 sm:p-6`}>
                        <div className="flex items-center gap-2 mb-4 sm:mb-5">
                            <span className="material-symbols-outlined text-primary text-[20px]">event</span>
                            <h2 className="text-base sm:text-lg font-extrabold text-primary">Upcoming</h2>
                        </div>

                        {loading ? (
                            <div className="animate-pulse space-y-3">
                                {[1, 2, 3].map((k) => (
                                    <div key={k} className="h-20 bg-slate-100 rounded-xl" />
                                ))}
                            </div>
                        ) : !appointments.length ? (
                            <p className="text-slate-400 text-sm">No upcoming appointments.</p>
                        ) : (
                            <motion.div
                                className="space-y-3"
                                variants={stagger}
                                initial="hidden"
                                animate="show"
                            >
                                {appointments.map((a, i) => {
                                    const date = new Date(a.appointmentDate);
                                    return (
                                        <motion.div
                                            key={i}
                                            variants={rowFade}
                                            className="p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-primary transition-all"
                                        >
                                            <div className="flex justify-between mb-1 gap-2">
                                                <span className="text-sm font-bold text-primary">
                                                    {date.toLocaleDateString()}
                                                </span>
                                                <span className="text-[12px] font-bold text-slate-500 flex-shrink-0">
                                                    {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-600 truncate">
                                                {a.patientName ?? "Unknown"}
                                            </p>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 mt-1 inline-block">
                                                {a.status}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </div>
                </motion.aside>
            </div>
        </Layout>
    );
}