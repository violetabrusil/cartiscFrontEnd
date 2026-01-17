import "../../PaymentReceipts.css";
import "../../Modal.css"
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import PuffLoader from "react-spinners/PuffLoader";
import Select from 'react-select';
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
import { usePageSizeForTabletLandscape } from "../../pagination/UsePageSize";
import { usePaymentReceipt } from "../../contexts/searchContext/PaymentReceiptContext";
import DataTablePagination from "../../dataTable/DataTablePagination";

const filterIcon = process.env.PUBLIC_URL + "/images/icons/filterIcon.png";
const pdfIcon = process.env.PUBLIC_URL + "/images/icons/pdfIcon.png";
const emailIcon = process.env.PUBLIC_URL + "/images/icons/email-icon.png";
const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const paymentIcon = process.env.PUBLIC_URL + "/images/icons/payment-icon.png";
const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";

const PaymentReceipts = () => {

    const [paymentReceipts, setPaymentReceipts] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isWorkOrderModalOpen, setWorkOrderModalOpen] = useState(false);
    const [workOrderData, setWorkOrderData] = useState(null);
    const [total, setTotal] = useState(0);
    const [vat, setVat] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [lastAddedReceiptId, setLastAddedReceiptId] = useState(null);
    const [paymentModal, setPaymentModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [payAll, setPayAll] = useState(false);
    const [amountToPay, setAmountToPay] = useState(0);
    const [loading, setLoading] = useState(true);
    const [paymentType, setPaymentType] = useState(null);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const responsivePageSize = usePageSizeForTabletLandscape(7, 5);
    const { filterData, setFilterData } = usePaymentReceipt();
    const [isFilter, setIsFilter] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    //const [pageSize, setPageSize] = useState(7);
    const [totalValues, setTotalValues] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [totalPages, setTotalPages] = useState(0);

    const paymentTypeOptions = [
        { value: 'pending', label: 'Pendiente' },
        { value: 'cash', label: 'Efectivo' },
        { value: 'electronic_money', label: 'Transferencia' },
        { value: 'debit_credit_card', label: 'Tarjeta de crédito' },
        { value: 'other', label: 'Otro' },
    ];

    const location = useLocation();
    const navigate = useNavigate();

    const formatPlate = (plateInput) => {
        const regex = /^([A-Z]{3})(\d{3,4})$/;

        if (regex.test(plateInput)) {
            return plateInput.replace(
                regex,
                (match, p1, p2) => {
                    return p1 + "-" + p2;
                }
            );
        }
        return plateInput; // Devuelve la placa sin cambios si no cumple con el formato esperado.
    };

    const navigateToDetail = (workOrderId) => {
        navigate(`/workOrders/detailWorkOrder/${workOrderId}`, {
            state: { currentPage: 'paymentReceipt' }
        });
    };

    const selectTypePaymentStyles = {
        control: (provided, state) => ({
            ...provided,
            width: '220px',
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
        menu: (provided, state) => ({
            ...provided,
            width: '100%', // puedes ajustar el ancho del menú aquí
        }),
    };

    const columns = React.useMemo(
        () => [
            {
                Header: "Código orden de trabajo",
                accessor: "work_order.work_order_code",
                Cell: ({ value }) => <span>{value}</span>,
            },
            {
                Header: "Estado",
                accessor: "sales_receipt_status",
                Cell: ({ value }) => {
                    let statusClass = '';
                    if (value === 'Por cobrar') statusClass = 'status-por-cobrar';
                    else if (value === 'Cobrado') statusClass = 'status-cobrado';
                    return (
                        <div className={`status-box ${statusClass} no-wrap-column`}>
                            {value}
                        </div>
                    );
                }
            },
            { Header: "Tipo de comprobante", accessor: "invoice_type" },
            { Header: "Cliente", accessor: "name" },
            {
                Header: "Placa",
                accessor: "plate",
                Cell: ({ value }) => <div className="no-wrap-column">{formatPlate(value)}</div>
            },
            {
                Header: "Forma de pago",
                accessor: "payment_type",
                Cell: ({ value }) => paymentTypeMaping[value] || value
            },
            {
                Header: "Fecha",
                accessor: "date",
                Cell: ({ value }) => <span>{formatDate(value)}</span>,
            },
            {
                Header: "Subtotal sin IVA",
                accessor: "subtotal",
                Cell: ({ value }) => {
                    const formattedValue = parseFloat(value).toFixed(2);
                    return <span>$ {formattedValue}</span>;
                }
            },
            {
                Header: "IVA (15%)",
                accessor: "vat",
                width: 165,
                minWidth: 120,
                Cell: ({ value }) => {
                    const vatAmount = parseFloat(value).toFixed(2);

                    return (
                        <div style={{ width: '60px' }}>
                            $ {vatAmount}
                        </div>
                    );
                }
            },
            {
                Header: "Valor Total",
                accessor: "total",
                Cell: ({ value }) => {
                    const formattedValue = parseFloat(value).toFixed(2);
                    const [wholePart, decimalPart] = formattedValue.split(".");

                    return (
                        <div style={{ display: 'inline-block', color: '#316EA8', fontWeight: '600' }} className="no-wrap-column-total">
                            <span className="whole-part">$ {wholePart}.</span>
                            <span className="decimal-part" style={{ fontSize: '0.85em' }}>{decimalPart}</span>
                        </div>
                    );
                },
                headerClassName: 'bold-text large-text'
            },
            {
                Header: "",
                accessor: "work_order.id",
                Cell: ({ value }) => (
                    <button className="button-eye-workorder-payment" onClick={() => navigateToDetail(value)}>
                        <img src={eyeIcon} alt="Eye Icon" className="icon-eye-workorder-payment" />
                    </button>
                ),
                className: "small-row"
            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const payment = row.original;
                    return (
                        <>
                            {payment.sales_receipt_status !== "Cobrado" && (
                                <button className="button-payment-receipt" onClick={() => handleOpenPaymentModal(payment)}>
                                    <img src={paymentIcon} alt="Payment Receipt Icon" className="payment-receipt-icon" />
                                </button>
                            )}
                            <button className="button-download-payment-receipt" onClick={() => downloadPDF(payment.id)}>
                                <img src={pdfIcon} alt="Download Payment Receipt Icon" className="download-payment-receipt-icon" />
                            </button>
                            <button className="button-email" onClick={() => sendEmail(payment.id)}>
                                <img src={emailIcon} alt="Email Icon" className="email-icon" />
                            </button>
                        </>
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
        setLoading(true);
        try {
            // Verifica si todos los campos de búsqueda están vacíos
            const isEmptySearch = !data.work_order_code &&
                !data.vehicle_plate &&
                !data.client_name &&
                !data.client_cedula &&
                !data.sales_receipt_status &&
                !data.payment_type &&
                !data.invoice_type &&
                !data.date_start_of_search &&
                !data.date_finish_of_search;

            let response;

            // Si los campos están vacíos, realiza una solicitud para obtener toda la lista
            if (isEmptySearch) {
                response = await apiClient.get('/sales-receipts/all'); // Ajusta esta URL según tu API
            } else {
                response = await apiClient.post('/sales-receipts/search', data);
            }

            // Si response.data es null o undefined, cierra el modal y retorna.
            if (!response.data) {
                setModalOpen(false);
                return;
            }

            // Procesa la respuesta
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

            // Actualiza los estados con los datos filtrados o la lista completa
            setIsFilter(true);
            setPaymentReceipts(transformedPaymentReceipts);
            setFilterData(transformedPaymentReceipts);
            setLoading(false);
            setModalOpen(false);

        } catch (error) {
            toast.error('Ha ocurrido un error', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };


    //Función que permite obtener todos los recibos de pago
    //cuando inicia la pantalla y las busca por
    //por número de serie, categoría o título
    const fetchData = async (page = 1, pageSize = responsivePageSize) => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/sales-receipts/list/${page}/${pageSize}`);

            if (!response.data || response.data.length === 0) {
                setLoading(false);
                setHasNextPage(false);
                return;
            }

            console.log("datos de comprobante", response.data);

            const { current_page, total_pages, values, total_values } = response.data;

            const transformedPaymentReceipts = values.map(payment => {
                const newDateStart = formatDate(payment.created_at);
                const translatedInvoiceType = invoiceTypeMaping[payment.invoice_type] || payment.invoice_type;
                let translatedPaymentStatus = paymentStatusMaping[payment.sales_receipt_status] || payment.sales_receipt_status;

                if (payment.paid === payment.total) {
                    translatedPaymentStatus = "Cobrado";
                }

                return {
                    ...payment,
                    created_at: newDateStart,
                    invoice_type: translatedInvoiceType,
                    sales_receipt_status: translatedPaymentStatus,
                };
            });

            // Imprime los datos transformados
            console.log("Datos transformados:", transformedPaymentReceipts);
            setIsFilter(false);
            setPaymentReceipts(transformedPaymentReceipts);
            setLoading(false);
            setTotalPages(total_pages);
            setTotalValues(total_values);
        } catch (error) {
            setLoading(false);
            if (error.code === 'ECONNABORTED') {
                console.error('La solicitud ha superado el tiempo límite.');
            } else {
                console.error('Se superó el tiempo límite inténtelo nuevamente.', error.message);
            }
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    const downloadPDF = async (paymentId) => {

        try {
            setDownloadingPdf(true)
            const response = await apiClient.get(`/sales-receipts/generate-pdf/${paymentId}`, { responseType: 'blob' });
            console.log("response", response)
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'comprobante_venta.pdf'); // El nombre que quieras para el archivo descargado
            document.body.appendChild(link);
            link.click();

            // Limpieza: quitar el enlace cuando haya terminado
            link.parentNode.removeChild(link);
            if (response.status === 200) {
                setDownloadingPdf(false);
                toast.success('Archivo descargado', {
                    position: toast.POSITION.TOP_RIGHT
                });
            } else {
                setDownloadingPdf(false);
                toast.error('Error al descarar el archivo', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        } catch (error) {
            console.error('Error descargando el archivo', error);

            // Mostrar un toast de error
            toast.error('Error descargando el archivo');
        }
        setDownloadingPdf(false);
    };

    const sendEmail = async (paymentId) => {
        try {
            setSendingEmail(true);
            const response = await apiClient.get(`/sales-receipts/send-email/${paymentId}`);
            if (response.status === 200) {
                setSendingEmail(false);
                toast.success('Email enviado', {
                    position: toast.POSITION.TOP_RIGHT
                });
            } else {
                setSendingEmail(false);
                toast.error('Error al enviar el email', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        } catch (error) {
            setSendingEmail(false);
            toast.error('Error al enviar el email', {
                position: toast.POSITION.TOP_RIGHT
            });
            setSendingEmail(false);
            console.error('Error al enviar el email', error);
        } finally {

        }
    };

    const handleWorkOrderConfirm = async () => {

        setLoading(true);

        const selectedDateAdjusted = new Date(selectedDate);
        selectedDateAdjusted.setHours(selectedDate.getHours() - selectedDate.getTimezoneOffset() / 60);

        try {
            // Construir el payload
            const payload = {
                client_id: workOrderData.clientId,
                work_order_id: parseInt(workOrderData.id, 10),
                invoice_type: 'sales_note',
                subtotal: parseFloat(workOrderData.subtotal).toFixed(2),
                discount: 0,
                date: selectedDateAdjusted.toISOString(),
                vat: 0,
                total: total,
            };

            console.log("datos a enviasr", payload)

            // Llamada a la API
            const response = await apiClient.post('/sales-receipts/create', payload);

            if (response.status === 201) {
                toast.success('Operación exitosa', {
                    position: toast.POSITION.TOP_RIGHT
                });
                setLastAddedReceiptId(response.data.id);
                await fetchData();

            }
            setLoading(false);
            setWorkOrderModalOpen(false);


        } catch (error) {
            console.log("error", error)
            toast.error('Error al procesar la orden de trabajo', {
                position: toast.POSITION.TOP_RIGHT
            });
            console.error('', error);
        }
    };

    const handleOpenPaymentModal = (receipt) => {
        setSelectedReceipt(receipt);
        setPaymentType(receipt.payment_type);
        setAmountToPay(0); // o si deseas que esté preconfigurado con algún valor, cámbialo aquí
        setPayAll(false);
        setPaymentModal(true);
    };


    const handleClosePaymentModal = () => {
        setPaymentModal(false);
        setPayAll(false);
        setAmountToPay(0);
        fetchData();
    };

    const handleChargeReceipt = async () => {

        setLoading(true);

        if (paymentType === 'pending') {

            toast.error('Seleccione una forma de pago para continuar.', {
                position: toast.POSITION.TOP_RIGHT
            });

        } else {
            try {
                const id = selectedReceipt.id;

                const response = await apiClient.put(`/sales-receipts/charge/${id}`, null, {
                    params: {
                        payment_type: paymentType,
                        paid: amountToPay
                    }
                });

                handleClosePaymentModal();
                await fetchData();
                setLoading(false);
                toast.success('Pago procesado con éxito.', {
                    position: toast.POSITION.TOP_RIGHT
                });


            } catch (error) {
                console.log("Error en paga comprobante", error)

                toast.error('Error al procesar el pago.', {
                    position: toast.POSITION.TOP_RIGHT
                });

            }
        }

    };

    const closeModal = () => {
        setWorkOrderModalOpen(false);
    };

    useEffect(() => {
        fetchData(currentPage, responsivePageSize);
        console.log("cursor", currentPage)
        console.log("pageSize", responsivePageSize)
    }, [currentPage, responsivePageSize]);

    useEffect(() => {
        if (location.state?.fromWorkOrder) {
            setWorkOrderData(location.state.workOrderData);
            console.log("data payment", workOrderData)
            setWorkOrderModalOpen(true);
            navigate('/paymentReceipt', { replace: true }); // Esto reemplaza la entrada actual en el historial.
        }
    }, []);

    useEffect(() => {
        // Recuperar datos filtrados al cargar el componente o al regresar a la página
        setPaymentReceipts(filterData); // Ajusta esto según cómo manejes tus datos en el contexto
    }, [filterData]); // Ejecuta este efecto cuando filterData cambie en el contexto

    useEffect(() => {
        console.log("Lista filtrada actualizada:", filterData);
    }, [filterData]);



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

                    <div className="total-work-orders">
                        <span>
                            {totalValues}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="loader-container">
                        <PuffLoader color="#316EA8" loading={loading} size={60} />
                    </div>
                ) : (
                    <div className="data-table-container">
                        {downloadingPdf && (
                            <div className="absolute-loader-container">
                                <PuffLoader color="#316EA8" loading={true} size={60} />
                            </div>
                        )}

                        {sendingEmail && (
                            <div className="absolute-loader-container">
                                <PuffLoader color="#316EA8" loading={true} size={60} />
                            </div>
                        )}
                        {paymentReceipts.length > 0 && (
                            <DataTablePagination
                                data={paymentReceipts}
                                columns={columns} // Define tus columnas
                                goToNextPage={goToNextPage}
                                goToPreviousPage={goToPreviousPage}
                                hasNextPage={currentPage < totalPages}
                                hasPreviousPage={currentPage > 1}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                pageSize={responsivePageSize}
                                setCurrentPage={setCurrentPage}
                                isFilter={isFilter}
                            />
                        )}


                    </div>

                )}

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
                    onClose={closeModal}
                    workOrderData={workOrderData}
                    onConfirm={handleWorkOrderConfirm}
                    total={total}
                    setTotal={setTotal}
                    vat={vat}
                    setVat={setVat}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}

                />

            )}

            {paymentModal && (
                <div className="filter-modal-overlay">
                    <ToastContainer />
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
                                <span style={{ marginLeft: '94px' }}>{selectedReceipt?.total ? parseFloat(selectedReceipt.total).toFixed(2) : '0.00'}</span>
                            </label>

                            <label>Total pagado:
                                <span style={{ marginLeft: '94px' }} >{selectedReceipt?.paid ? parseFloat(selectedReceipt.paid).toFixed(2) : '0.00'}</span>
                            </label>

                            <label>Pendiente por pagar:
                                <span>
                                    {
                                        selectedReceipt
                                            ? parseFloat(selectedReceipt.total - (selectedReceipt.paid || 0)).toFixed(2)
                                            : '0.00'
                                    }
                                </span>

                            </label>

                            <div className="flex-container">
                                <label>Forma de pago:</label>
                                <Select
                                    isSearchable={false}
                                    styles={selectTypePaymentStyles}
                                    options={paymentTypeOptions}
                                    onChange={selectedOption => setPaymentType(selectedOption.value)}
                                    value={paymentTypeOptions.find(option => option.value === paymentType)}
                                    placeholder="Seleccione"
                                />

                            </div>

                            <div>
                                <label>
                                    Valor a pagar:
                                    <input
                                        type="text"
                                        className="paid-input"
                                        value={amountToPay}
                                        onChange={(e) => {
                                            const value = e.target.value.trim();
                                            const sanitizedValue = value.replace(/,/g, '.'); // Reemplazar comas por puntos
                                            if (/^[-]?\d*\.?\d{0,2}$/.test(sanitizedValue) || sanitizedValue === "") {
                                                setAmountToPay(sanitizedValue);
                                                if (payAll) {
                                                    setPayAll(false);
                                                }
                                            }
                                        }}

                                    />
                                </label>
                            </div>

                            <div>
                                <input
                                    style={{ marginLeft: '5px' }}
                                    type="checkbox"
                                    checked={payAll}
                                    onChange={(e) => {
                                        setPayAll(e.target.checked);
                                        if (e.target.checked && selectedReceipt) {
                                            setAmountToPay((parseFloat(selectedReceipt.total - selectedReceipt.paid).toFixed(2)));
                                        } else {
                                            setAmountToPay('0.00'); // O cualquier valor predeterminado con dos decimales.
                                        }
                                    }}
                                />
                                <label style={{ marginLeft: '10px' }}> Pagar todo</label>
                            </div>



                        </div>

                        <div className="button-options" style={{ justifyContent: 'center' }}>
                            <button className="accept-button-modal" onClick={handleChargeReceipt}>Cobrar</button>
                        </div>

                    </div>

                </div>
            )}

        </div>
    )
};

export default PaymentReceipts;
