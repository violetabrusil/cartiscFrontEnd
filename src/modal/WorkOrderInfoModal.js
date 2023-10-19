import "../Modal.css";
import { useEffect } from 'react';

export const WorkOrderInfoModal = ({ isOpen, workOrderData, onConfirm, discount, setDiscount, total, setTotal, vat, setVat }) => {

    console.log("workorderdata", workOrderData);

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
                <h3 style={{ textAlign: 'center', marginTop: '3px' }}>Resumen de pago</h3>
                <div className="container-label">
                    <label>Código de la orden de trabajo:
                        <span>{workOrderData.workOrderCode}</span>
                    </label>
                    <label>Nombre de cliente:
                        <span>{workOrderData.clientName}</span>
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

