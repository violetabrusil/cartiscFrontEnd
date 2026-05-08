import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Select from 'react-select';
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import { ToastContainer, toast } from "react-toastify";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import { selectStyles } from "../../styles/selectStyles";
import { PaymentService } from "../../services/paymentService";
import { paymentMethodMaping } from "../../constants/paymentMethodConstants";
import { PuffLoader } from "react-spinners";

const arrowLeftIcon = process.env.PUBLIC_URL + "/images/icons/arrowLeftIcon.png";

const SALE_STATUS_LABEL = { paid: "Pagado", partial: "Parcial", pending: "Pendiente", cancelled: "Cancelada" };
const PAYMENT_STATUS_LABEL = { confirmed: "Confirmado", voided: "Anulado", reversed: "Reversado" };

const REVERSAL_TYPES = [
    { value: "reversal", label: "Corrección posterior" },
    { value: "refund", label: "Devolución al cliente" },
    { value: "chargeback", label: "Contracargo bancario" },
];

const paymentTypeOptions = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'electronic_money', label: 'Billetera digital' },
    { value: 'debit_card', label: 'Tarjeta de débito' },
    { value: 'credit_card', label: 'Tarjeta de crédito' },
    { value: 'bank_transfer', label: 'Transferencia bancaria' },
    { value: 'credit_note', label: 'Nota de crédito' }
];

const SALE_STATUS_STYLE = {
    paid: { bg: "#e6f4ea", text: "#1e7e34" },
    partial: { bg: "#fff8e1", text: "#c77700" },
    pending: { bg: "#fbfcd0", text: "#ebd300" },
    cancelled: { bg: "#fdecea", text: "#b71c1c" },
    avoided: { bg: "#c4c5c6", text: "#9CA3AF"},
};

const PAYMENT_STATUS_STYLE = {
    confirmed: { bg: "#e6f4ea", text: "#1e7e34" },
    voided: { bg: "#fdecea", text: "#b71c1c" },
    reversed: { bg: "#ffc76cf1", text: "#b23e00" },
};

const options_search_payment = [
    { value: "method", label: "Método de pago" },
    { value: "status", label: "Estado" },
    { value: "reference", label: "Referencia" },
];


function KpiCard({ label, value, accent, progress }) {
    return (
        <div className="card" style={{ padding: "18px 20px", background: accent ? "#0C1F31" : "#fff" }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: accent ? "#ccc" : "#807777", marginBottom: 6 }}>
                {label}
            </p>
            <p style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: accent ? "#f4f3ef" : "#1a1a18" }}>
                $ {value}
            </p>
            {progress != null && (
                <div style={{ marginTop: 10 }}>
                    <div style={{ background: "#2e2e2c", borderRadius: 4, height: 5, overflow: "hidden" }}>
                        <div style={{ width: `${progress}%`, background: "#8bc34a", height: "100%", borderRadius: 4, transition: "width 0.4s ease" }} />
                    </div>
                    <p style={{ fontSize: 14, color: "#bbb", marginTop: 4 }}>{progress}% pagado</p>
                </div>
            )}
        </div>
    );
}

