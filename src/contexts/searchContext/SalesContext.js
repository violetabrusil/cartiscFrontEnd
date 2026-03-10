import React, { createContext, useContext, useState } from "react";

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {

    const [orderCode, setOrderCode] = useState(null);
    const [vehiclePlate, setVehiclePlate] = useState(null);
    const [clientName, setClientName] = useState(null);
    const [clientId, setClientId] = useState(null);
    const [status, setStatus] = useState(null);
    const [paymentType, setPaymentType] = useState(null);
    const [invoiceType, setInvoiceType] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [filterData, setFilterData] = useState([]);

    const saveFormValues = (values) => {
        setOrderCode(values.orderCode);
        setVehiclePlate(values.vehiclePlate);
        setClientName(values.clientName);
        setClientId(values.clientId);
        setStatus(values.status);
        setPaymentType(values.paymentType);
        setInvoiceType(values.invoiceType);
        setStartDate(values.startDate);
        setEndDate(values.endDate);
    };

    const resetAllFilters = () => {
        setOrderCode('');
        setVehiclePlate('');
        setClientName('');
        setClientId('');
        setStatus('');
        setPaymentType('');
        setInvoiceType('');
        setStartDate('');
        setEndDate('');
        setFilterData([]);
    };

    return (
        <SalesContext.Provider
            value={{
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
                filterData,
                setFilterData,
                saveFormValues,
                resetAllFilters
            }}>
            {children}
        </SalesContext.Provider>
    )
};

export const useSales = () => useContext(SalesContext);
