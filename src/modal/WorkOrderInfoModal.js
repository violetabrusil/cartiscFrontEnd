import "../Modal.css";
import 'react-datepicker/dist/react-datepicker.css';
import { useEffect } from 'react';
import DatePicker from 'react-datepicker';

const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";

export const WorkOrderInfoModal = ({ isOpen, workOrderData, onConfirm, onClose, discount, setDiscount, total, setTotal, vat, setVat, selectedDate, setSelectedDate }) => {

    useEffect(() => {
        const subtotal = parseFloat(workOrderData.subtotal);
        const calculatedTotal = subtotal + (subtotal * vat) - (subtotal * (discount / 100));
        setTotal(calculatedTotal);
    }, [workOrderData, discount, vat]);

    if (!isOpen) return null;

    const handleDiscountChange = (event) => {
        const value = parseFloat(event.target.value);
        if (value >= 0 && value <= 100) {
            setDiscount(value);
        }
    };

    return (
        <div className="filter-modal-overlay">
          
            <div className="filter-modal">
                <div style={{ display: 'flex' }}>
                    <h3 style={{ flex: '13', textAlign: 'center' }}>Resumen de pago</h3>
                    <div style={{ flex: "1", marginTop: '13px' }}>
                        <button className="button-close" onClick={onClose}  >
                            <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                        </button>
                    </div>
                </div>

                <div className="container-label">
                    <label>Código de la orden de trabajo:
                        <span>{workOrderData.workOrderCode}</span>
                    </label>
                    <label>Nombre de cliente:
                        <span>{workOrderData.clientName}</span>
                    </label>
                    <label>Fecha:
                        <DatePicker
                            className="selectedDate-input"
                            selected={selectedDate}
                            onChange={date => setSelectedDate(date)} // Actualiza el estado cuando se selecciona una fecha
                        />
                    </label>
                    <label>Placa del vehículo:
                        <span>{workOrderData.plate}</span>
                    </label>
                    <label>Tipo de comprobante:
                        <span>Nota de venta</span>
                    </label>
                    <label>Subtotal:
                        <span>{workOrderData.subtotal}</span>
                    </label>
                    <label>IVA:
                        <span>{vat * 100}%</span>
                    </label>
                    <div>
                        <label htmlFor="discount-input">Descuento (%): </label>
                        <input
                            type="number"
                            id="discount-input"
                            min="0"
                            max="100"
                            step="1"
                            value={discount}
                            onChange={handleDiscountChange}
                        />
                    </div>
                    <label>Total:
                        <span>{total.toFixed(2)}</span>
                    </label>
                </div>

                <div className="button-options" style={{ justifyContent: 'center' }}>
                    <button className="accept-button-modal" onClick={onConfirm}>Aceptar</button>

                </div>
            </div>

        </div>
    );
};

