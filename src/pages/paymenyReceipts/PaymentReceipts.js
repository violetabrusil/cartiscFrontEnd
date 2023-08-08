import "../../PaymentReceipts.css";
import React, { useState, useEffect } from "react";
import Select from 'react-select';
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import DataTable from "../../dataTable/DataTable";

const searchIcon = process.env.PUBLIC_URL + "/images/icons/searchIcon.png";
const downloadIcon = process.env.PUBLIC_URL + "/images/icons/downloadIcon.png";

const PaymentReceipts = () => {

    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const handleOptionsChange = (selectedOption) => {
        setSelectedOption(selectedOption);
    };

    const handleSearchInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    useEffect(() => {
        //Búsqueda de comprobantes de pago
        const delayTimer = setTimeout(() => {
            //Lógica para realizar la búsqueda
            console.log("Select option", selectedOption);
            console.log("Search term", searchTerm);
        }, 500); //Espera 500ms después de la última pulsación de tecla

        return () => clearTimeout(delayTimer); //Limpia el temporizador al desmontarse el componente
    }, [selectedOption, searchTerm]);

    const options = [
        { value: 'codigo', label: 'Código orden de trabajo' },
        { value: 'tipo de comprobante', label: 'Tipo de comprobante' },
        { value: 'forma de pago', label: 'Forma de pago' },
        { value: 'fecha', label: 'Fecha' },
        { value: 'total', label: 'Total' },
    ];

    const customStyles = {
        control: (base, state) => ({
            ...base,
            width: '550px',  // Aquí estableces el ancho
            height: '40px',  // Y aquí la altura
            minHeight: '40px', // Establece la altura mínima igual a la altura para evitar que cambie
            border: '1px solid rgb(0 0 0 / 34%)',
            borderRadius: '4px',
            padding: '1px',
            boxSizing: 'border-box'  // Asegura que el borde y el relleno estén incluidos en el tamaño
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: '#999', // Color del texto del placeholder
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-select-option-payment-receipts',
            // otros estilos personalizados si los necesitas
        }),
        menuPortal: base => ({ ...base, width: '41%', zIndex: 9999 }),

    };


    const data = React.useMemo(
        () => [
            {
                code: "0213",
                type: "Nota de venta",
                payment_type: "Efectivo",
                date: "08-08-2023",
                subtotal: "20.00",
                discount: "0",
                vat: "0%",
                total: "20.00"
            },
        ],
        []
    );

    const columns = React.useMemo(
        () => [
            { Header: "Código orden de trabajo", accessor: "code" },
            { Header: "Tipo de comprobante", accessor: "type" },
            { Header: "Forma de pago", accessor: "payment_type" },
            { Header: "Fecha", accessor: "date" },
            {
                Header: "Subtotal",
                accessor: "subtotal",
                Cell: ({ value }) => `$${value}` // Agrega un signo de dólar antes del valor
            },
            { Header: "Descuento", accessor: "discount" },
            { Header: "IVA", accessor: "vat" },
            {
                Header: "Total",
                accessor: "total",
                Cell: ({ value }) => `$${value}` // Agrega un signo de dólar antes del valor
            },
            {
                Header: "",
                Cell: ({ payment }) => (
                    <button className="button-download-payment-receipt" onClick={handleDownloadPaymentReceipt}>
                        <img src={downloadIcon} alt="Download Payment Receipt Icon" className="download-payment-receipt-icon" />
                    </button>
                ),
                id: 'download-payment-receipt-button'
            }
        ],
        []
    );

    const handleDownloadPaymentReceipt = (row) => {
        console.log("Descargar archivo: ", row);
        // Aquí puedes manejar la lógica para descargar el archivo en pdf
    };

    return (

        <div>

            <Header showIcon={true} showPhoto={true} showUser="Name User" showRol="Rol" />
            <Menu />

            <div className="container-payment-receipts">
                <div className="container-title-payment-receipts">
                    <h2>Comprobantes de pagos</h2>
                </div>

                <div className="search-bar-container-payment-receipts">
                    <Select
                        options={options}
                        value={selectedOption}
                        onChange={handleOptionsChange}
                        styles={customStyles}
                        placeholder="Seleccionar"
                        menuPortalTarget={document.body}
                    />

                    <div className="search-payments-receipts-box">
                        <img src={searchIcon} alt="Search Payment Receipts Icon" className="search-payments-receipts-icon" />
                        <input
                            type="text"
                            className="input-search-payments-receipts"
                            onChange={handleSearchInputChange}
                            placeholder="Buscar comprobantes de pago"
                        />

                    </div>

                </div>

                <DataTable data={data} columns={columns} />
            </div>


        </div>
    )
};

export default PaymentReceipts;
