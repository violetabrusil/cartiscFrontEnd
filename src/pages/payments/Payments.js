import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Select from 'react-select';
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import { ToastContainer } from "react-toastify";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import SearchBar from "../../searchBar/SearchBar";
import { selectStyles } from "../../styles/selectStyles";

const arrowLeftIcon = process.env.PUBLIC_URL + "/images/icons/arrowLeftIcon.png";

const MOCK_SALE = {
    id: "VTA-1042",
    date: "14 Feb 2026",
    client: "Ferretería El Clavo Dorado",
    salesperson: "Luis Ramírez",
    status: "partial",
    total: 48500,
    amountPaid: 28500,
    balance: 20000,
    note: "El cliente acordó liquidar el saldo restante antes del cierre de mes. Pagos preferentemente por transferencia.",
};

const MOCK_PAYMENTS = [
    { id: "AB-001", date: "14 Feb 2026", amount: 15000, method: "transfer", status: "confirmed", reference: "TRF-88291", voidedAt: null, voidedBy: null, voidReason: null },
    { id: "AB-002", date: "20 Feb 2026", amount: 8500, method: "cash", status: "confirmed", reference: null, voidedAt: null, voidedBy: null, voidReason: null },
    { id: "AB-003", date: "25 Feb 2026", amount: 5000, method: "card", status: "pending", reference: "DEB-4421", voidedAt: null, voidedBy: null, voidReason: null },
];
const fmt = (n) => (typeof n === "number" ? `${n.toLocaleString("ex-MX")}` : "-");

const SALE_STATUS_LABEL = { paid: "Pagado", partial: "Parcial", pending: "Pendiente" };
const PAYMENT_STATUS_LABEL = { confirmed: "Confirmado", voided: "Anulado" };
const METHOD_LABEL = { cash: "Efectivo", transfer: "Transferencia", card: "Tarjeta" };

const paymentTypeOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'cash', label: 'Efectivo' },
    { value: 'electronic_money', label: 'Transferencia' },
    { value: 'debit_credit_card', label: 'Tarjeta de crédito' },
    { value: 'other', label: 'Otro' },
];

const SALE_STATUS_STYLE = {
    paid: { bg: "#e6f4ea", text: "#1e7e34" },
    partial: { bg: "#fff8e1", text: "#c77700" },
    pending: { bg: "#fdecea", text: "#b71c1c" },
};

const PAYMENT_STATUS_STYLE = {
    confirmed: { bg: "#e6f4ea", text: "#1e7e34" },
    voided: { bg: "#fdecea", text: "#b71c1c" },
};

const DEFAULT_OPTION = { value: 'payment_method', label: 'Método de pago' };

const options_search_payment = [
    { value: 'payment_method', label: 'Método de pago' },
    { value: 'reference', label: 'Referencia' }
];

