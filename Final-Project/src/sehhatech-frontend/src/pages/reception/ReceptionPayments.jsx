import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { receptionApi } from "../../api/receptionApi";
import PaymobModal from "../../components/PaymobModal";

import { useToast } from "../../hooks/useToast";
import ReceptionTopbar from "../../components/ReceptionTopbar";
import Toast from "../../components/Toast";

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

function getInitials(name) {
    if (!name) return "PT";
    return String(name).trim().split(" ").filter(Boolean).slice(0, 2)
        .map((w) => w[0]).join("").toUpperCase();
}

function money(value) {
    return `${Number(value || 0).toLocaleString()} EGP`;
}

function formatDate(value, locale) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

function formatLongDate(value, locale) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(locale, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
}

function normalizePaymentRows(rows) {
    return rows.map((row) => {
        const amount = Number(row.amount ?? row.totalAmount ?? row.invoiceAmount ?? 0);
        const paidAmount = Number(row.paidAmount ?? row.paid ?? 0);
        const remainingAmount = Number(row.remainingAmount ?? Math.max(amount - paidAmount, 0));

        let status = row.status ?? row.paymentStatus;
        if (!status) {
            if (remainingAmount <= 0) status = "Paid";
            else if (paidAmount > 0) status = "Partial";
            else status = "Unpaid";
        }

        return {
            id: row.id ?? row.invoiceId ?? row.paymentId,
            patientId: row.patientId,
            patientName: row.patientName ?? row.patient?.fullName ?? "Unknown Patient",
            patientPhone: row.patientPhone ?? row.patient?.phone ?? "--",
            serviceName: row.serviceName ?? row.service ?? row.notes ?? "Clinic Service",
            invoiceNumber: row.invoiceNumber ?? row.code ?? `INV-${row.id ?? row.invoiceId ?? "-"}`,
            amount,
            paidAmount,
            remainingAmount,
            status,
            createdAt: row.createdAt ?? row.date ?? row.appointmentDate,
        };
    });
}

