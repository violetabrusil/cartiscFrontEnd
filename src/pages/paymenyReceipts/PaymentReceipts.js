import "../../PaymentReceipts.css";
import "../../Modal.css"
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
    const { filterData, setFilterData, resetAllFilters } = usePaymentReceipt();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalValues, setTotalValues] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isTableLoading, setIsTableLoading] = useState(false);

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

    const handleConfirm = async (data, isRestoringFromUrl = false, page = 1, pageSize = responsivePageSize) => {

        let cleanParams = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
        );

        const formatToStartOfDayISO = (date) => {
            if (!date) return null;
            const d = new Date(date);
            if (isNaN(d)) return null;
            return d.toISOString().split('T')[0] + "T00:00:00Z";
        };

        if (cleanParams.date_start_of_search) {
            cleanParams.date_start_of_search = formatToStartOfDayISO(cleanParams.date_start_of_search);
        }
        if (cleanParams.date_finish_of_search) {
            cleanParams.date_finish_of_search = formatToStartOfDayISO(cleanParams.date_finish_of_search);
        }

        if (!isRestoringFromUrl) {
            setSearchParams({ ...cleanParams, page: 1 });
            return;
        }

        setLoading(true);
        try {
            const isEmptySearch = Object.keys(cleanParams).filter(k => k != 'page').length === 0;

            if (isEmptySearch) {
                await fetchData(page, pageSize);
                return;
            }

            const response = await apiClient.post(`/sales-receipts/search/${page}/${pageSize}`, cleanParams);

            if (!response.data || !response.data.values) {
                setPaymentReceipts([]);
                setTotalPages(0);
                setTotalValues(0);
                setLoading(false);
                setModalOpen(false);
                return;
            }

            const { values, total_pages, total_values } = response.data;

            const transformed = values.map(payment => {
                let translatedStatus = paymentStatusMaping[payment.sales_receipt_status] || payment.sales_receipt_status;
                if (payment.paid === payment.total) translatedStatus = "Cobrado";

                return {
                    ...payment,
                    created_at: formatDate(payment.created_at),
                    invoice_type: invoiceTypeMaping[payment.invoice_type] || payment.invoice_type,
                    payment_type: paymentTypeMaping[payment.payment_type] || payment.payment_type,
                    sales_receipt_status: translatedStatus
                };
            });

            setPaymentReceipts(transformed);
            setFilterData(transformed);
            setTotalPages(total_pages);
            setTotalValues(total_values);
            setCurrentPage(page)
            setLoading(false);
            setModalOpen(false);

        } catch (error) {
            setLoading(false);
            toast.error('Error al procesar la solicitud');
            console.error(error);
        }
    };

    //Función que permite obtener todos los recibos de pago
    //cuando inicia la pantalla y las busca por
    //por número de serie, categoría o título
    const fetchData = async (page = 1, pageSize = responsivePageSize) => {

        if (paymentReceipts.length === 0) {
            setLoading(true)
        }

        setLoading(true);
        try {
            const response = await apiClient.get(`/sales-receipts/list/${page}/${pageSize}`);

            if (!response.data || response.data.length === 0) {
                setLoading(false);
                return;
            }

            console.log("datos de comprobante", response.data);

            const { total_pages, values, total_values } = response.data;

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

            setPaymentReceipts(transformedPaymentReceipts);
            setLoading(false);
            setTotalPages(total_pages);
            setTotalValues(total_values);
        } catch (error) {
            ;
            if (error.code === 'ECONNABORTED') {
                console.error('La solicitud ha superado el tiempo límite.');
            } else {
                console.error('Se superó el tiempo límite inténtelo nuevamente.', error.message);
            }
        }
        finally {
            setLoading(false);
            setIsTableLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        const currentParams = Object.fromEntries([...searchParams]);
        const cleanParams = Object.fromEntries(
            Object.entries(currentParams).filter(([_, v]) => v !== undefined && v !== null)
        );
        setSearchParams({ ...cleanParams, page: newPage })
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) handlePageChange(currentPage + 1);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) handlePageChange(currentPage - 1);
    };

    const downloadPDF = async (paymentId) => {

        try {
            setDownloadingPdf(true);
            const response = await apiClient.get(`/sales-receipts/generate-pdf/${paymentId}`, { responseType: 'blob' });

            const header = response.headers['content-disposition'];
            const fileName = header.split('filename=')[1].replace(/['"]/g, '');

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click()

            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Archivo descargado correctamente', {
                position: toast.POSITION.TOP_RIGHT
            });

        } catch (error) {
            console.error('Error descargando el archivo', error);

            toast.error('Error al generar el PDF. Verifique los datos e intente nuevamente.');
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
        if (location.state?.fromWorkOrder) {
            setWorkOrderData(location.state.workOrderData);
            console.log("data payment", workOrderData)
            setWorkOrderModalOpen(true);
            navigate('/paymentReceipt', { replace: true });
        }
    }, []);

    useEffect(() => {
        console.log("Lista filtrada actualizada:", filterData);
    }, [filterData]);

    useEffect(() => {
        if (location.pathname !== '/paymentReceipt') return;

        const params = Object.fromEntries([...searchParams]);
        const pageToLoad = params.page ? parseInt(params.page) : 1;

        setCurrentPage(pageToLoad);

        const filters = { ...params };
        delete filters.page;

        const hasFilters = Object.keys(filters).length > 0;

        if (!hasFilters) {
            fetchData(pageToLoad, responsivePageSize);
        } else {
            handleConfirm(filters, true, pageToLoad, responsivePageSize);
        }

    }, [searchParams, responsivePageSize, location.pathname]);

    useEffect(() => {
        const hasUrlParams = searchParams.toString().length > 0;
        if (!location.state?.fromDetail && !hasUrlParams) {
            resetAllFilters();
        }
    }, [location.pathname]);

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

                {loading && paymentReceipts.length === 0 ? (
                    <div className="loader-container">
                        <PuffLoader color="#316EA8" loading={loading} size={60} />
                    </div>
                ) : (
                    <div className="data-table-container" style={{ position: 'relative' }}>

                        {(downloadingPdf || sendingEmail) && (
                            <div className="absolute-loader-container">
                                <PuffLoader color="#316EA8" loading={true} size={60} />
                            </div>
                        )}

                        {isTableLoading && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 10
                            }}>
                                <PuffLoader color="#316EA8" size={50} />
                            </div>
                        )}

                        <div style={{
                            opacity: 1,
                            transition: 'none',
                            pointerEvents: isTableLoading ? 'none' : 'auto'
                        }}>
                            {paymentReceipts.length > 0 ? (
                                <DataTablePagination
                                    data={paymentReceipts}
                                    columns={columns}
                                    goToNextPage={goToNextPage}
                                    goToPreviousPage={goToPreviousPage}
                                    hasNextPage={currentPage < totalPages}
                                    hasPreviousPage={currentPage > 1}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    pageSize={responsivePageSize}
                                    setCurrentPage={setCurrentPage}
                                    onPageChange={handlePageChange}
                                />
                            ) : (
                                !loading && <p style={{ textAlign: 'center', marginTop: '20px' }}>No se encontraron resultados</p>
                            )}
                        </div>
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