function KpiCard({ label, value, accent, progress }) {
    return (
        <div className="card" style={{ padding: "18px 20px", background: accent ? "#0C1F31" : "#fff" }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: accent ? "#ccc" : "#807777", marginBottom: 6 }}>
                {label}
            </p>
            <p style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: accent ? "#f4f3ef" : "#1a1a18" }}>
                {value}
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
    const [form, setForm] = useState({ amount: "", date: new Date().toISOString().slice(0, 10), reference: "" });
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
                boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
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
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 10, marginBottom:  0}}>
                            {payment.id} · Saldo pendiente&nbsp;
                            <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>
                                {fmt(payment.balance)}
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
                    padding: '0 32px 28px',
                    display: 'flex', gap: 10, justifyContent: 'flex-end',
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
    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-sm">
                <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid #f0ede8" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 24 }}>⚠️</span>
                        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 21 }}>Anular pago</h2>
                    </div>
                    <p style={{ fontSize: 13.5, color: "#444", lineHeight: 1.65 }}>
                        Esta a punto de anular el pago<strong>{payment.id}</strong> por{" "}
                        <strong>{fmt(payment.amount)}</strong> ({METHOD_LABEL[payment.method]}).
                        Esta acción se registrará en el registro de auditoría y <strong>no se puede deshacer</strong>.
                    </p>
                </div>
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                        <label className="payment-label">Motivo*</label>
                        <textarea
                            className="payment-textarea"
                            placeholder="Describa el motivo por el que se anula este pago…"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        {reason.trim() === "" && (
                            <p style={{ fontSize: 12, color: "#e57373", marginTop: 4 }}>Se requiere un motivo para continuar</p>
                        )}
                    </div>
                    <div style={{ background: "#fdecea", border: "1px solid #f5c6c6", borderRadius: 8, padding: "10px 14px" }}>
                        <p style={{ fontSize: 12.5, color: "#c62828", lineHeight: 1.55 }}>
                            El registro permanecerá visible con el estado <strong>Anulado</strong>. Si el monto es incorrecto, cree un nuevo pago con los datos correctos.
                        </p>
                    </div>
                </div>
                <div style={{ padding: "0 24px 24px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button className="btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn-danger" onClick={() => onConfirm(reason)} disabled={!reason.trim()}>
                        Confirmar anulación
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Payments() {

    const [payment] = useState(MOCK_SALE);
    const [payments, setPayments] = useState(MOCK_PAYMENTS);
    const [showRegisterModal, setShowRM] = useState(false);
    const [voidTarget, setVoidTarget] = useState(null);
    const [filter, setFilter] = useState("");
    const [toast, setToast] = useState(null);
    const [selectedOption, setSelectedOption] = useState(DEFAULT_OPTION);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const fromPage = location.state?.from;

    const onBack = () => {
        navigate(fromPage ?? "/sales", {
            state: { restorePage: location.state?.fromPage ?? 1 }
        });

    };

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

    const handleRegisterPayment = (form) => {
        setPayments((prev) => [...prev, {
            id: `AB-00${prev.length + 1}`,
            date: form.date,
            amount: parseFloat(form.amount),
            method: form.method,
            status: "pending",
            reference: form.reference || null,
            voidedAt: null, voidedBy: null, voidReason: null,
        }]);
        setShowRM(false);
        showToast("Pago registrado correctamente");
    };

    const handleVoidPayment = (reason) => {
        setPayments((prev) =>
            prev.map((p) =>
                p.id === voidTarget.id
                    ? { ...p, status: "voided", voidedAt: new Date().toLocaleDateString("en-GB"), voidedBy: "Admin", voidReason: reason }
                    : p
            )
        );
        showToast(`Pago ${voidTarget.id} anulado y registrado en el registro de auditoría.`);
        setVoidTarget(null);
    };

    const filtered = payments.filter((p) =>
        filter === "" ||
        p.id.toLowerCase().includes(filter.toLowerCase()) ||
        (METHOD_LABEL[p.method] ?? "").toLowerCase().includes(filter.toLowerCase()) ||
        (PAYMENT_STATUS_LABEL[p.status] ?? "").toLowerCase().includes(filter.toLowerCase())
    );

    const progress = Math.round((payment.amountPaid / payment.total) * 100);

    const handlerFilter = useCallback((option, term) => {
        setSelectedOption(option);
        setSearchTerm(term);
    }, []);

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <ToastContainer />

            <div className="container-payments">

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

                        <button className="btn-primary" onClick={() => setShowRM(true)}>
                            <span style={{ fontSize: 18, lineHeight: 1 }}></span> Registrar pago
                        </button>
                    </div>

                </div>
                <p style={{ color: "#888", marginTop: '0px', marginBottom: '0px' }}>{payment.client} &nbsp;·&nbsp; {payment.date} &nbsp;·&nbsp; {payment.salesperson}</p>

                <div style={{ margin: "0 auto", padding: "28px 0px", display: "flex", flexDirection: "column", gap: 20 }}>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                        <KpiCard label="Valor total" value={fmt(payment.total)} />
                        <KpiCard label="Valor pagado" value={fmt(payment.amountPaid)} />
                        <KpiCard label="Saldo pendiente" value={fmt(payment.balance)} accent progress={progress} />
                    </div>

                    {payment.note && (
                        <div style={{ background: "#fffdf0", border: "1px solid #f0e68c", borderLeft: "3px solid #c9a800", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>

                            <p style={{ fontSize: 13.5, color: "#555", lineHeight: 1.6 }}>{payment.note}</p>
                        </div>
                    )}


                    <div className="card">
                        <div style={{ borderBottom: "1.5px solid #f0ede8", padding: "0 8px", display: "flex", alignItems: "center" }}>
                            <button className="tab-btn active">Historial de pago</button>
                            <div style={{ flex: 1 }} />
                            <span style={{ fontSize: 12, color: "#bbb", paddingRight: 16 }}>
                                {payments.filter((p) => p.status !== "voided").length} Act · {payments.filter((p) => p.status === "voided").length} anulados
                            </span>
                        </div>

                        <div style={{ background: "#fdfcfa", marginTop: '-2rem', marginBottom: '1rem', marginLeft: '-1rem', marginRight: '-2rem' }}>
                            <SearchBar onFilter={handlerFilter} customSelectStyles={selectStyles} options={options_search_payment} placeholderText="Buscar Comprobantes" value={selectedOption} />
                            <div style={{ flex: 1 }} />

                            {/*
                             <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => window.print()}>
                                <span>/span> Imprimir
                            </button>
                            */}


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
                                {filtered.map((p) => {
                                    const isVoided = p.status === "voided";
                                    return (
                                        <tr key={p.id} className={isVoided ? "row-voided" : ""}>
                                            <td style={{ fontFamily: "monospace", fontSize: 13, color: "#888" }}>{p.id}</td>
                                            <td style={{ color: "#555" }}>{p.date}</td>
                                            <td>
                                                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>

                                                    <span>{METHOD_LABEL[p.method] ?? p.method}</span>
                                                </span>
                                            </td>
                                            <td style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
                                                {p.reference ?? "—"}
                                            </td>
                                            <td><strong style={{ fontSize: 15 }}>{fmt(p.amount)}</strong></td>
                                            <td>
                                                <div>
                                                    <span className="tag" style={{ background: PAYMENT_STATUS_STYLE[p.status]?.bg, color: PAYMENT_STATUS_STYLE[p.status]?.text }}>
                                                        {PAYMENT_STATUS_LABEL[p.status]}
                                                    </span>
                                                    {isVoided && p.voidReason && (
                                                        <p style={{ fontSize: 11, color: "#b71c1c", marginTop: 3 }}>
                                                            {p.voidedAt} · {p.voidedBy} · "{p.voidReason}"
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                    <button
                                                        className="btn-action"
                                                        disabled={isVoided}
                                                        onClick={() => showToast(`Receipt ${p.id} downloaded`)}
                                                    >
                                                        ⬇ Comprobante
                                                    </button>
                                                    <button
                                                        className="btn-action danger"
                                                        disabled={isVoided}
                                                        onClick={() => setVoidTarget(p)}
                                                    >
                                                        ✕ Anular
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: "center", color: "#ccc", padding: "34px 0" }}>
                                            {filter ? `No results for "${filter}"` : "No payments yet"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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

                {/* Toast */}
                {toast && <div className="toast">✓ {toast}</div>}
            </div>
        </div>

    );

}