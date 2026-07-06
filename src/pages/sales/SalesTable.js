import "../../Sales.css";
import "../../Modal.css"
import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import PuffLoader from "react-spinners/PuffLoader";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import apiClient from "../../services/apiClient";
import { SearchModalSales } from "../../modal/SearchModalSales";
import { invoiceTypeMaping } from "../../constants/invoiceTypeConstants";
import { salesStatusMaping } from "../../constants/salesStatusConstants";
import { usePageSizeForTabletLandscape } from "../../pagination/UsePageSize";
import { useSales } from "../../contexts/searchContext/SalesContext";
import DataTablePagination from "../../dataTable/DataTablePagination";
import StatusBadge from "../../components/StatusBadge";

const filterIcon = process.env.PUBLIC_URL + "/images/icons/filterIcon.png";
const pdfIcon = process.env.PUBLIC_URL + "/images/icons/pdfIcon.png";
const emailIcon = process.env.PUBLIC_URL + "/images/icons/email-icon.png";
const paymentPendingIcon = process.env.PUBLIC_URL + "/images/icons/paymentPedingIcon.png";
const dolarIcon = process.env.PUBLIC_URL + "/images/icons/paymentDoneIcon.png";
const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";

export default function SalesTable({ mode = "all" }) {

    const [sales, setSales] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [workOrderData, setWorkOrderData] = useState(null);
    const [total, setTotal] = useState(0);
    const [vat, setVat] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [lastAddedReceiptId, setLastAddedReceiptId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const responsivePageSize = usePageSizeForTabletLandscape(5, 4);
    const { filterData, setFilterData, resetAllFilters } = useSales();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalValues, setTotalValues] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isTableLoading, setIsTableLoading] = useState(false);
    const title = mode === "receivable" ? "Cuentas por Cobrar" : "Ventas Totales";

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
        return plateInput;
    };

    const navigateToDetail = (workOrderId) => {
        navigate(`/workOrders/detailWorkOrder/${workOrderId}`, {
            state: { currentPage: location.pathname }
        });
    };

    const handleOpenPayment = useCallback((sale) => {
        const pageFromUrl = searchParams.get("page") ?? "1";

        navigate(`/payments/${sale.payment_id}`, {
            state: {
                from: `${location.pathname}?page=${pageFromUrl}`,
                fromDetail: true,
                saleInfo: {
                    date: sale.date?.slice(0, 10),
                    workOrderCode: sale.work_order_code,
                    client: sale.client_name,
                    vat: sale.vat,
                }
            }
        });
    }, [searchParams, navigate, location.pathname]);

    const columns = React.useMemo(
        () => [
            {
                Header: "Código de venta",
                accessor: "order_number",
                Cell: ({ value }) => <span className="order-number">{value}</span>,
            },
            {
                Header: "Estado",
                accessor: "sale_status",
                Cell: ({ value }) => <StatusBadge value={value} />
            },
            { Header: "Tipo de comprobante", accessor: "sale_type" },
            { Header: "Cliente", accessor: "client_name" },
            {
                Header: "Placa",
                accessor: "vehicle_plate",
                Cell: ({ value }) => <div className="no-wrap-column">{formatPlate(value)}</div>
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
                accessor: "work_order_id",
                Cell: ({ row }) => (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <button className="button-eye-workorder-sales" onClick={() => navigateToDetail(row.original.work_order_id)}>
                            <img src={eyeIcon} alt="Eye Icon" className="icon-eye-workorder-sales" />
                        </button>
                        <span style={{ textAlign: "center", fontSize: '0.6rem' }}>{row.original.work_order_code}</span>
                    </div>
                ),
                className: "small-row"
            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const sales = row.original;
                    const isPaid = sales.sale_status === "charged";
                    const isVoided = sales.sale_status === "voided";
                    return (
                        <div style={{ display: "flex" }}>
                            <button className={ isPaid ? "button-payment-receipt" : "button-payment-check"} onClick={() => handleOpenPayment(sales)}>
                                <img
                                    src={isPaid ? dolarIcon : paymentPendingIcon}
                                    alt={isPaid ? "Pago completo" : "Pago pendiente"}
                                    className={ isPaid ? "payment-done" : "payment-receipt-icon" }
                                />
                            </button>
                            <button className="button-download-sales-receipt" onClick={() => downloadPDF(sales.id)} disabled={isVoided}>
                                <img src={pdfIcon} alt="Download Payment Receipt Icon" className="download-sales-receipt-icon" />
                            </button>
                            <button className="button-email" onClick={() => sendEmail(sales.id)} disabled={isVoided}>
                                <img src={emailIcon} alt="Email Icon" className="email-icon" />
                            </button>
                        </div>
                    );
                },
                id: 'email-button'
            }
        ],
        [handleOpenPayment]
    );

    function formatDate(isoDate) {
        const date = new Date(isoDate);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();

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

        const currentParams = Object.fromEntries([...searchParams]);
        const { page: currentPg, ...currentFilters } = currentParams;

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

        if (mode === "receivable") {
            cleanParams.sale_status = "receivable";
        }

        if (!isRestoringFromUrl) {
            const isSameSearch = JSON.stringify(cleanParams) === JSON.stringify(currentFilters);

            if (isSameSearch) {
                setModalOpen(false);
                return;
            }

            setSearchParams({ ...cleanParams, page: 1 })
            return;
        }

        setLoading(true);
        try {
            const isEmptySearch = Object.keys(cleanParams).filter(k => k !== 'page').length === 0;

            if (isEmptySearch) {
                await fetchData(page, pageSize);
                return;
            }

            const response = await apiClient.post(`/sales/search/${page}/${pageSize}`, cleanParams);

            if (!response.data || !response.data.values) {
                setSales([]);
                setTotalPages(0);
                setTotalValues(0);
                setLoading(false);
                setModalOpen(false);
                return;
            }

            const { values, total_pages, total_values } = response.data;

            const transformed = values.map(sales => {
                let translatedStatus = salesStatusMaping[sales.sales_receipt_status] || sales.sales_receipt_status;
                if (sales.paid === sales.total) translatedStatus = "Cobrado";

                return {
                    ...sales,
                    created_at: formatDate(sales.created_at),
                    sale_type: invoiceTypeMaping[sales.sale_type] || sales.sale_type,
                    sales_receipt_status: translatedStatus
                };
            });

            setSales(transformed);
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

    const fetchData = async (page = 1, pageSize = responsivePageSize) => {
        setLoading(true);
        try {
            const endpoint = mode === "receivable"
                ? `/sales/pending/${page}/${pageSize}`
                : `/sales/list/${page}/${pageSize}`;

            const response = await apiClient.get(endpoint);

            if (!response.data || response.data.length === 0) {
                setLoading(false);
                return;
            }

            const { total_pages, values, total_values } = response.data;

            console.log("response de sale", response.data)

            const transformedSales = values.map(sales => {
                const newDateStart = formatDate(sales.created_at);
                const translatedInvoiceType = invoiceTypeMaping[sales.sale_type] || sales.sale_type;
                let translatedSalesStatus = salesStatusMaping[sales.sales_receipt_status] || sales.sales_receipt_status;

                if (sales.paid === sales.total) {
                    translatedSalesStatus = "Cobrado";
                }

                return {
                    ...sales,
                    created_at: newDateStart,
                    sale_type: translatedInvoiceType,
                    sales_receipt_status: translatedSalesStatus,
                };
            });

            setSales(transformedSales);
            setTotalPages(total_pages);
            setTotalValues(total_values);
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.error('La solicitud ha superado el tiempo límite.');
            } else {
                console.error('Error en fetchData:', error.response?.data || error.message);
            }
        } finally {
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

    const downloadPDF = async (salesId) => {
        try {
            setDownloadingPdf(true);
            const response = await apiClient.get(`/sales/generate-pdf/${salesId}`, { responseType: 'blob' });

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
            toast.error('Error al generar el PDF. Verifique los datos e intente nuevamente.');
        }
        setDownloadingPdf(false);
    };

    const sendEmail = async (salesId) => {
        try {
            setSendingEmail(true);
            const response = await apiClient.get(`/sales/send-email/${salesId}`);
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
        } finally {

        }
    };

    const refreshCurrentView = () => {
        const params = Object.fromEntries([...searchParams]);
        const pageToLoad = params.page ? parseInt(params.page) : 1;

        const filters = { ...params };
        delete filters.page;

        const hasFilters = Object.keys(filters).length > 0;
        if (hasFilters) {
            handleConfirm(filters, true, pageToLoad, responsivePageSize);
        } else {
            fetchData(pageToLoad, responsivePageSize);
        }
    };

    useEffect(() => {
        if (location.pathname !== '/sales' && location.pathname !== '/receivables') return;

        const params = Object.fromEntries([...searchParams]);
        const pageToLoad = params.page ? parseInt(params.page) : 1;
        setCurrentPage(pageToLoad);

        refreshCurrentView();
    }, [searchParams, responsivePageSize, location.pathname]);

    useEffect(() => {
        console.log("Lista filtrada actualizada:", filterData);
    }, [filterData]);

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

            <div className="container-sales">

                <div style={{ display: 'flex' }}>
                    <CustomTitleSection
                        title={title} />

                    <button className="button-sales-filter" onClick={handleOpenModal}>
                        <img src={filterIcon} alt="Filter Icon" className="filter-icon" />
                        <span className="button-sales-text-filter">Filtro</span>
                    </button>

                    <div className="total-work-orders">
                        <span>
                            {totalValues}
                        </span>
                    </div>
                </div>

                {loading && sales.length === 0 ? (
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
                            {sales.length > 0 ? (
                                <DataTablePagination
                                    data={sales}
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
                <SearchModalSales
                    isOpen={handleOpenModal}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirm}
                    mode={mode}
                />
            )}

        </div>
    )
};