function RegisterPaymentModal({ payment, onClose, onSubmit }) {
    const [form, setForm] = useState({ amount: "", date: new Date().toLocaleDateString('en-CA'), reference: "" });
    const [paymentType, setPaymentType] = useState(null);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const canSubmit = form.amount && paymentType;

    const modalSelectStyles = {
        control: (base, state) => ({
            ...base,
            height: '42px',
            minHeight: '42px',
            border: state.isFocused
                ? '1.5px solid #0C1F31'
                : '1.5px solid rgba(0,0,0,0.12)',
            borderRadius: '8px',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(12,31,49,0.08)' : 'none',
            background: '#fff',
            cursor: 'pointer',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            '&:hover': { borderColor: 'rgba(0,0,0,0.28)' },
        }),
        placeholder: (base) => ({ ...base, color: '#b0acaa', fontSize: '13.5px' }),
        singleValue: (base) => ({ ...base, color: '#1a1a18', fontSize: '13.5px', fontWeight: 500 }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: state.isFocused ? '#0C1F31' : 'rgba(0,0,0,0.3)',
            transition: 'transform 0.2s',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
        indicatorSeparator: () => ({ display: 'none' }),
        menu: (base) => ({
            ...base,
            borderRadius: '8px',
            border: '1.5px solid rgba(0,0,0,0.09)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            overflow: 'hidden',
            marginTop: '4px',
        }),
        menuList: (base) => ({ ...base, padding: '4px' }),
        option: (base, state) => ({
            ...base,
            fontSize: '13.5px',
            borderRadius: '6px',
            padding: '8px 12px',
            cursor: 'pointer',
            color: state.isSelected ? '#0C1F31' : '#444',
            backgroundColor: state.isSelected ? '#e8edf2' : state.isFocused ? '#faf9f7' : 'transparent',
            fontWeight: state.isSelected ? 600 : 400,
        }),
    };

    return (
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(10, 18, 28, 0.45)',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000,
                animation: 'fadeIn 0.18s ease',
            }}
        >
            <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '580px',
                minHeight: '480px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'slideUp 0.22s ease',
            }}>

                {/* Header */}
                <div style={{
                    padding: '28px 32px 22px',
                    borderBottom: '1px solid #f0ede8',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    background: '#0C1F31',
                }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#f4f3ef', margin: 0 }}>
                            Registrar Pago
                        </h2>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 10, marginBottom: 0 }}>
                            {payment.id} · Saldo pendiente&nbsp;
                            <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>
                                $ {(payment.balance)}
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '8px',
                            width: 32, height: 32,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, color: 'rgba(255,255,255,0.6)',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>

                    {/* Valor */}
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#807777', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                            Valor *
                        </label>
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            border: '1.5px solid rgba(0,0,0,0.12)',
                            borderRadius: '8px', overflow: 'hidden',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                            onFocusCapture={e => { e.currentTarget.style.borderColor = '#0C1F31'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(12,31,49,0.08)'; }}
                            onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <span style={{ padding: '0 12px', fontSize: 14, color: '#9e9b97', background: '#faf9f7', height: '42px', display: 'flex', alignItems: 'center', borderRight: '1.5px solid rgba(0,0,0,0.08)' }}>
                                $
                            </span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={(e) => set("amount", e.target.value)}
                                style={{
                                    border: 'none', outline: 'none',
                                    padding: '0 14px', height: '42px',
                                    fontSize: '14px', color: '#1a1a18',
                                    background: 'transparent', width: '100%',
                                }}
                            />
                        </div>
                    </div>

                    {/* Forma de pago + Fecha */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#807777', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                                Forma de pago *
                            </label>
                            <Select
                                isSearchable={false}
                                options={paymentTypeOptions}
                                onChange={(opt) => setPaymentType(opt.value)}
                                value={paymentTypeOptions.find((o) => o.value === paymentType) ?? null}
                                placeholder="Seleccione"
                                styles={modalSelectStyles}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#807777', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                                Fecha
                            </label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) => set("date", e.target.value)}
                                style={{
                                    height: '42px', width: '100%',
                                    border: '1.5px solid rgba(0,0,0,0.12)',
                                    borderRadius: '8px', padding: '0 12px',
                                    fontSize: '13.5px', color: '#1a1a18',
                                    outline: 'none', boxSizing: 'border-box',
                                    background: '#fff',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                onFocus={e => { e.target.style.borderColor = '#0C1F31'; e.target.style.boxShadow = '0 0 0 3px rgba(12,31,49,0.08)'; }}
                                onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    {/* Referencia */}
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#807777', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                            Referencia / Folio
                        </label>
                        <input
                            placeholder="Opcional"
                            value={form.reference}
                            onChange={(e) => set("reference", e.target.value)}
                            style={{
                                height: '42px', width: '100%',
                                border: '1.5px solid rgba(0,0,0,0.12)',
                                borderRadius: '8px', padding: '0 14px',
                                fontSize: '13.5px', color: '#1a1a18',
                                outline: 'none', boxSizing: 'border-box',
                                background: '#fff',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}
                            onFocus={e => { e.target.style.borderColor = '#0C1F31'; e.target.style.boxShadow = '0 0 0 3px rgba(12,31,49,0.08)'; }}
                            onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '24px 32px 36px',
                    display: 'flex',
                    gap: 10,
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            height: '40px', padding: '0 20px',
                            border: '1.5px solid rgba(0,0,0,0.12)',
                            borderRadius: '8px', background: '#fff',
                            fontSize: '13.5px', color: '#555',
                            cursor: 'pointer', fontWeight: 500,
                            transition: 'border-color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#faf9f7'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => canSubmit && onSubmit({ ...form, method: paymentType, amount: parseFloat(form.amount) })}
                        disabled={!canSubmit}
                        style={{
                            height: '40px', padding: '0 22px',
                            border: 'none', borderRadius: '8px',
                            background: canSubmit ? '#0C1F31' : '#e0deda',
                            color: canSubmit ? '#f4f3ef' : '#aaa',
                            fontSize: '13.5px', fontWeight: 600,
                            cursor: canSubmit ? 'pointer' : 'not-allowed',
                            transition: 'background 0.2s, transform 0.1s',
                        }}
                        onMouseEnter={e => canSubmit && (e.currentTarget.style.background = '#16304a')}
                        onMouseLeave={e => canSubmit && (e.currentTarget.style.background = '#0C1F31')}
                    >
                        Guardar pago
                    </button>
                </div>
            </div>

            {/* Animaciones */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
            `}</style>
        </div>
    );
}

function VoidPaymentModal({ payment, onClose, onConfirm }) {
    const [reason, setReason] = useState("");
    const [reversalReason, setReversalReason] = useState("");

    const isSameDay = () => {
        if (!payment.date) return false;
        const todayStr = new Date().toLocaleDateString('en-CA');
        return payment.date === todayStr;
    };

    const sameDay = isSameDay();
    const canConfirm = reason.trim() !== "" && (sameDay || reversalReason !== "");

    const handleConfirm = () => {
        onConfirm({
            reason,
            reversal_type: sameDay ? "void" : "reversed",
            reversal_reason: sameDay ? null : reversalReason,
            occurred_at: new Date().toISOString(),
        });
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-sm">
                <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid #f0ede8" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 24 }}>⚠️</span>

                        <h2 style={{ fontSize: 21 }}>{sameDay ? "Anular Pago" : "Revertir pago"}</h2>
                    </div>
                    <p style={{ fontSize: 13.5, color: "#444", lineHeight: 1.65, textAlign: "justify" }}>
                        Está a punto de <strong>{sameDay ? "anular" : "revertir"}</strong> el pago <strong>{payment.id}</strong> por {"$"}
                        <strong>{(payment.amount)}</strong> ({payment.method}).
                        Esta acción se registrará en el registro de auditoría y{" "}
                        <strong>no se puede deshacer</strong>.
                    </p>
                </div>

                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>

                    {!sameDay && (
                        <div>
                            <label className="payment-label">Tipo de anulación*</label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                                {REVERSAL_TYPES.map((opt) => (
                                    <label
                                        key={opt.value}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            padding: "10px 14px",
                                            borderRadius: 8,
                                            border: `1.5px solid ${reversalReason === opt.value ? "#316EA8" : "#e0ddd8"}`,
                                            background: reversalReason === opt.value ? "#f0f6fc" : "#fff",
                                            cursor: "pointer",
                                            fontSize: 13.5,
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="reversal_type"
                                            value={opt.value}
                                            checked={reversalReason === opt.value}
                                            onChange={() => setReversalReason(opt.value)}
                                            style={{ accentColor: "#316EA8" }}
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                            {reversalReason === "" && (
                                <p style={{ fontSize: 10, color: "#e57373", marginTop: 4 }}>
                                    Seleccione un tipo de anulación para continuar
                                </p>
                            )}
                        </div>
                    )}

                    {/* Motivo libre */}
                    <div>
                        <label className="payment-label">Motivo*</label>
                        <textarea
                            className="payment-textarea"
                            placeholder="Describa el motivo por el que se anula este pago…"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        {reason.trim() === "" && (
                            <p style={{ fontSize: 10, color: "#e57373", marginTop: 3 }}>
                                Se requiere un motivo para continuar
                            </p>
                        )}
                    </div>

                    <div style={{ background: "#fdecea", border: "1px solid #f5c6c6", borderRadius: 8, padding: "10px 14px" }}>
                        <p style={{ fontSize: 12.5, color: "#c62828", lineHeight: 1.55, textAlign: 'justify' }}>
                            {sameDay
                                ? "El registro permanecerá visible con el estado Anulado."
                                : "Este pago no fue registrado hoy. El reverso del pago quedará registrado con el tipo seleccionado."
                            } Si el monto es incorrecto, cree un nuevo pago con los datos correctos.
                        </p>
                    </div>
                </div>

                <div style={{ padding: "0 24px 24px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button className="btn-ghost" onClick={onClose}>Cancelar</button>
                    <button
                        className="btn-danger"
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                    >
                        {sameDay ? "Confirmar anulación" : "Confirmar reversión"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Payments() {

    const [payment, setPayment] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRegisterModal, setShowRM] = useState(false);
    const autoOpenedRM = useRef(false);
    const [voidTarget, setVoidTarget] = useState(null);
    const [recordFilters, setRecordFilters] = useState({ searchField: "method", searchValue: "" });
    const [recordPage, setRecordPage] = useState(1);
    const [recordTotalPages, setRecordTotalPages] = useState(1);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const RECORD_PAGE_SIZE = 5;

    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const saleInfo = location.state?.saleInfo;

    const isToday = (dateStr) => {
        if (!dateStr) return false;
        const today = new Date().toLocaleDateString('en-CA');

        return dateStr === today;
    };

    const onBack = () => {
        const destination = location.state?.from ?? "/sales";
        navigate(destination, {
            state: { fromDetail: true }
        });
    };

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        PaymentService.getPaymentBySale(id)
            .then((data) => {
                setPayment({
                    id: data.code,
                    uuid: data.id,
                    status: data.status,
                    total: data.total_amount,
                    amountPaid: data.paid_amount,
                    balance: data.remaining,
                    note: data.notes,
                    date: saleInfo?.date ?? "",
                    workOrderCode: saleInfo?.workOrderCode ?? "",
                    client: saleInfo?.client ?? "",
                });
            })
            .catch((err) => {
                toast.error("Error al cargar los datos de la venta.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleRegisterPayment = async (form) => {
        try {
            const data = await PaymentService.registerPayment(payment.uuid, form);

            setPayment((prev) => ({
                ...prev,
                status: data.status,
                total: data.total_amount,
                amountPaid: data.paid_amount,
                balance: data.remaining,
            }));

            await fetchRecords(recordFilters, 1);

            if (data.status === "paid") {
                toast.success("¡Venta liquidada en su totalidad!.", { position: toast.POSITION.TOP_RIGHT });
            } else {
                toast.success("Pago registrado correctamente.", { position: toast.POSITION.TOP_RIGHT });
            }
            setShowRM(false);
        } catch (err) {
            toast.error("Error al registrar el pago.");
        }
        setShowRM(false);
    };

    const handleVoidPayment = async ({ reason, reversal_type, reversal_reason, occurred_at }) => {
        try {
            await PaymentService.voidPayment(payment.uuid, voidTarget.uuid, {
                reason,
                reversal_type,
                reversal_reason,
                occurred_at,
            });

            const data = await PaymentService.getPaymentBySale(id);
            setPayment((prev) => ({
                ...prev,
                status: data.status,
                total: data.total_amount,
                amountPaid: data.paid_amount,
                balance: data.remaining,
            }));

            await fetchRecords(recordFilters, 1);

            const successMsg = reversal_type === "reversed"
                ? "Pago revertido correctamente."
                : "Pago anulado correctamente.";

            toast.success(successMsg, { position: toast.POSITION.TOP_RIGHT });
            setVoidTarget(null);
        } catch (error) {
            toast.error("Error al anular el pago.");
            console.error(error);
        }
    };

    const handleDownloadRecord = async (record) => {
        try {
            setDownloadingPdf(true);
            await PaymentService.downloadRecordPdf(record.uuid);
            toast.success('Comprobante descargado.', { position: toast.POSITION.TOP_RIGHT });
        } catch (error) {
            toast.error('Error al generar el comprobante.');
            console.error(error);
        }
        setDownloadingPdf(false)
    };

    useEffect(() => {
        if (location.state?.openRegisterModal && payment && !autoOpenedRM.current) {
            autoOpenedRM.current = true;
            setShowRM(true);
        }
    }, [payment]);

    const fetchRecords = async (filters = recordFilters, page = 1) => {
        if (payments.length === 0)
            setRecordsLoading(true);
        try {
            const queryFilters = {};
            if (filters.searchField && filters.searchValue) {
                queryFilters[filters.searchField] = filters.searchValue;
            }
            console.log("🔍 fetchRecords params:", { ...queryFilters, page, pageSize: RECORD_PAGE_SIZE });

            const data = await PaymentService.getRecords(payment.uuid, {
                ...queryFilters,
                page,
                pageSize: RECORD_PAGE_SIZE,
            });

            console.log("respuesta getRecords:", data);

            const formatted = (data.values ?? []).map((r) => ({
                id: r.code,
                uuid: r.id,
                date: r.occurred_at ? new Date(r.occurred_at).toLocaleDateString('en-CA') : "",
                amount: r.amount,
                method: paymentMethodMaping[r.method] ?? r.method,
                status: r.status,
                reference: r.reference || null,
                voidedAt: r.voided_at ?? null,
                voidedBy: r.voided_by ?? null,
                voidReason: r.void_reason ?? null,
            }));
            setPayments(formatted);
            setRecordTotalPages(data.page_info?.total_pages ?? 1);
            setRecordPage(page);
        } catch (err) {
            toast.error("Error al buscar comprobantes.");
        } finally {
            setRecordsLoading(false);
        }
    };

    useEffect(() => {
        if (!payment?.uuid) return;

        if (!recordFilters.searchValue) {
            fetchRecords(recordFilters, 1);
            return;
        }

        const timer = setTimeout(() => {
            fetchRecords(recordFilters, 1);
        }, 400);
        return () => clearTimeout(timer);
    }, [recordFilters.searchValue, recordFilters.searchField, payment?.uuid]);

    if (loading || !payment) {
        return (
            <div>
                <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
                <Menu />
                <div>
                    <PuffLoader color="#316EA8" loading={loading} size={60} />
                </div>
            </div>
        );
    }

    const progress = Math.round((payment.amountPaid / payment.total) * 100);

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <ToastContainer />

            <div className="container-payments">

                {(downloadingPdf &&
                    <div className="absolute-loader-container">
                        <PuffLoader color="#316EA8" loading={true} size={60} />
                    </div>
                )}

                <div style={{ margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <button onClick={onBack} className="button-arrow-client">
                                <img src={arrowLeftIcon} className="arrow-icon-client" alt="Arrow Icon" />
                            </button>
                            <CustomTitleSection
                                title={payment.id}
                            />
                            <span className="status-tag" style={{ background: SALE_STATUS_STYLE[payment.status]?.bg, color: SALE_STATUS_STYLE[payment.status]?.text }}>
                                {SALE_STATUS_LABEL[payment.status]}
                            </span>

                        </div>

                        {payment.status !== "paid" && payment.status != "cancelled" && (
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    if (payment.balance <= 0) {
                                        toast.error("Esta venta ya fue cancelada en su totalidad.");
                                        return;
                                    }
                                    setShowRM(true);
                                }}
                            >
                                Registrar pago
                            </button>
                        )}
                    </div>

                </div>
                <p style={{ color: "#888", marginTop: '0px', marginBottom: '0px' }}>{payment.date} &nbsp;·&nbsp; {payment.workOrderCode} &nbsp;·&nbsp; {payment.client}</p>

                <div style={{ margin: "0 auto", padding: "28px 0px", display: "flex", flexDirection: "column", gap: 20 }}>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                        <KpiCard label="Valor total" value={(payment.total)} />
                        <KpiCard label="Valor pagado" value={(payment.amountPaid)} />
                        <KpiCard label="Saldo pendiente" value={(payment.balance)} accent progress={progress} />
                    </div>

                    {payment.note && (
                        <div style={{ background: "#fcfcf7", border: "1px solid #e7e6c1", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <p style={{ fontSize: 13.5, color: "#555", lineHeight: 1.6 }}>{payment.note}</p>
                        </div>
                    )}

                    <div className="card">
                        <div style={{ borderBottom: "1.5px solid #f0ede8", padding: "0 8px", display: "flex", alignItems: "center" }}>
                            <button className="tab-btn active">Historial de pago</button>
                            <div style={{ flex: 1 }} />
                            <span style={{ fontSize: 12, color: "#bbb", paddingRight: 16 }}>
                                {payments.filter((p) => p.status !== "voided").length} confirmados · {payments.filter((p) => p.status === "voided").length} anulados
                            </span>
                        </div>

                        <div style={{ background: "#fdfcfa", marginTop: '-2rem', marginBottom: '1rem', marginLeft: '-1rem', marginRight: '-2rem' }}>
                            <div style={{ display: "flex", gap: 10, marginTop: "2.5rem", marginLeft: "2.5rem", alignItems: "center" }}>
                                <Select
                                    isSearchable={false}
                                    options={options_search_payment}
                                    placeholder="Buscar por..."
                                    value={options_search_payment.find(o => o.value === recordFilters.searchField) ?? null}
                                    onChange={(opt) => setRecordFilters({ searchField: opt?.value ?? "", searchValue: "" })}
                                    menuPortalTarget={document.body}
                                    styles={{
                                        ...selectStyles,
                                        container: (b) => ({ ...b, minWidth: 180 }),
                                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                    }}
                                />

                                {recordFilters.searchField === "method" ? (
                                    <Select
                                        isSearchable={false}
                                        isClearable
                                        options={paymentTypeOptions}
                                        placeholder="Seleccione método..."
                                        value={paymentTypeOptions.find(o => o.value === recordFilters.searchValue) ?? null}
                                        onChange={(opt) => setRecordFilters(f => ({ ...f, searchValue: opt?.value ?? "" }))}
                                        menuPortalTarget={document.body}
                                        styles={{
                                            ...selectStyles,
                                            container: (b) => ({ ...b, flex: 1 }),
                                            menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                        }}
                                    />
                                ) : recordFilters.searchField === "status" ? (
                                    <Select
                                        isSearchable={false}
                                        isClearable
                                        options={[
                                            { value: "confirmed", label: "Confirmado" },
                                            { value: "voided", label: "Anulado" },
                                            { value: "reversed", label: "Reversado" },
                                        ]}
                                        placeholder="Seleccione estado..."
                                        value={[
                                            { value: "confirmed", label: "Confirmado" },
                                            { value: "voided", label: "Anulado" },
                                            { value: "reversed", label: "Reversado" },
                                        ].find(o => o.value === recordFilters.searchValue) ?? null}
                                        onChange={(opt) => setRecordFilters(f => ({ ...f, searchValue: opt?.value ?? "" }))}
                                        styles={{ ...selectStyles, container: (b) => ({ ...b, flex: 1 }) }}
                                    />
                                ) : (
                                    <input
                                        placeholder={recordFilters.searchField ? "Ingrese referencia..." : "Seleccione un campo"}
                                        value={recordFilters.searchValue ?? ""}
                                        disabled={!recordFilters.searchField}
                                        onChange={(e) => setRecordFilters(f => ({ ...f, searchValue: e.target.value }))}
                                        style={{
                                            height: '38px', padding: '0 12px',
                                            border: '1.5px solid rgba(0,0,0,0.12)',
                                            borderRadius: '8px', fontSize: '13.5px',
                                            outline: 'none', flex: 1,
                                            background: !recordFilters.searchField ? '#f5f5f5' : '#fff',
                                            cursor: !recordFilters.searchField ? 'not-allowed' : 'text',
                                        }}
                                    />
                                )}

                                {(recordFilters.searchField || recordFilters.searchValue) && (
                                    <button
                                        className="btn-ghost"
                                        onClick={() => {
                                            setRecordFilters({ searchField: "", searchValue: "" });
                                            fetchRecords({ searchField: "", searchValue: "" }, 1);
                                        }}
                                    >
                                    </button>
                                )}
                            </div>
                        </div>

                        <table className="payment-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Fecha</th>
                                    <th>Método de pago</th>
                                    <th>Referencia</th>
                                    <th>Valor</th>
                                    <th>Estado</th>
                                    <th style={{ textAlign: "right" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recordsLoading && payments.length === 0 ? (
                                    <tr>
                                        <PuffLoader color="#316EA8" loading={loading} size={60} />
                                    </tr>
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: "center", color: "#ccc", padding: "34px 0" }}>
                                            {(recordFilters.method || recordFilters.status || recordFilters.reference)
                                                ? "No se encontraron comprobantes con esos filtros"
                                                : "No hay comprobantes registrados"}
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((p) => {
                                        const isInactive = p.status === "voided" || p.status === "reversed";
                                        return (
                                            <tr key={p.id} style={{ opacity: recordsLoading ? 0.5 : 1 }} className={isInactive ? "row-voided" : ""}>
                                                <td style={{ fontFamily: "monospace", fontSize: 13, color: "#888" }}>{p.id}</td>
                                                <td style={{ color: "#555" }}>{p.date}</td>
                                                <td><span style={{ display: "flex", alignItems: "center", gap: 6 }}><span>{p.method}</span></span></td>
                                                <td style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>{p.reference ?? "—"}</td>
                                                <td><strong style={{ fontSize: 15 }}>$ {(p.amount)}</strong></td>
                                                <td>
                                                    <div>
                                                        <span className="tag" style={{ background: PAYMENT_STATUS_STYLE[p.status]?.bg, color: PAYMENT_STATUS_STYLE[p.status]?.text }}>
                                                            {PAYMENT_STATUS_LABEL[p.status]}
                                                        </span>
                                                        {isInactive && p.voidReason && (
                                                            <p style={{ fontSize: 11, color: "#b71c1c", marginTop: 3 }}>
                                                                {p.voidedAt} · {p.voidedBy} · "{p.voidReason}"
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                        <button className="btn-action" disabled={isInactive} onClick={() => handleDownloadRecord(p)}>
                                                            ⬇ Comprobante
                                                        </button>
                                                        <button
                                                            className="btn-action danger"
                                                            disabled={isInactive}
                                                            onClick={() => setVoidTarget(p)}
                                                        >
                                                            {isToday(p.date) ? "✕ Anular" : "↩ Revertir"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>

                        {/* Paginación */}
                        {recordTotalPages > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "12px 0 4px" }}>
                                <button
                                    className="btn-ghost"
                                    disabled={recordPage <= 1}
                                    onClick={() => fetchRecords(recordFilters, recordPage - 1)}
                                >
                                    ← Anterior
                                </button>
                                <span style={{ fontSize: 13, color: "#888" }}>
                                    Página {recordPage} de {recordTotalPages}
                                </span>
                                <button
                                    className="btn-ghost"
                                    disabled={recordPage >= recordTotalPages}
                                    onClick={() => fetchRecords(recordFilters, recordPage + 1)}
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modals */}
                {showRegisterModal && (
                    <RegisterPaymentModal
                        payment={payment}
                        onClose={() => setShowRM(false)}
                        onSubmit={handleRegisterPayment}
                    />
                )}
                {voidTarget && (
                    <VoidPaymentModal
                        payment={voidTarget}
                        onClose={() => setVoidTarget(null)}
                        onConfirm={handleVoidPayment}
                    />
                )}

            </div>
        </div>

    );



}