import "../Modal.css";

import React from 'react';
import { workOrderStatus } from "../constants/workOrderConstants";

const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const clockIcon = process.env.PUBLIC_URL + "/images/icons/clockIcon.png";

export function ModalHistoryWorkOrder({ isOpen, onClose, orderHistory, workOrderCode }) {

    const sortedOrderHistory = orderHistory.sort((a, b) => new Date(b.date_changed) - new Date(a.date_changed));

    const statusColors = {
        "Por iniciar": "#316EA8",
        "Asignada": "#0C1F31",
        "En ejecución": "#4caf50",
        "En espera": "#fbc02d",
        "Cancelada": "#e74c3c",
        "Completada": "#2e7d32",
        "Eliminada": "#6E757D"
    };

    return (

        <div className='filter-modal-overlay'>
            <div style={{ maxWidth: '570px' }} className="modal-payment">
                <div className="title-modal-hitory">
                    <img style={{ marginTop: '13px' }} src={clockIcon} alt="Clock Icon" className="clock-icon" />
                    <h4>Información del estado de la Orden de Trabajo</h4>
                    <label className="label-history-work-order">{workOrderCode}</label>
                    <div style={{ flex: "1", marginTop: '18px' }}>
                        <button className="button-close" onClick={onClose}  >
                            <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                        </button>
                    </div>
                </div>

                <div className="div-container-history">
                    {sortedOrderHistory.map((entry, index) => (
                        <div
                            className={`entry ${entry.isCompleted ? "entry-completed" : "entry-pending"} entry-color`}
                            key={index}
                            style={{ "--entry-color": statusColors[workOrderStatus[entry.work_order_status] || entry.work_order_status] }}
                        >
                            <div
                                style={{
                                    marginTop: '8px',
                                    fontWeight: '600',
                                    color: statusColors[workOrderStatus[entry.work_order_status] || entry.work_order_status]
                                }}>
                                {workOrderStatus[entry.work_order_status] || entry.work_order_status}
                            </div>
                            <div>{new Date(entry.date_changed).toLocaleDateString()} {new Date(entry.date_changed).toLocaleTimeString()} - {entry.created_by}</div>
                            <div>{entry.notes}</div>
                        </div>
                    ))}
                </div>

            </div>
        </div>

    )
};

export default ModalHistoryWorkOrder;
