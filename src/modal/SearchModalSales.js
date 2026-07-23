import "../Modal.css";
import "react-datepicker/dist/react-datepicker.css";
import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { useSales } from "../contexts/searchContext/SalesContext";
import { useSearchParams } from "react-router-dom";


const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";

export function SearchModalSales({ isOpen, onClose, onConfirm, mode }) {

    const [searchParams, setSearchParams] = useSearchParams();
    const { resetAllFilters } = useSales();

    const {
        orderCode,
        setOrderCode,
        vehiclePlate,
        setVehiclePlate,
        clientName,
        setClientName,
        clientId,
        setClientId,
        workOrder,
        setWorkOrder,
        status,
        setStatus,
        saleType,
        setSaleType,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        saveFormValues
    } = useSales();

    const selectPaymentStyles = {
        control: (provided, state) => ({
            ...provided,
            width: '100%',
            height: '40px',
            minHeight: '40px',
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

    const salesStatus = [
        { value: 'receivable', label: 'Por cobrar' },
        { value: 'charged', label: 'Cobrada' },
        { value: 'cancelled', label: 'Cancelada' },
    ];

    const saleTypeOptions = [
        { value: 'pro_forma', label: 'Proforma' },
        { value: 'sales_note', label: 'Nota de venta' }
    ];

    useEffect(() => {
        if (isOpen) {
            const params = Object.fromEntries([...searchParams]);

            if (params.order_number) setOrderCode(params.order_number);
            if (params.vehicle_plate) setVehiclePlate(params.vehicle_plate);
            if (params.client_name) setClientName(params.client_name);
            if (params.client_cedula) setClientId(params.client_cedula);
            if (params.work_order_code) setWorkOrder(params.work_order_code);
            if (params.sales_receipt_status) setStatus(params.sales_receipt_status);
            if (params.sale_type) setSaleType(params.sale_type);
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
            order_number: orderCode,
            vehicle_plate: vehiclePlate,
            client_name: clientName,
            client_cedula: clientId,
            work_order_code: workOrder,
            sales_receipt_status: status,
            sale_type: saleType,
            date_start_of_search: startDate,
            date_finish_of_search: endDate,
        });
    };

    const handleClearForm = () => {
        setOrderCode('');
        setVehiclePlate('');
        setClientName('');
        setClientId('');
        setWorkOrder('');
        setStatus(null);
        setSaleType(null);
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
            workOrder,
            status,
            saleType,
            startDate,
            endDate
        });
    }, [orderCode, vehiclePlate, clientName, clientId, workOrder,status, saleType, startDate, endDate, saveFormValues]);


    if (!isOpen) return null;

    return (

        <div className='filter-modal-overlay'>
            <div className="modal-payment">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h2 style={{fontSize: '18px'}}>Filtros de búsqueda</h2>
                    <button onClick={handleClearForm} className="clean-button">Limpiar campos</button>
                    <div style={{ flex: "1" }}>
                        <button className="button-close" onClick={onClose}  >
                            <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                        </button>
                    </div>

                </div>

                <div className="double-input-group">
                    <div>
                        <label style={{ display: 'block' }} className="label-fields-payment">Código de venta</label>
                        <input className="input-fields-payment" onChange={e => setOrderCode(e.target.value)} value={orderCode || ''} />
                    </div>
                    <div>
                        <label style={{ display: 'block' }} className="label-fields-payment">Placa vehículo</label>
                        <input className="input-fields-payment" onChange={e => setVehiclePlate(e.target.value)} value={vehiclePlate || ''} />
                    </div>
                </div>

                <div className="double-input-group">
                    <div>
                        <label style={{ display: 'block' }} className="label-fields-payment">Código orden de trabajo</label>
                        <input className="input-fields-payment" onChange={e => setWorkOrder(e.target.value)} value={workOrder || ''} />
                    </div>
                    {mode !== "receivable" && (
                        <div>
                            <label className="label-fields-payment">Estado</label>
                            <Select
                                isSearchable={false}
                                styles={selectPaymentStyles}
                                options={salesStatus}
                                value={salesStatus.find(option => option.value === status) || null}
                                onChange={selectedOption => setStatus(selectedOption.value)}
                                placeholder="Seleccione"
                            />
                        </div>
                    )}
                </div>

                <div className="double-input-group">
                    <div>
                        <label className="label-fields-payment">Nombre cliente</label>
                        <input className="input-fields-payment" onChange={e => setClientName(e.target.value)} value={clientName || ''} />
                    </div>
                    <div>
                        <label className="label-fields-payment">Cédula</label>
                        <input className="input-fields-payment" onChange={e => setClientId(e.target.value)} value={clientId || ''} />
                    </div>

                </div>

                {/* <div className="input-group-payment">
                    <label className="label-fields-payment">Tipo de comprobante</label>
                    <Select
                        isSearchable={false}
                        styles={selectPaymentStyles}
                        options={saleTypeOptions}
                        value={saleTypeOptions.find(option => option.value === saleType) || null}
                        onChange={selectedOption => setSaleType(selectedOption.value)}
                        placeholder="Seleccione"
                    />
                </div> */}

                <div className="date-container-payment">
                    <div style={{ display: "grid" }}>
                        <label className="label-fields-payment">Fecha de inicio</label>
                        <DatePicker
                            className="input-date-payment"
                            wrapperClassName="date-picker-wrapper-payment"
                            selected={startDate}
                            onChange={date => setStartDate(date)}
                            placeholderText="Seleccione" />
                    </div>
                    <div style={{ display: "grid" }}>
                        <label className="label-fields-payment">Fecha fin</label>
                        <DatePicker
                            className="input-date-payment"
                            wrapperClassName="date-picker-wrapper-payment"
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
