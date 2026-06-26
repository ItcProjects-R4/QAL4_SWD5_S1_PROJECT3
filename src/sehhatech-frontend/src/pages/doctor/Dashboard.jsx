import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../../components/Layout";
import api from "../../api/axios";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const itemFade = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const card =
    "bg-white rounded-2xl border border-slate-200 shadow-subtle transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-slate-300";

function SkeletonRows() {
    return (
        <div className="animate-pulse space-y-3 p-6">
            <div className="h-4 bg-slate-200 rounded w-40" />
            <div className="h-4 bg-slate-200 rounded w-28" />
            <div className="h-4 bg-slate-200 rounded w-36" />
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/api/Doctor/dashboard");
                setData(res.data.data);
            } catch (err) {
                console.error("Dashboard load error:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const today = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
    });

    const count = data?.appointmentsTodayCount ?? 0;
    const upcoming = data?.upcomingAppointments ?? [];
    const recentPatients = data?.recentPatients ?? [];
    const timeline = data?.dailyTimeline ?? [];

    return (
        <Layout>
            {/* header */}
            <motion.p
                className="text-slate-500 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                Daily clinical overview for {today}
            </motion.p>

            {/* stat card */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={stagger}
                initial="hidden"
                animate="show"
            >
                <motion.div
                    variants={fadeUp}
                    className={`${card} p-5 sm:p-6 flex flex-col justify-between h-36 sm:h-40`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                                Appointments Today
                            </span>
                            <div className="mt-2">
                                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                                    {loading ? "—" : count}
                                </span>
                            </div>
                        </div>
                        <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl text-slate-900">
                            <span
                                className="material-symbols-outlined text-xl sm:text-2xl"
                                style={{ fontVariationSettings: '"FILL" 1' }}
                            >
                                calendar_month
                            </span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                            className="bg-primary h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(count * 10, 100)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                        />
                    </div>
                </motion.div>
            </motion.div>

            {/* main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* left column */}
                <div className="col-span-1 lg:col-span-8 space-y-6">

                    {/* upcoming appointments */}
                    <motion.section
                        className={card}
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: 0.1 }}
                    >
                        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex justify-between items-center gap-3">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">event_list</span>
                                <span>Upcoming Appointments</span>
                            </h2>
                            <button
                                onClick={() => navigate("/doctor/schedule")}
                                className="text-primary text-xs sm:text-sm font-bold transition-all duration-200 hover:opacity-80 whitespace-nowrap flex-shrink-0"
                            >
                                View Schedule
                            </button>
                        </div>

                        {loading ? (
                            <SkeletonRows />
                        ) : upcoming.length ? (
                            <motion.div variants={stagger} initial="hidden" animate="show">
                                {upcoming.map((a, i) => (
                                    <motion.div
                                        key={i}
                                        variants={itemFade}
                                        className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                                    >
                                        <div className="font-bold text-slate-900 text-sm sm:text-base">
                                            {a.patientName ?? "Unknown"}
                                        </div>
                                        <div className="text-xs sm:text-sm text-slate-500 mt-1">
                                            {new Date(a.appointmentDate).toLocaleString()}
                                        </div>
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 mt-1 inline-block">
                                            {a.status}
                                        </span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <p className="px-4 sm:px-6 py-5 text-slate-400 text-sm">No upcoming appointments.</p>
                        )}
                    </motion.section>

                    {/* recent patients */}
                    <motion.section
                        className="space-y-4"
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">recent_actors</span>
                                Recent Patients
                            </h2>
                            <button
                                onClick={() => navigate("/doctor/patients")}
                                className="text-slate-500 text-xs font-bold hover:opacity-80 transition-opacity"
                            >
                                See All
                            </button>
                        </div>

                        {loading ? (
                            <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {[1, 2, 3].map((k) => (
                                    <div key={k} className="h-36 bg-slate-100 rounded-2xl" />
                                ))}
                            </div>
                        ) : recentPatients.length ? (
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                                variants={stagger}
                                initial="hidden"
                                animate="show"
                            >
                                {recentPatients.map((p, i) => (
                                    <motion.div
                                        key={i}
                                        variants={fadeUp}
                                        onClick={() => navigate("/doctor/patients")}
                                        className={`${card} p-5 cursor-pointer`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                            <span
                                                className="material-symbols-outlined text-slate-400"
                                                style={{ fontVariationSettings: '"FILL" 1' }}
                                            >
                                                person
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-sm">{p.fullName}</h4>
                                        <p className="text-sm text-slate-500 mt-1">{p.phone ?? "—"}</p>
                                        <p className="text-xs text-slate-400 mt-1">ID: {p.id}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <p className="text-slate-400 text-sm">No recent patients.</p>
                        )}
                    </motion.section>
                </div>

                {/* daily timeline */}
                <div className="col-span-1 lg:col-span-4">
                    <motion.section
                        className={`${card} flex flex-col`}
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: 0.15 }}
                    >
                        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                                Daily Timeline
                            </h2>
                        </div>

                        <div className="p-4 sm:p-6 flex-1">
                            {loading ? (
                                <SkeletonRows />
                            ) : timeline.length ? (
                                <motion.div
                                    className="space-y-4"
                                    variants={stagger}
                                    initial="hidden"
                                    animate="show"
                                >
                                    {timeline.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            variants={itemFade}
                                            className="relative pl-5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary/30"
                                        >
                                            <span className="absolute left-[-3px] top-1.5 w-2 h-2 rounded-full bg-primary block" />
                                            <div className="font-bold text-slate-900 text-sm">
                                                {new Date(item.appointmentDate).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                            <div className="text-sm text-slate-600 mt-0.5">
                                                {item.patientName ?? "Unknown"}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">{item.status}</div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <p className="text-slate-400 text-sm">No appointments today.</p>
                            )}
                        </div>
                    </motion.section>
                </div>
            </div>
        </Layout>
    );
}