import "../Modal.css";
import "react-datepicker/dist/react-datepicker.css";
import React, { useState } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';

const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";

export function SearchModalPayment({ isOpen, onClose, onConfirm }) {

    const [orderCode, setOrderCode] = useState(null);
    const [vehiclePlate, setVehiclePlate] = useState(null);
    const [clientName, setClientName] = useState(null);
    const [clientId, setClientId] = useState(null);
    const [status, setStatus] = useState(null);
    const [paymentType, setPaymentType] = useState(null);
    const [invoiceType, setInvoiceType] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const selectPaymentStyles = {
        control: (provided, state) => ({
            ...provided,
            width: '410px',
            height: '45px',
            minHeight: '45px',
            marginTop: '10px',
            marginBottom: '10px',
            border: '1px solid rgb(0 0 0 / 34%)'
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: 'rgb(0 0 0 / 34%)',
            fontWeight: '600',
        }),
    };

    const paymentStatus = [
        { value: 'receivable', label: 'Por cobrar' },
        { value: 'charged', label: 'Cobrado' },
    ];

    const paymentTypeOptions = [
        { value: 'pending', label: 'Pendiente' },
        { value: 'cash', label: 'Efectivo' },
        { value: 'electronic_money', label: 'Transferencia' },
        { value: 'debit_credit_card', label: 'Tarjeta de crédito' },
        { value: 'other', label: 'Otro' },
    ];

    const invoiceTypeOptions = [
        { value: 'pro_forma', label: 'Proforma'},
        { value: 'sales_note', label: 'Nota de venta'}
    ];

    const handleConfirm = () => {
      
        onConfirm({
            work_order_code: orderCode,
            vehicle_plate: vehiclePlate,
            client_name: clientName,
            client_cedula: clientId,
            sales_receipt_status: status,
            payment_type: paymentType,
            invoice_type: invoiceType,
            date_start_of_search: startDate,
            date_finish_of_search: endDate,
            //start_total_amount
            //end_total_amount
        });
    };  

    if (!isOpen) return null;

    return (

        <div className='filter-modal-overlay'>
            <div className="modal-payment">
                <div style={{ display: 'flex' }}>
                    <h2>Filtros de búsqueda</h2>
                    <div style={{ flex: "1", marginTop: '18px' }}>
                        <button className="button-close" onClick={onClose}  >
                            <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                        </button>
                    </div>

                </div>

                <div className="double-input-group">
                    <div>
                        <label style={{ display: 'block' }} className="label-fields-payment">Código orden de trabajo</label>
                        <input className="input-fields-payment" onChange={e => setOrderCode(e.target.value)} />
                    </div>
                    <div>
                        <label style={{ display: 'block' }} className="label-fields-payment">Placa vehículo</label>
                        <input style={{width: '91%'}} className="input-fields-payment" onChange={e => setVehiclePlate(e.target.value)} />
                    </div>
                </div>

                <div className="double-input-group">
                    <div>
                        <label className="label-fields-payment">Nombre cliente</label>
                        <input style={{width: '92%'}} className="input-fields-payment" onChange={e => setClientName(e.target.value)} />
                    </div>
                    <div style={{marginRight: '28px'}}>
                        <label className="label-fields-payment">Cédula</label>
                        <input style={{width: '107%'}} className="input-fields-payment" onChange={e => setClientId(e.target.value)} />
                    </div>

                </div>

                <div className="input-group-payment">
                    <label className="label-fields-payment">Estado</label>
                    <Select
                        isSearchable={false}
                        styles={selectPaymentStyles}
                        options={paymentStatus}
                        onChange={selectedOption => setStatus(selectedOption.value)}
                        placeholder="Seleccione"
                    />
                </div>
                <div className="input-group-payment">
                    <label className="label-fields-payment">Tipo de pago</label>
                    <Select
                        isSearchable={false}
                        styles={selectPaymentStyles}
                        options={paymentTypeOptions}
                        onChange={selectedOption => setPaymentType(selectedOption.value)}
                        placeholder="Seleccione"
                    />
                </div>
                <div className="input-group-payment">
                    <label className="label-fields-payment">Tipo de comprobante</label>
                    <Select
                        isSearchable={false}
                        styles={selectPaymentStyles}
                        options={invoiceTypeOptions}
                        onChange={selectedOption => setInvoiceType(selectedOption.value)}
                        placeholder="Seleccione"
                    />
                </div>

                <div className="date-container-payment">
                    <div style={{ display: "grid" }}>
                        <label className="label-fields-payment">Fecha de inicio</label>
                        <DatePicker
                            className="input-date-payment"
                            selected={startDate}
                            onChange={date => setStartDate(date)}
                            placeholderText="Seleccione" />
                    </div>
                    <div style={{ display: "grid" }}>
                        <label className="label-fields-payment">Fecha fin</label>
                        <DatePicker
                            className="input-date-payment"
                            selected={endDate}
                            onChange={date => setEndDate(date)}
                            placeholderText="Seleccione " />
                    </div>
                </div>
                <div style={{textAlign: "center"}}>
                    <button onClick={handleConfirm} className="modal-button">Confirmar</button>

                </div>

            </div>
        </div>

    )
};
