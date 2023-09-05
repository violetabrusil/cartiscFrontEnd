import "../../PaymentReceipts.css";
import "../../Modal.css"
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import DataTable from "../../dataTable/DataTable";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import apiClient from "../../services/apiClient";
import { SearchModalPayment } from "../../modal/SearchModalPayment";
import { invoiceTypeMaping } from "../../constants/invoiceTypeConstants";
import { paymentTypeMaping } from "../../constants/paymentTypeConstants";
import { paymentStatusMaping } from "../../constants/paymentReceiptsStatusConstants";


const filterIcon = process.env.PUBLIC_URL + "/images/icons/filterIcon.png";
const pdfIcon = process.env.PUBLIC_URL + "/images/icons/pdfIcon.png";
const emailIcon = process.env.PUBLIC_URL + "/images/icons/emailIcon.png";

const PaymentReceipts = () => {

    const [paymentReceipts, setPaymentReceipts] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);

    const columns = React.useMemo(
        () => [
            { Header: "Código orden de trabajo", accessor: "work_order.work_order_code" },
            { Header: "Tipo de comprobante", accessor: "invoice_type" },
            { Header: "Cliente", accessor: "name"},
            { Header: "Placa", accessor: "plate"},
            { Header: "Forma de pago", accessor: "payment_type" },
            { Header: "Fecha", accessor: "created_at" },
            {
                Header: "Subtotal",
                accessor: "subtotal",
                Cell: ({ value }) => `$ ${value}` // Agrega un signo de dólar antes del valor
            },
            { Header: "Descuento", accessor: "discount" },
            { Header: "IVA", accessor: "vat" },
            {
                Header: "Total",
                accessor: "total",
                Cell: ({ value }) => `$${value}` // Agrega un signo de dólar antes del valor
            },
            {
                Header: "Estado",
                accessor: "sales_receipt_status"
            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const payment = row.original;
                    return (
                        <button className="button-download-payment-receipt" onClick={() => downloadPDF(payment.id)}>
                            <img src={pdfIcon} alt="Download Payment Receipt Icon" className="download-payment-receipt-icon" />
                        </button>
                    );
                },
                id: 'download-payment-receipt-button'
            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const payment = row.original;
                    return (
                        <button className="button-email" onClick={() => sendEmail(payment.id)}>
                            <img src={emailIcon} alt="Email Icon" className="email-icon" />
                        </button>
                    );
                },
                id: 'email-button'
            }
        ],
        []
    );

    function formatDate(isoDate) {
        const date = new Date(isoDate);
        const day = String(date.getUTCDate()).padStart(2, '0');  // Usamos getUTCDate en lugar de getDate
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Usamos getUTCMonth en lugar de getMonth
        const year = date.getUTCFullYear();  // Usamos getUTCFullYear en lugar de getFullYear

        return `${day}/${month}/${year}`;
    };

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleConfirm = async (data) => {
        try {
            const response = await apiClient.post('/sales-receipts/search', data);
            console.log(response.data);
    
            // Si response.data es null o undefined, cierra el modal y retorna.
            if (!response.data) {
                setModalOpen(false);
                return;
            }
    
            const transformedPaymentReceipts = response.data.map(payment => {
                const newDateStart = formatDate(payment.created_at);
                const translatedInvoiceType = invoiceTypeMaping[payment.invoice_type] || payment.invoice_type;
                const translatedPaymentType = paymentTypeMaping[payment.payment_type] || payment.payment_type;
                return {
                    ...payment,
                    created_at: newDateStart,
                    invoice_type: translatedInvoiceType,
                    payment_type: translatedPaymentType
                };
            })
    
            setPaymentReceipts(transformedPaymentReceipts);
            setModalOpen(false)
    
        } catch (error) {
            console.log("Ha ocurrido un error", error);
        }
    };
    
    //Función que permite obtener todos los recibos de pago
    //cuando inicia la pantalla y las busca por
    //por número de serie, categoría o título
    const fetchData = async () => {

        try {
            const response = await apiClient.get('/sales-receipts/all');
            const transformedPaymentReceipts = response.data.map(payment => {
                const newDateStart = formatDate(payment.created_at);
                const translatedInvoiceType = invoiceTypeMaping[payment.invoice_type] || payment.invoice_type;
                const translatedPaymentType = paymentTypeMaping[payment.payment_type] || payment.payment_type;
                const translatedPaymentStatus = paymentStatusMaping[payment.sales_receipt_status] || payment.sales_receipt_status;
              
                return {
                    ...payment,
                    created_at: newDateStart,
                    invoice_type: translatedInvoiceType,
                    payment_type: translatedPaymentType,
                    sales_receipt_status: translatedPaymentStatus
                };
            });
            setPaymentReceipts(transformedPaymentReceipts);
            console.log("data recibida", response.data)

        } catch (error) {
            console.log("Error al obtener los recibos", error)

        }


    };

    const downloadPDF = async (paymentId) => {
        try {
            const response = await apiClient.get(`/sales-receipts/generate-pdf/${paymentId}`);

            // Crear un enlace virtual en memoria para simular un enlace de descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'file.pdf'); // El nombre que quieras para el archivo descargado
            document.body.appendChild(link);
            link.click();

            // Limpieza: quitar el enlace cuando haya terminado
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error descargando el archivo', error);
        }
    };

    const sendEmail = async (paymentId) => {
        try {
            const response = await apiClient.get(`/sales-receipts/send-email/${paymentId}`);
            if ( response.status === 200) {
                toast.success('Email enviado', {
                    position: toast.POSITION.TOP_RIGHT
                });
            } else {
                toast.error('Error al enviar el email', {
                    position: toast.POSITION.TOP_RIGHT
                });

            }

       
        } catch (error) {
            console.error('Error al enviar el email', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (

        <div>

            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <ToastContainer />

            <div className="container-payment-receipts">

                <div style={{display: 'flex'}}>
                    <CustomTitleSection
                        title="Comprobantes de pagos" />

                    <button className="button-payments-filter" onClick={handleOpenModal}>
                        <img src={filterIcon} alt="Filter Icon" className="filter-icon" />
                        <span className="button-payment-text-filter">Filtro</span>
                    </button>
                </div>

                <DataTable
                    data={paymentReceipts}
                    columns={columns}
                    highlightRows={false}
                />
            </div>

            {isModalOpen && (
                <SearchModalPayment
                    isOpen={handleOpenModal}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirm}
                />
            )}


        </div>
    )
};

export default PaymentReceipts;
