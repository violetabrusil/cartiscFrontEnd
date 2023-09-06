import "../Modal.css";

import React from 'react';
import { workOrderStatus } from "../constants/workOrderConstants";

const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const clockIcon = process.env.PUBLIC_URL + "/images/icons/clockIcon.png";

export function ModalHistoryWorkOrder({ isOpen, onClose, orderHistory, workOrderCode }) {

    const sortedOrderHistory = orderHistory.sort((a, b) => new Date(b.date_changed) - new Date(a.date_changed));

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
                    {sortedOrderHistory.map(entry => (
                        <div className={entry.isCompleted ? "entry entry-completed" : "entry entry-pending"} key={entry.id}>
                            <div>{new Date(entry.date_changed).toLocaleDateString()} - {entry.created_by}</div>
                            <div style={{marginTop: '8px', fontWeight: '600'}}>{workOrderStatus[entry.work_order_status] || entry.work_order_status}</div>
                            <div style={{marginTop: '8px'}}>{entry.notes}</div>
                        </div>
                    ))}
                </div>








            </div>
        </div>

    )
};

export default ModalHistoryWorkOrder;
