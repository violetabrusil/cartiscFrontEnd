import "../../WorkOrders.css";
import "../../Loader.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';
import { ToastContainer } from "react-toastify";
import PuffLoader from "react-spinners/PuffLoader";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import Modal from "../../modal/Modal";
import apiClient from "../../services/apiClient";
import TitleAndSearchBoxSpecial from "../../titleAndSearchBox/TitleAndSearchBoxSpecial";
import { CustomButtonContainer, CustomButton } from "../../customButton/CustomButton";
import { workOrderStatus } from "../../constants/workOrderConstants";
import { useWorkOrderContext } from "../../contexts/searchContext/WorkOrderContext";
import { useScrollRestoration, enteringModule } from "../../hooks/useScrollRestoration";

const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";
const receiptIcon = process.env.PUBLIC_URL + "/images/icons/receipt.png";

const WorkOrders = () => {

    const {
        selectedOption = 'Nombre Titular', setSelectedOption,
        searchTerm, setSearchTerm,
        workOrders, setWorkOrders,
        page, setPage,
        hasMore, setHasMore,
        totalValues, setTotalValues
    } = useWorkOrderContext();
    const navigate = useNavigate();

    const PAGE_SIZE = 10;

   
    const [isFreshModuleEntry] = useState(() => enteringModule('workOrders'));

    const [loading, setLoading] = useState(isFreshModuleEntry || workOrders.length === 0);
    const [isFetching, setIsFetching] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const observer = useRef();
    const isFirstFilterRun = useRef(true);
    const isFirstFetchRun = useRef(true);
    const workOrdersListRef = useScrollRestoration('workOrders:list', !loading);

    const formatDate = (isoDate) => {
        if (!isoDate) return "--/--/--";
        const date = new Date(isoDate);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

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

    const statusColors = {
        "Por iniciar": "#316EA8",
        "Asignada": "#0C1F31",
        "En desarrollo": "#4caf50",
        "En espera": "#fbc02d",
        "Cancelada": "#e74c3c",
        "Completada": "#2e7d32",
        "Eliminada": "#6E757D"
    };

    const handleSearchWorkOrdersWithDebounce = useMemo(
        () => debounce((term) => {

            if (term.length === 0) {
                setSearchTerm("");
            } else if (term.length >= 3) {
                setSearchTerm(term);
            } 
        }, 500),
        [setSearchTerm]
    );

    useEffect(() => {
        if (isFirstFilterRun.current) {
            isFirstFilterRun.current = false;
            return;
        }
        setPage(1);
        setHasMore(true);
        if (workOrdersListRef.current) {
            workOrdersListRef.current.scrollTop = 0;
        }
    }, [searchTerm, selectedOption]);

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const handleSelectClick = (option) => {
        setSelectedOption(option);
        closeFilterModal();
    };

    useEffect(() => {
        const controller = new AbortController();

        if (isFirstFetchRun.current) {
            isFirstFetchRun.current = false;

            if (isFreshModuleEntry) {
                const needsPageReset = page !== 1;
                const needsSearchReset = Boolean(searchTerm);
                setHasMore(true);
                if (needsPageReset) setPage(1);
                if (needsSearchReset) setSearchTerm("");
                if (needsPageReset || needsSearchReset) {
                    return () => controller.abort();
                }
            } else if (workOrders.length > 0) {
                setLoading(false);
                return () => controller.abort();
            }
        }

        const fetchData = async () => {

            if (isFetching && page !== 1) return;

            if (page === 1) setLoading(true);
            setIsFetching(true);

            try {
                let response;
                const endpoint = searchTerm
                    ? `/work-orders/search/${page}/${PAGE_SIZE}`
                    : `/work-orders/list/${page}/${PAGE_SIZE}`;

                if (searchTerm) {
                    const searchFieldMapping = {
                        'Placa': 'vehicle_plate',
                        'Código Orden de Trabajo': 'work_order_code',
                        'Nombre Titular': 'client_name',
                        'Asignada a': 'assigned',
                        'Entregada por': 'delivered_by',
                        'Creada por': 'created_by',
                    };
                    const payload = { [searchFieldMapping[selectedOption]]: searchTerm };
                    response = await apiClient.post(endpoint, payload, { signal: controller.signal });
                } else {
                    response = await apiClient.get(endpoint, { signal: controller.signal });
                }

                if (!controller.signal.aborted) {
                    const rawData = response.data.values || [];
                    const totalPages = parseInt(response.data.total_pages) || 0;

                    setHasMore(page < totalPages && rawData.length > 0);

                    const transformed = rawData.map(wo => ({
                        ...wo,
                        date_start: formatDate(wo.date_start),
                        work_order_status: workOrderStatus[wo.work_order_status] || wo.work_order_status,
                        vehicle_plate: formatPlate(wo.vehicle_plate),
                        is_billed: wo.is_billed,
                    }));

                    setWorkOrders(prev => (page === 1 ? transformed : [...prev, ...transformed]));
                    setTotalValues(parseInt(response.data.total_values) || 0);
                    console.log("data filter", response.data)
                }

            } catch (error) {
                if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
                    console.error("Error en la petición:", error);
                    setHasMore(false);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                    setIsFetching(false);
                }
            }
        };

        fetchData();

        return () => controller.abort();
    }, [page, searchTerm, selectedOption]);


    const lastOrderElementRef = useCallback(node => {
        if (loading || isFetching) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, isFetching, hasMore]);

    const handleShowInformationWorkOrderClick = (workOrderId) => {
        navigate(`/workOrders/detailWorkOrder/${workOrderId}`, {
            state: { currentPage: 'workOrders' }
        });
    };

    const handleAddNewWorkOrder = () => {
        navigate("/workOrders/newWorkOrder");
    };

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    return (

        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <ToastContainer />

            <div className="work-order-container">
                <div className="left-section-work-order">

                    <TitleAndSearchBoxSpecial
                        selectedOption={selectedOption}
                        searchTerm={searchTerm}
                        title="Órdenes de Trabajo"
                        subtitle={totalValues}
                        onSearchChange={handleSearchWorkOrdersWithDebounce}
                        onButtonClick={openFilterModal}
                        shouldSaveSearch={true}
                        wrapperClassName="title-search-wrapper"
                    />


                    {loading && page === 1 ? (
                        <div className="loader-container" style={{ marginLeft: '-93px' }}>
                            <PuffLoader color="#316EA8" loading={loading} size={60} />
                        </div>
                    ) : (
                        <>
                            <div className="container-list-work-orders" ref={workOrdersListRef}>

                                {workOrders.map((workOrderData, index) => {
                                    const isLast = workOrders.length === index + 1;
                                    return (
                                        <div
                                            key={`${workOrderData.id}-${index}`}
                                            className="result-work-order"
                                            onClick={() => handleShowInformationWorkOrderClick(workOrderData.id)}
                                            ref={isLast ? lastOrderElementRef : null}>

                                            <div className="first-result-work-orders">
                                                <div className="div-label-work-order-code">
                                                    <label>
                                                        {workOrderData.work_order_code}
                                                    </label>
                                                </div>
                                                <div className="div-label-work-order-client">
                                                    <label>
                                                        {workOrderData.client_name}
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="second-result-work-order">
                                                <div className="input-plate-container-work-order">
                                                    <input
                                                        className="input-plate-vehicle-work-order"
                                                        type="text"
                                                        value={workOrderData.vehicle_plate}
                                                        readOnly
                                                    />
                                                    <img src={flagIcon} alt="Flag" className="ecuador-icon" />
                                                    <label>ECUADOR</label>
                                                </div>

                                            </div>
                                            <div className="third-result-work-order">
                                                <div className="div-label-status">
                                                    <label style={{ color: statusColors[workOrderData.work_order_status] }}>
                                                        {workOrderData.work_order_status}
                                                    </label>
                                                </div>
                                                <div className="div-label-date">
                                                    <label>{workOrderData.date_start}</label>
                                                </div>

                                            </div>

                                            {workOrderData.work_order_status === 'Completada' && !workOrderData.is_billed && (
                                                <div className="fourth-result-work-order">
                                                    <div className="div-image-receipt">
                                                        <img src={receiptIcon} alt="Receipt Icon" className="payment-receipt-icon" style={{ width: '20px', height: '20px' }} />
                                                    </div>
                                                </div>

                                            )}

                                        </div>

                                    )

                                })}

                                {isFetching && page > 1 && (
                                    <div className="infinite-scroll-loader">
                                        <PuffLoader color="#316EA8" size={40} />
                                    </div>
                                )}

                            </div>
                        </>
                    )}

                </div>

                <div className="right-section-work-order">
                    <CustomButtonContainer>
                        <CustomButton title="AGREGAR ORDEN DE TRABAJO" onClick={handleAddNewWorkOrder} />
                    </CustomButtonContainer>
                </div>
            </div>


            {isFilterModalOpen && (
                <Modal
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    options={['Nombre Titular', 'Placa', 'Código Orden de Trabajo' ,'Asignada a', 'Entregada por', 'Creada por']}
                    defaultOption={selectedOption}
                    onOptionChange={handleOptionChange}
                    onSelect={handleSelectClick}
                />
            )}

        </div>

    );

};

export default WorkOrders;