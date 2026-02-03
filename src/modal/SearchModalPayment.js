import "../Modal.css";
import "react-datepicker/dist/react-datepicker.css";
import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { usePaymentReceipt } from "../contexts/searchContext/PaymentReceiptContext";
import { useSearchParams } from "react-router-dom";


const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";

export function SearchModalPayment({ isOpen, onClose, onConfirm }) {

    const [searchParams, setSearchParams] = useSearchParams();
    const { resetAllFilters } = usePaymentReceipt();

    const {
        orderCode,
        setOrderCode,
        vehiclePlate,
        setVehiclePlate,
        clientName,
        setClientName,
        clientId,
        setClientId,
        status,
        setStatus,
        paymentType,
        setPaymentType,
        invoiceType,
        setInvoiceType,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        saveFormValues
    } = usePaymentReceipt();

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
        { value: 'pro_forma', label: 'Proforma' },
        { value: 'sales_note', label: 'Nota de venta' }
    ];

    useEffect(() => {
        if (isOpen) {
            const params = Object.fromEntries([...searchParams]);

            if (params.work_order_code) setOrderCode(params.work_order_code);
            if (params.vehicle_plate) setVehiclePlate(params.vehicle_plate);
            if (params.client_name) setClientName(params.client_name);
            if (params.client_cedula) setClientId(params.client_cedula);
            if (params.sales_receipt_status) setStatus(params.sales_receipt_status);
            if (params.payment_type) setPaymentType(params.payment_type);
            if (params.invoice_type) setInvoiceType(params.invoice_type);
            if (params.date_start_of_search) {
                const date = new Date(params.date_start_of_search);
                if (!isNaN(date)) setStartDate(date);
            }
            if (params.date_finish_of_search) {
                const date = new Date(params.date_finish_of_search);
                if (!isNaN(date)) setEndDate(date);
            }
        }
    }, [isOpen, searchParams]);

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

    const handleClearForm = () => {
        setOrderCode('');
        setVehiclePlate('');
        setClientName('');
        setClientId('');
        setStatus(null);
        setPaymentType(null);
        setInvoiceType(null);
        setStartDate('');
        setEndDate('');
        resetAllFilters();
        setSearchParams({});
    };

    useEffect(() => {
        saveFormValues({
            orderCode,
            vehiclePlate,
            clientName,
            clientId,
            status,
            paymentType,
            invoiceType,
            startDate,
            endDate
        });
    }, [orderCode, vehiclePlate, clientName, clientId, status, paymentType, invoiceType, startDate, endDate, saveFormValues]);


    if (!isOpen) return null;

    return (

        <div className='filter-modal-overlay'>
            <div className="modal-payment">
                <div style={{ display: 'flex' }}>
                    <h2>Filtros de búsqueda</h2>
                    <button onClick={handleClearForm} className="clean-button">Limpiar campos</button>
                    <div style={{ flex: "1", marginTop: '18px' }}>
                        <button className="button-close" onClick={onClose}  >
                            <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                        </button>
                    </div>

                </div>

                <div className="double-input-group">
                    <div>
                        <label style={{ display: 'block' }} className="label-fields-payment">Código orden de trabajo</label>
                        <input className="input-fields-payment" onChange={e => setOrderCode(e.target.value)} value={orderCode || ''} />
                    </div>
                    <div>
                        <label style={{ display: 'block' }} className="label-fields-payment">Placa vehículo</label>
                        <input style={{ width: '91%' }} className="input-fields-payment" onChange={e => setVehiclePlate(e.target.value)} value={vehiclePlate || ''} />
                    </div>
                </div>

                <div className="double-input-group">
                    <div>
                        <label className="label-fields-payment">Nombre cliente</label>
                        <input style={{ width: '92%' }} className="input-fields-payment" onChange={e => setClientName(e.target.value)} value={clientName || ''} />
                    </div>
                    <div style={{ marginRight: '28px' }}>
                        <label className="label-fields-payment">Cédula</label>
                        <input style={{ width: '107%' }} className="input-fields-payment" onChange={e => setClientId(e.target.value)} value={clientId || ''} />
                    </div>

                </div>

                <div className="input-group-payment">
                    <label className="label-fields-payment">Estado</label>
                    <Select
                        isSearchable={false}
                        styles={selectPaymentStyles}
                        options={paymentStatus}
                        value={paymentStatus.find(option => option.value === status) || null}
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
                        value={paymentTypeOptions.find(option => option.value === paymentType) || null}
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
                        value={invoiceTypeOptions.find(option => option.value === invoiceType) || null}
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
                <div style={{ textAlign: "center" }}>
                    <button onClick={handleConfirm} className="modal-button">Confirmar</button>

                </div>

            </div>
        </div>

    )
};
