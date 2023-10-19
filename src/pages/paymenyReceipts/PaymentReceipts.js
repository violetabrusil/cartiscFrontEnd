import "../../PaymentReceipts.css";
import "../../Modal.css"
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import DataTable from "../../dataTable/DataTable";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import apiClient from "../../services/apiClient";
import { SearchModalPayment } from "../../modal/SearchModalPayment";
import { invoiceTypeMaping } from "../../constants/invoiceTypeConstants";
import { paymentTypeMaping } from "../../constants/paymentTypeConstants";
import { paymentStatusMaping } from "../../constants/paymentReceiptsStatusConstants";
import { WorkOrderInfoModal } from "../../modal/WorkOrderInfoModal";

const filterIcon = process.env.PUBLIC_URL + "/images/icons/filterIcon.png";
const pdfIcon = process.env.PUBLIC_URL + "/images/icons/pdfIcon.png";
const emailIcon = process.env.PUBLIC_URL + "/images/icons/emailIcon.png";
const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";

const PaymentReceipts = () => {

    const [paymentReceipts, setPaymentReceipts] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isWorkOrderModalOpen, setWorkOrderModalOpen] = useState(false);
    const [workOrderData, setWorkOrderData] = useState(null);
    const [discount, setDiscount] = useState(1);
    const [total, setTotal] = useState(0);
    const [vat, setVat] = useState(0);
    const [lastAddedReceiptId, setLastAddedReceiptId] = useState(null);
    const [paymentModal, setPaymentModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [payAll, setPayAll] = useState(false);
    const [amountToPay, setAmountToPay] = useState(0);


    const location = useLocation();
    const navigate = useNavigate();

    const columns = React.useMemo(
        () => [
            {
                Header: "Código orden de trabajo",
                accessor: "work_order.work_order_code",
                Cell: ({ value }) => <span className="bold-text">{value}</span>,
                headerClassName: 'bold-text'
            },
            {
                Header: "Estado",
                accessor: "sales_receipt_status",
                Cell: ({ value }) => {
                    let statusClass = '';
                    if (value === 'Por cobrar') statusClass = 'status-por-cobrar';
                    else if (value === 'Cobrado') statusClass = 'status-cobrado';

                    return (
                        <div className={`status-box ${statusClass}`}>
                            {value}
                        </div>
                    );
                }
            },
            { Header: "Tipo de comprobante", accessor: "invoice_type" },
            { Header: "Cliente", accessor: "name" },
            { Header: "Placa", accessor: "plate" },
            { Header: "Forma de pago", accessor: "payment_type" },
            { Header: "Fecha", accessor: "created_at" },
            {
                Header: "Subtotal",
                accessor: "subtotal",
                Cell: ({ value }) => `$ ${value}` // Agrega un signo de dólar antes del valor
            },
            {
                Header: "Descuento",
                accessor: "discount",
                Cell: ({ value }) => `${value} %`
            },
            {
                Header: "IVA",
                accessor: "vat",
                Cell: ({ value }) => `${value} %`
            },
            {
                Header: "Total",
                accessor: "total",
                Cell: ({ value }) => <span style={{ color: '#316EA8' }} className="bold-text large-text">$ {value}</span>,
                headerClassName: 'bold-text large-text'
            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const payment = row.original;
                    if (payment.total !== payment.paid) {
                        return (
                            <button className="button-payment-receipt" onClick={() => handleOpenPaymentModal(payment)}>
                                <img src={pdfIcon} alt="Payment Receipt Icon" className="payment-receipt-icon" />
                            </button>
                        );
                    } else {
                        return null; // No renderizar nada si el total es igual al pagado.
                    }
                },
                id: 'payment-receipt-button'
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
            if (response.status === 200) {
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

    const handleWorkOrderConfirm = async () => {
        try {
            // Construir el payload
            const payload = {
                client_id: workOrderData.clientId,
                work_order_id: parseInt(workOrderData.id, 10),
                invoice_type: 'sales_note',
                subtotal: parseInt(workOrderData.subtotal, 10),
                discount: discount / 100,
                vat: 0,
                total: total,
            };

            console.log("datos a enviar", payload)

            // Llamada a la API
            const response = await apiClient.post('/sales-receipts/create', payload);

            if (response.status === 201) {
                toast.success('Operación exitosa', {
                    position: toast.POSITION.TOP_RIGHT
                });
                setLastAddedReceiptId(response.data.id);
                fetchData();
            }

            setWorkOrderModalOpen(false);

        } catch (error) {
            console.error('Error al procesar la orden de trabajo', error);
        }
    };

    const handleOpenPaymentModal = (receipt) => {
        setSelectedReceipt(receipt);
        setPaymentModal(true);
    };

    const handleClosePaymentModal = () => {
        setPaymentModal(false);
        setPayAll(false);
        setAmountToPay(0);
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (location.state?.fromWorkOrder) {
            setWorkOrderData(location.state.workOrderData);
            setWorkOrderModalOpen(true);
            navigate('/paymentReceipt', { replace: true }); // Esto reemplaza la entrada actual en el historial.
        }
    }, []);

    return (

        <div>

            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <ToastContainer />

            <div className="container-payment-receipts">

                <div style={{ display: 'flex' }}>
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
                    highlightRows={true}
                    selectedRowId={lastAddedReceiptId}
                    customFontSize={true}
                />

            </div>

            {isModalOpen && (
                <SearchModalPayment
                    isOpen={handleOpenModal}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirm}
                />
            )}

            {isWorkOrderModalOpen && (
                <WorkOrderInfoModal
                    isOpen={isWorkOrderModalOpen}
                    workOrderData={workOrderData}
                    onConfirm={handleWorkOrderConfirm}
                    discount={discount}
                    setDiscount={setDiscount}
                    total={total}
                    setTotal={setTotal}
                    vat={vat}
                    setVat={setVat}

                />

            )}

            {paymentModal && (
                <div className="filter-modal-overlay">
                    <div className="modal-content">
                        <div className="title-modal-history">
                            <h4>Nuevo Pago</h4>
                            <div style={{ flex: "1", marginTop: '18px' }}>
                                <button className="button-close" onClick={handleClosePaymentModal}  >
                                    <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                                </button>
                            </div>
                        </div>

                        <div className="container-label" style={{ marginTop: '20px' }}>
                            <label>Total a pagar:
                                <span> {selectedReceipt?.total}</span>
                            </label>

                            <label>Total pagado:
                                <span> {selectedReceipt?.paid}</span>
                            </label>

                            <div>
                                <label>Valor a pagar: 
                                    <input
                                        value={amountToPay}
                                        onChange={(e) => {
                                            setAmountToPay(Number(e.target.value));
                                            if (payAll) {
                                                setPayAll(false); // Desactivar el checkbox si el usuario cambia el valor manualmente.
                                            }
                                        }}
                                    />
                                </label>
                            </div>


                            <div>
                                <input
                                    type="checkbox"
                                    checked={payAll}
                                    onChange={(e) => {
                                        setPayAll(e.target.checked);
                                        if (e.target.checked && selectedReceipt) {
                                            setAmountToPay(selectedReceipt.total - selectedReceipt.paid);
                                        } else {
                                            setAmountToPay(0); // O cualquier valor predeterminado.
                                        }
                                    }}
                                    
                                />
                                <label> Pagar todo</label>
                            </div>


                        </div>

                        <div className="button-options" style={{ justifyContent: 'center' }}>
                            <button className="accept-button-modal">Cobrar</button>
                        </div>

                    </div>

                </div>
            )}

        </div>
    )
};

export default PaymentReceipts;
