import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import api from "../../api/axios";

const CARD =
    "bg-white rounded-2xl border border-slate-200 shadow-subtle transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-slate-300";

export default function DoctorProfile() {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ today: 0, upcoming: 0, patients: 0 });
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [bio, setBio] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editMsg, setEditMsg] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [profileRes, dashRes, patientsRes] = await Promise.all([
                    api.get("/api/Doctor/profile"),
                    api.get("/api/Doctor/dashboard"),
                    api.get("/api/Doctor/patients"),
                ]);
                setProfile(profileRes.data.data);
                setStats({
                    today: dashRes.data.data.appointmentsTodayCount,
                    upcoming: dashRes.data.data.upcomingAppointments.length,
                    patients: patientsRes.data.count,
                });
            } catch (err) {
                console.error("Profile load error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const d = profile;
    const name = d?.user?.fullName;
    const spec = d?.specialization;
    const imgUrl = photoPreview || d?.doctorProfileImageUrl || d?.user?.userProfileImageUrl;

    function openEditModal() {
        setBio(d?.bio ?? "");
        setPhotoPreview(null);
        setPhotoFile(null);
        setEditMsg(null);
        setShowModal(true);
    }

    function closeEditModal() {
        setShowModal(false);
        setPhotoFile(null);
        setPhotoPreview(null);
    }

    function handlePhotoChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
    }

    async function saveProfile() {
        setSaving(true);
        try {
            let photoUrl = d?.doctorProfileImageUrl || d?.user?.userProfileImageUrl || null;

            if (photoFile) {
                const formData = new FormData();
                formData.append("file", photoFile);
                const uploadRes = await api.post("/api/upload/image", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                photoUrl =
                    uploadRes.data.url ||
                    uploadRes.data.imageUrl ||
                    uploadRes.data.data?.url ||
                    photoUrl;
            }

            await api.put("/api/doctor/profile", {
                bio: bio.trim(),
                profileImageUrl: photoUrl,
            });

            setEditMsg({ text: "Profile updated successfully!", success: true });
            setProfile((prev) => ({
                ...prev,
                bio: bio.trim(),
                doctorProfileImageUrl: photoUrl,
            }));
            setTimeout(closeEditModal, 1500);
        } catch (err) {
            console.error(err);
            setEditMsg({ text: "Failed to save. Please try again.", success: false });
        } finally {
            setSaving(false);
        }
    }

    return (
        <Layout>
            {/* Page Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Your personal and professional information
                    </p>
                </div>
                <button
                    onClick={openEditModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold shadow-subtle transition-all duration-200 hover:scale-105 active:scale-95 hover:opacity-90"
                >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit Profile
                </button>
            </div>

            {/* Profile Hero Card */}
            <div className={CARD + " overflow-hidden"}>
                {/* Banner — full width, no radius, sits flush inside the card's overflow:hidden */}
                <div className="h-28 sm:h-36 bg-gradient-to-r from-primary to-slate-600 w-full" />

                {/* Avatar only — pulled up over the banner */}
                <div className="px-4 sm:px-8" style={{ marginTop: "-44px" }}>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white shadow-lg bg-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                        {imgUrl ? (
                            <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <span
                                className="material-symbols-outlined text-white text-5xl"
                                style={{ fontVariationSettings: '"FILL" 1' }}
                            >
                                person
                            </span>
                        )}
                    </div>
                </div>

                {/* Name + info — always on white background below banner */}
                <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-3">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                            {loading
                                ? <span className="inline-block w-36 h-6 bg-slate-200 animate-pulse rounded" />
                                : (name ?? "-")}
                        </h2>
                        <p className="text-slate-500 font-medium text-sm mt-0.5">
                            {loading
                                ? <span className="inline-block w-24 h-4 bg-slate-100 animate-pulse rounded mt-1" />
                                : (spec ?? "-")}
                        </p>
                        <div className="mt-2">
                            {!loading && d && (
                                d.isActive ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                                        Inactive
                                    </span>
                                )
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    {d?.bio && (
                        <div className="mt-6 pt-5 border-t border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">About</p>
                            <p className="text-slate-600 text-sm leading-relaxed">{d.bio}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { icon: "today", label: "Today", value: stats.today },
                    { icon: "event_upcoming", label: "Upcoming", value: stats.upcoming },
                    { icon: "group", label: "Patients", value: stats.patients },
                ].map(({ icon, label, value }) => (
                    <div
                        key={label}
                        className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-slate-300"
                    >
                        <span
                            className="material-symbols-outlined text-primary text-2xl"
                            style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                            {icon}
                        </span>
                        <p className="text-3xl font-bold text-slate-900 mt-2">
                            {loading
                                ? <span className="inline-block w-8 h-8 bg-slate-200 animate-pulse rounded" />
                                : value}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1">
                            {label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={CARD + " p-6"}>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-5">
                        <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
                        Personal Information
                    </h3>
                    <div className="space-y-4">
                        <InfoRow label="Full Name" value={name} loading={loading} />
                        <InfoRow label="Email" value={d?.user?.email} loading={loading} />
                        <InfoRow label="Role" value="Doctor" />
                    </div>
                </div>

                <div className={CARD + " p-6"}>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-5">
                        <span className="material-symbols-outlined text-primary text-[18px]">medical_services</span>
                        Professional Information
                    </h3>
                    <div className="space-y-4">
                        <InfoRow label="Doctor ID" value={d ? `#${d.id}` : null} loading={loading} />
                        <InfoRow label="Specialization" value={spec} loading={loading} />
                        <InfoRow label="Status" value={d ? (d.isActive ? "Active" : "Inactive") : null} loading={loading} />
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
                            <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-700 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Photo Upload */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Profile Photo</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-slate-200">
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
                                    <div className="flex-1">
                                        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors w-fit">
                                            <span className="material-symbols-outlined text-[18px]">upload</span>
                                            Choose Photo
                                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                        </label>
                                        <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Bio</label>
                                <textarea
                                    rows={4}
                                    placeholder="Write a short bio about yourself..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                />
                            </div>

                            {editMsg && (
                                <div className={`text-sm font-semibold px-4 py-3 rounded-xl ${editMsg.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                    {editMsg.text}
                                </div>
                            )}
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={closeEditModal}
                                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveProfile}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 hover:opacity-90 disabled:opacity-60"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

function InfoRow({ label, value, loading }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            {loading ? (
                <div className="w-32 h-4 bg-slate-100 animate-pulse rounded mt-1" />
            ) : (
                <p className="text-sm font-semibold text-slate-900 mt-1">{value ?? "-"}</p>
            )}
        </div>
    );
}