function StatusBadge({ status, t }) {
    const s = String(status || "").toLowerCase();
    if (s === "paid") {
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">{t("reception.payments.paid")}</span>;
    }
    if (s === "partial") {
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">{t("reception.payments.partial")}</span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">{t("reception.payments.unpaid")}</span>;
}

const methodMap = { Cash: 1, Card: 2, Online: 3 };

export default function ReceptionPayments() {
    const { openSidebar } = useOutletContext();
    const { toast, showToast } = useToast();
    const { t, i18n } = useTranslation("common");
    const locale = i18n.language === "ar" ? "ar-EG" : "en-US";

    const [payments, setPayments] = useState([]);
    const [patients, setPatients] = useState([]);

    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState(todayISO());
    const [toDate, setToDate] = useState(todayISO());
    const [statusFilter, setStatusFilter] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [manualPatientsLoading, setManualPatientsLoading] = useState(false);
    const [manualForm, setManualForm] = useState({
        patientId: "", serviceName: "Appointment Visit", totalAmount: 500, paidAmount: 0, notes: "Manual invoice from reception page",
    });
    const [manualSubmitting, setManualSubmitting] = useState(false);

    const [payModalInvoice, setPayModalInvoice] = useState(null);
    const [payAmount, setPayAmount] = useState("");
    const [payMethod, setPayMethod] = useState("Cash");
    const [payNotes, setPayNotes] = useState("");
    const [paySubmitting, setPaySubmitting] = useState(false);

    const [quickInvoiceId, setQuickInvoiceId] = useState("");
    const [quickMethod, setQuickMethod] = useState("Cash");
    const [paymobUrl, setPaymobUrl] = useState(null);

    const loadPayments = useCallback(async () => {
        setLoading(true);
        setError(false);

        try {
            const params = new URLSearchParams();
            if (fromDate) params.append("from", fromDate);
            if (toDate) params.append("to", toDate);
            if (statusFilter) params.append("status", statusFilter);
            params.append("page", currentPage);
            params.append("pageSize", pageSize);

            const data = await receptionApi.getPayments(params.toString());

            setPayments(normalizePaymentRows(data.data || []));
            setTotalPages(data.totalPages || 1);
            setTotalCount(data.totalCount ?? (data.data || []).length);
        } catch (err) {
            console.error(err);
            setError(true);
            showToast(err.message || t("reception.payments.failedLoad"), "error");
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, statusFilter, currentPage, showToast, t]);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    const filteredPayments = search
        ? payments.filter((row) => {
            const value = search.trim().toLowerCase();
            return (
                row.patientName.toLowerCase().includes(value) ||
                row.patientPhone.toLowerCase().includes(value) ||
                row.serviceName.toLowerCase().includes(value) ||
                row.invoiceNumber.toLowerCase().includes(value) ||
                row.status.toLowerCase().includes(value)
            );
        })
        : payments;

    const paidTotal = payments.reduce((sum, item) => sum + item.paidAmount, 0);
    const unpaidTotal = payments.reduce((sum, item) => sum + item.remainingAmount, 0);
    const partialTotal = payments.filter((i) => i.status === "Partial").reduce((sum, i) => sum + i.remainingAmount, 0);
    const amountTotal = payments.reduce((sum, item) => sum + item.amount, 0);
    const paidPercentage = amountTotal > 0 ? Math.round((paidTotal / amountTotal) * 100) : 0;
    const unpaidInvoices = payments.filter((row) => row.status !== "Paid");

    async function openManualModal() {
        setManualModalOpen(true);
        setManualPatientsLoading(true);
        try {
            const data = await receptionApi.getPatients();
            setPatients(data.data || []);
        } catch (err) {
            showToast(err.message || t("reception.payments.failedLoad"), "error");
        } finally {
            setManualPatientsLoading(false);
        }
    }

    async function handleManualSubmit(e) {
        e.preventDefault();

        const patientId = Number(manualForm.patientId);
        const totalAmount = Number(manualForm.totalAmount);
        const paidAmount = Number(manualForm.paidAmount || 0);

        if (!patientId || !manualForm.serviceName.trim() || totalAmount <= 0) {
            showToast(t("reception.payments.errInvalidData"), "error");
            return;
        }
        if (paidAmount < 0 || paidAmount > totalAmount) {
            showToast(t("reception.payments.errPaidRange"), "error");
            return;
        }

        setManualSubmitting(true);
        try {
            const result = await receptionApi.createPaymentInvoice({
                patientId,
                serviceName: manualForm.serviceName.trim(),
                totalAmount,
                paidAmount,
                notes: manualForm.notes.trim(),
            });

            showToast(result?.message || t("reception.payments.createInvoiceBtn"));
            setManualModalOpen(false);
            setManualForm({ patientId: "", serviceName: "Appointment Visit", totalAmount: 500, paidAmount: 0, notes: "Manual invoice from reception page" });
            setCurrentPage(1);
            await loadPayments();
        } catch (err) {
            showToast(err.message || t("reception.payments.failedLoad"), "error");
        } finally {
            setManualSubmitting(false);
        }
    }

    function openPayModal(invoice) {
        setPayModalInvoice(invoice);
        setPayAmount(String(invoice.remainingAmount));
        setPayMethod("Cash");
        setPayNotes("");
    }

    function closePayModal() {
        setPayModalInvoice(null);
    }

    async function startOnlinePayment(invoiceId, amount, notes) {
        try {
            const result = await receptionApi.initiatePayment(invoiceId, {
                amount,
                method: methodMap.Online,
                notes,
            });

            showToast(result?.message || t("reception.payments.confirmPayment"));
            closePayModal();
            await loadPayments();
        } catch (err) {
            showToast(err.message || t("reception.payments.failedLoad"), "error");
        }
    }

    async function markCashOrCardPayment(invoiceId, amount, method, notes) {
        try {
            const result = await receptionApi.markCashPayment(invoiceId, {
                amount,
                method: methodMap[method] || 1,
                notes,
            });

            showToast(result?.message || t("reception.payments.confirmPayment"));
            closePayModal();
            await loadPayments();
        } catch (err) {
            showToast(err.message || t("reception.payments.failedLoad"), "error");
        }
    }

    async function handlePaySubmit(e) {
        e.preventDefault();
        if (!payModalInvoice) return;

        const amount = Number(payAmount);
        if (amount <= 0) {
            showToast(t("reception.payments.errInvalidAmount"), "error");
            return;
        }

        setPaySubmitting(true);
        try {
            if (payMethod === "Online") {
                await startOnlinePayment(payModalInvoice.id, amount, payNotes.trim());
            } else {
                await markCashOrCardPayment(payModalInvoice.id, amount, payMethod, payNotes.trim());
            }
        } finally {
            setPaySubmitting(false);
        }
    }

    async function paySelectedInvoice() {
        if (!quickInvoiceId) {
            showToast(t("reception.payments.errSelectInvoice"), "error");
            return;
        }

        const invoice = payments.find((row) => String(row.id) === String(quickInvoiceId));
        if (!invoice) return;

        if (quickMethod === "Online") {
            await startOnlinePayment(invoice.id, invoice.remainingAmount, "Quick payment");
        } else {
            await markCashOrCardPayment(invoice.id, invoice.remainingAmount, quickMethod, "Quick payment");
        }
    }

    function viewInvoice(invoice) {
        alert(
            `Invoice: ${invoice.invoiceNumber}\n` +
            `Patient: ${invoice.patientName}\n` +
            `Service: ${invoice.serviceName}\n` +
            `Amount: ${money(invoice.amount)}\n` +
            `Paid: ${money(invoice.paidAmount)}\n` +
            `Remaining: ${money(invoice.remainingAmount)}\n` +
            `Status: ${invoice.status}`
        );
    }

    async function handlePaymobSuccess() {
        setPaymobUrl(null);
        showToast(t("reception.payments.confirmPayment"));
        await loadPayments();
    }

    return (
        <>
            <ReceptionTopbar
                title={t("reception.payments.title")}
                subtitle={t("reception.payments.subtitle")}
                onMenuClick={openSidebar}
            >
                <div className="relative w-full xl:max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                        placeholder={t("reception.payments.searchPlaceholder")}
                    />
                </div>
                <button
                    onClick={loadPayments}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 inline-flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    {t("reception.payments.refresh")}
                </button>
                <button
                    onClick={openManualModal}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 inline-flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">add_card</span>
                    {t("reception.payments.newPayment")}
                </button>
            </ReceptionTopbar>

            <div className="p-4 lg:p-8 max-w-[1440px] mx-auto space-y-6">

                {/* Header + Filters */}
                <section className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight font-manrope">
                            {t("reception.payments.paymentQueue")}
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">
                            {loading
                                ? t("reception.payments.loadingRecords")
                                : `${formatLongDate(fromDate, locale)} • ${totalCount} ${t("reception.payments.invoicesLoaded")}`}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto">
                        <label>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {t("reception.payments.from")}
                            </span>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                                className="mt-1 w-full rounded-lg border-slate-200 bg-white text-sm focus:ring-blue-600 focus:border-blue-600"
                            />
                        </label>
                        <label>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {t("reception.payments.to")}
                            </span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                                className="mt-1 w-full rounded-lg border-slate-200 bg-white text-sm focus:ring-blue-600 focus:border-blue-600"
                            />
                        </label>
                        <label>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {t("reception.payments.status")}
                            </span>
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                className="mt-1 w-full rounded-lg border-slate-200 bg-white text-sm focus:ring-blue-600 focus:border-blue-600"
                            >
                                <option value="">{t("reception.payments.all")}</option>
                                <option value="Unpaid">{t("reception.payments.unpaid")}</option>
                                <option value="Partial">{t("reception.payments.partial")}</option>
                                <option value="Paid">{t("reception.payments.paid")}</option>
                            </select>
                        </label>
                    </div>
                </section>

                {/* KPIs */}
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500">{t("reception.payments.totalInvoices")}</p>
                        <h2 className="text-3xl font-black mt-2">{totalCount}</h2>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500">{t("reception.payments.paidKpi")}</p>
                        <h2 className="text-3xl font-black mt-2 text-emerald-600">{money(paidTotal)}</h2>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500">{t("reception.payments.unpaidKpi")}</p>
                        <h2 className="text-3xl font-black mt-2 text-red-600">{money(unpaidTotal)}</h2>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500">{t("reception.payments.partialKpi")}</p>
                        <h2 className="text-3xl font-black mt-2 text-amber-600">{money(partialTotal)}</h2>
                    </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                    {/* Payments Table */}
                    <section className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                    {t("reception.payments.patientPayments")}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    {loading
                                        ? t("reception.payments.loadingEntries")
                                        : `${filteredPayments.length} ${t("reception.payments.showingPayments")}`}
                                </p>
                            </div>
                            <button
                                onClick={loadPayments}
                                className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-2 rounded-lg w-fit inline-flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">sync</span>
                                {t("reception.payments.liveRefresh")}
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-left">
                                <thead>
                                    <tr className="bg-slate-50/80">
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t("reception.payments.colPatient")}</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t("reception.payments.colService")}</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t("reception.payments.colAmount")}</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t("reception.payments.colPaid")}</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t("reception.payments.colRemaining")}</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t("reception.payments.colStatus")}</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">{t("reception.payments.colActions")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading && (
                                        <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-500">{t("reception.payments.loadingPayments")}</td></tr>
                                    )}
                                    {!loading && error && (
                                        <tr><td colSpan={7} className="px-6 py-10 text-center text-red-500">{t("reception.payments.failedLoad")}</td></tr>
                                    )}
                                    {!loading && !error && filteredPayments.length === 0 && (
                                        <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-500">{t("reception.payments.noPayments")}</td></tr>
                                    )}
                                    {!loading && !error && filteredPayments.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                        {getInitials(row.patientName)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{row.patientName}</p>
                                                        <p className="text-xs text-slate-400">{row.patientPhone} • {row.invoiceNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-slate-700">{row.serviceName}</p>
                                                <p className="text-xs text-slate-400">{formatDate(row.createdAt, locale)}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">{money(row.amount)}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-emerald-600">{money(row.paidAmount)}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-red-600">{money(row.remainingAmount)}</td>
                                            <td className="px-6 py-4"><StatusBadge status={row.status} t={t} /></td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {row.status === "Paid" ? (
                                                        <button disabled className="px-4 py-2 rounded-lg bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed">
                                                            {t("reception.payments.paidBtn")}
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => openPayModal(row)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">
                                                            {t("reception.payments.payBtn")}
                                                        </button>
                                                    )}
                                                    <button onClick={() => viewInvoice(row)} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <p className="text-xs text-slate-500">
                                {t("reception.payments.page")} {currentPage} {t("reception.payments.of")} {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage <= 1}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-white disabled:opacity-50"
                                >
                                    {t("reception.payments.previous")}
                                </button>
                                <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-white disabled:opacity-50"
                                >
                                    {t("reception.payments.next")}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Right Panel */}
                    <aside className="xl:col-span-4 space-y-6">

                        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-blue-600">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">payments</span>
                                {t("reception.payments.quickPayment")}
                            </h3>
                            <div className="space-y-3">
                                <label>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                        {t("reception.payments.invoice")}
                                    </span>
                                    <select
                                        value={quickInvoiceId}
                                        onChange={(e) => setQuickInvoiceId(e.target.value)}
                                        className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm py-2 px-3 focus:ring-blue-600 focus:border-blue-600"
                                    >
                                        <option value="">{t("reception.payments.selectUnpaidInvoice")}</option>
                                        {unpaidInvoices.map((row) => (
                                            <option key={row.id} value={row.id}>
                                                {row.patientName} - {money(row.remainingAmount)}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                        {t("reception.payments.method")}
                                    </span>
                                    <select
                                        value={quickMethod}
                                        onChange={(e) => setQuickMethod(e.target.value)}
                                        className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm py-2 px-3 focus:ring-blue-600 focus:border-blue-600"
                                    >
                                        <option value="Online">{t("reception.payments.online")}</option>
                                        <option value="Cash">{t("reception.payments.cash")}</option>
                                        <option value="Card">{t("reception.payments.card")}</option>
                                    </select>
                                </label>
                                <button
                                    onClick={paySelectedInvoice}
                                    className="w-full mt-2 py-3 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">payment</span>
                                    {t("reception.payments.paySelectedInvoice")}
                                </button>
                            </div>
                        </section>

                        <section className="bg-slate-900 p-6 rounded-xl shadow-xl">
                            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-400 text-lg">monitoring</span>
                                {t("reception.payments.paymentSummary")}
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">{t("reception.payments.todayPaid")}</span>
                                    <span className="text-emerald-400 font-bold">{money(paidTotal)}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${Math.min(100, paidPercentage)}%` }} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">{t("reception.payments.pendingAmount")}</span>
                                    <span className="text-amber-400 font-bold">{money(unpaidTotal)}</span>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4">{t("reception.payments.pageNotes")}</h3>
                            <div className="space-y-3 text-sm text-slate-500">
                                <p className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-blue-600 text-lg">info</span>
                                    {t("reception.payments.pageNotesDesc")}
                                </p>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>

            {/* Manual Payment Modal */}
            {manualModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl">
                        <div className="flex justify-between items-start mb-5">
                            <div>
                                <h3 className="text-xl font-extrabold">{t("reception.payments.createPaymentTitle")}</h3>
                                <p className="text-sm text-slate-500">{t("reception.payments.createPaymentDesc")}</p>
                            </div>
                            <button onClick={() => setManualModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-xl">✕</button>
                        </div>

                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <label>
                                <span className="text-sm font-bold text-slate-600">{t("reception.payments.patient")}</span>
                                <select
                                    required
                                    value={manualForm.patientId}
                                    onChange={(e) => setManualForm({ ...manualForm, patientId: e.target.value })}
                                    className="mt-1 w-full rounded-xl border-slate-300"
                                >
                                    <option value="">
                                        {manualPatientsLoading ? t("reception.payments.loadingPatients") : t("reception.payments.selectPatient")}
                                    </option>
                                    {patients.map((p) => (
                                        <option key={p.id ?? p.Id} value={p.id ?? p.Id}>
                                            {p.fullName ?? p.FullName} - {p.phone ?? p.Phone}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span className="text-sm font-bold text-slate-600">{t("reception.payments.serviceName")}</span>
                                <input
                                    required
                                    value={manualForm.serviceName}
                                    onChange={(e) => setManualForm({ ...manualForm, serviceName: e.target.value })}
                                    className="mt-1 w-full rounded-xl border-slate-300"
                                />
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label>
                                    <span className="text-sm font-bold text-slate-600">{t("reception.payments.totalAmount")}</span>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={manualForm.totalAmount}
                                        onChange={(e) => setManualForm({ ...manualForm, totalAmount: e.target.value })}
                                        className="mt-1 w-full rounded-xl border-slate-300"
                                    />
                                </label>
                                <label>
                                    <span className="text-sm font-bold text-slate-600">{t("reception.payments.paidAmount")}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={manualForm.paidAmount}
                                        onChange={(e) => setManualForm({ ...manualForm, paidAmount: e.target.value })}
                                        className="mt-1 w-full rounded-xl border-slate-300"
                                    />
                                </label>
                            </div>

                            <label>
                                <span className="text-sm font-bold text-slate-600">{t("reception.payments.notes")}</span>
                                <textarea
                                    value={manualForm.notes}
                                    onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                                    className="mt-1 w-full rounded-xl border-slate-300"
                                />
                            </label>

                            <button
                                disabled={manualSubmitting}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-60"
                            >
                                {manualSubmitting ? t("reception.payments.creatingInvoice") : t("reception.payments.createInvoiceBtn")}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Pay Invoice Modal */}
            {payModalInvoice && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl">
                        <div className="flex justify-between items-start mb-5">
                            <div>
                                <h3 className="text-xl font-extrabold">{t("reception.payments.payInvoiceTitle")}</h3>
                                <p className="text-sm text-slate-500">
                                    {payModalInvoice.patientName} • {payModalInvoice.invoiceNumber}
                                </p>
                            </div>
                            <button onClick={closePayModal} className="text-slate-400 hover:text-slate-900 text-xl">✕</button>
                        </div>

                        <form onSubmit={handlePaySubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label>
                                    <span className="text-sm font-bold text-slate-600">{t("reception.payments.amountDue")}</span>
                                    <input
                                        disabled
                                        value={money(payModalInvoice.remainingAmount)}
                                        className="mt-1 w-full rounded-xl border-slate-300 bg-slate-50 text-slate-500"
                                    />
                                </label>
                                <label>
                                    <span className="text-sm font-bold text-slate-600">{t("reception.payments.payAmount")}</span>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={payAmount}
                                        onChange={(e) => setPayAmount(e.target.value)}
                                        className="mt-1 w-full rounded-xl border-slate-300"
                                    />
                                </label>
                            </div>

                            <label>
                                <span className="text-sm font-bold text-slate-600">{t("reception.payments.paymentMethod")}</span>
                                <select
                                    required
                                    value={payMethod}
                                    onChange={(e) => setPayMethod(e.target.value)}
                                    className="mt-1 w-full rounded-xl border-slate-300"
                                >
                                    <option value="Online">{t("reception.payments.onlinePayment")}</option>
                                    <option value="Cash">{t("reception.payments.cash")}</option>
                                    <option value="Card">{t("reception.payments.card")}</option>
                                </select>
                            </label>

                            <label>
                                <span className="text-sm font-bold text-slate-600">{t("reception.payments.notes")}</span>
                                <textarea
                                    value={payNotes}
                                    onChange={(e) => setPayNotes(e.target.value)}
                                    placeholder={t("reception.payments.notesPlaceholder")}
                                    className="mt-1 w-full rounded-xl border-slate-300"
                                />
                            </label>

                            <button
                                disabled={paySubmitting}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-60"
                            >
                                {paySubmitting ? t("reception.payments.processing") : t("reception.payments.confirmPayment")}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <PaymobModal
                iframeUrl={paymobUrl}
                onClose={() => setPaymobUrl(null)}
                onSuccess={handlePaymobSuccess}
            />

            <Toast message={toast.message} type={toast.type} show={toast.show} />
        </>
    );
}