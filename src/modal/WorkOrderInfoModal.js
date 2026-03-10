import "../Modal.css";
import 'react-datepicker/dist/react-datepicker.css';
import { useState } from 'react';
import { ToastContainer } from 'react-toastify';

const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const carIconGray = process.env.PUBLIC_URL + "/images/icons/carIcon-gray.png";
const userIconGray = process.env.PUBLIC_URL + "/images/icons/userIcon-gray.png";
const calendarIcon = process.env.PUBLIC_URL + "/images/icons/calendarIcon.png";
const receiptIcon = process.env.PUBLIC_URL + "/images/icons/receipt.png";
const paymentIcon = process.env.PUBLIC_URL + "/images/icons/paymentIcon-gray.png";
const editIcon = process.env.PUBLIC_URL + "/images/icons/editIcon.png";
const checkIcon = process.env.PUBLIC_URL + "/images/icons/checkIcon.png";

const SimpleDatePicker = ({ selected, onChange }) => {
    const fmt = (d) =>
        d ? `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}` : "";
    return (
        <input
            type="date"
            value={selected ? selected.toISOString().split("T")[0] : ""}
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value + "T12:00:00") : null)}
            style={{
                border: "none", background: "transparent",
                fontSize: "14px", fontFamily: "inherit",
                color: "#1a1a2e", fontWeight: 600, cursor: "pointer",
                outline: "none", padding: 0,
            }}
        />
    );
};

export const WorkOrderInfoModal = ({ isOpen, workOrderData, onConfirm, onClose, isTaxFree, subtotalCalculated, ivaCalculated, totalCalculated, selectedDate, setSelectedDate }) => {

    const [note, setNote] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [registerPayment, setRegisterPayment] = useState(false);

    if (!isOpen) return null;

    const fmt = (v) => (v || 0).toFixed(2);

    const handleConfirm = () => {
        setConfirmed(true);
        setTimeout(() => {
            setConfirmed(false);
            onConfirm({ note: note.trim() || null, registerPayment });
        }, 900);
    };

    return (

        <div className="wo-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <ToastContainer />
            <div className="wo-modal">

                <div className="wo-header">
                    <div className="wo-header-left">
                        <span className="wo-badge">
                            <span className="wo-badge-dot" />
                            Resumen de venta
                        </span>
                        <h2 className="wo-title">Orden de Trabajo</h2>
                        <span className="wo-code">{workOrderData.workOrderCode}</span>
                    </div>
                    <button className="wo-close" onClick={onClose}  >
                        <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                    </button>
                </div>

                <div className="wo-body">
                    <div className="wo-grid">
                        <div className="wo-field">
                            <span className="wo-field-label">
                                <img src={userIconGray} alt="User Icon" className="wo-icons"></img>
                                Cliente
                            </span>
                            <span className="wo-field-value">{workOrderData.clientName}</span>
                        </div>
                        <div className="wo-field">
                            <span className="wo-field-label">
                                <img src={carIconGray} alt="Plate Icon" className="wo-icons"></img>
                                Placa
                            </span>
                            <span className="wo-field-value-plate">{workOrderData.plate}</span>
                        </div>
                        <div className="wo-field">
                            <span className="wo-field-label">
                                <img src={calendarIcon} alt="Calendar Icon" className="wo-icons"></img>
                                Fecha
                            </span>
                            <div className="wo-field-value">
                                <SimpleDatePicker selected={selectedDate} onChange={setSelectedDate} />
                            </div>
                        </div>
                        <div className="wo-field">
                            <span className="wo-field-label">
                                <img src={paymentIcon} alt="Payment Icon" className="wo-icons"></img>
                                Comprobante
                            </span>
                            <span className="wo-field-value">Nota de venta</span>
                        </div>


                    </div>

                    <div className="wo-divider" />

                    <div className="wo-totals">
                        <div className="wo-total-row">
                            <span className="wo-total-label">Subtotal sin IVA</span>
                            <span className="wo-total-value">${fmt(subtotalCalculated)}</span>
                        </div>
                        <div className="wo-total-row tax">
                            <span className="wo-total-label">
                                IVA
                                <span className="wo-tax-pill" style={{ background: isTaxFree ? '#dcfce7' : '#fef3c7', color: isTaxFree ? '#16a34a' : '#b45309' }}>{isTaxFree ? "EXENTO" : "15%"}</span>
                            </span>
                            <span className="wo-total-value">${fmt(isTaxFree ? 0 : ivaCalculated)}</span>
                        </div>
                        <div className="wo-total-row grand">
                            <span className="wo-total-label">Total a pagar</span>
                            <span className="wo-grand-amount">
                                <span className="wo-grand-currency">$</span>{fmt(totalCalculated)}
                            </span>
                        </div>
                    </div>

                    <div className="wo-divider" />

                    <div style={{ paddingBottom: "4px" }}>
                        <div className="wo-note-header" style={{ marginBottom: 8 }}>
                            <span className="wo-note-label">
                                Nota Informativa de pago
                                <img src={editIcon} alt="Note Icon" className="wo-icons"></img>
                                <span className="wo-optional">— Opcional</span>
                            </span>
                        </div>
                        <textarea
                            className="wo-textarea"
                            placeholder="Ej: El cliente pagará en dos cuotas. Preferentemente por transferencia bancaria."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            maxLength={300}
                            rows={3}
                        />
                        <p className="wo-char-count">{note.length} / 300</p>
                    </div>

                    <div style={{ padding: "0 0 12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                            type="checkbox"
                            id="register-payment"
                            checked={registerPayment}
                            onChange={(e) => setRegisterPayment(e.target.checked)}
                            style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#0f3460" }}
                        />
                        <label htmlFor="register-payment" style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a2e", cursor: "pointer" }}>
                            Registrar pago ahora
                        </label>
                    </div>
                    
                </div>



                <div className="wo-footer">

                    <button className="wo-btn-cancel" onClick={onClose}>Cancelar</button>
                    <button
                        className={`wo-btn-confirm ${confirmed ? "confirmed" : ""}`}
                        onClick={handleConfirm}
                    >
                        <span className="wo-confirm-icon">
                            {confirmed
                                ? <img src={checkIcon} alt="Check Icon" className="wo-icon" />
                                : <img src={receiptIcon} alt="Payment Icon" className="wo-icon" />}
                        </span>
                        {confirmed ? "¡Generado!" : registerPayment ? "Generar venta y registrar pago" : "Generar venta"}
                    </button>
                </div>

            </div>

        </div>


    );
};

