import "../Modal.css";
import 'react-datepicker/dist/react-datepicker.css';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import DatePicker from 'react-datepicker';

const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";

export const WorkOrderInfoModal = ({ isOpen, workOrderData, onConfirm, onClose, isTaxFree,subtotalCalculated, ivaCalculated, totalCalculated, selectedDate, setSelectedDate }) => {

    if (!isOpen) return null;

    const formatSafe = (value) => {
        return (value || 0).toFixed(2);
    };

    return (
        <div className="filter-modal-overlay">
            <ToastContainer />
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
                            onChange={date => setSelectedDate(date)} 
                        />
                    </label>
                    <label>Placa del vehículo:
                        <span>{workOrderData.plate}</span>
                    </label>
                    <label>Tipo de comprobante:
                        <span>Nota de venta</span>
                    </label>
                    <label>SUBTOTAL SIN IVA :
                        <span>${formatSafe(subtotalCalculated)}</span>
                    </label>
                    <label>IVA ({isTaxFree ? '0%' : '15%'}):
                        <span>${formatSafe(isTaxFree ? 0 : ivaCalculated)}</span>
                    </label>

                    <label>VALOR TOTAL A PAGAR:
                        <span style={{ fontSize: "18px", fontWeight: "bold" }}>${formatSafe(totalCalculated)}</span>
                    </label>
                </div>

                <div className="button-options" style={{ justifyContent: 'center' }}>
                    <button className="accept-button-modal" onClick={onConfirm}>Aceptar</button>

                </div>
            </div>

        </div>
    );
};

