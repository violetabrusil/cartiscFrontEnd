import "../../WorkOrders.css";
import "../../Loader.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';
import PuffLoader from "react-spinners/PuffLoader";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import Modal from "../../modal/Modal";
import apiClient from "../../services/apiClient";
import TitleAndSearchBoxSpecial from "../../titleAndSearchBox/TitleAndSearchBoxSpecial";
import { CustomButtonContainer, CustomButton } from "../../buttons/customButton/CustomButton";
import { workOrderStatus } from "../../constants/workOrderConstants";
import { useWorkOrderContext } from "../../contexts/searchContext/WorkOrderContext";
import { useStatusColors } from "../../utils/useStatusColors";
import useCSSVar from "../../hooks/UseCSSVar";
import { formatDate, formatPlate } from "../../utils/formatters";

const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";
const receiptIcon = process.env.PUBLIC_URL + "/images/icons/receipt.png";

const WorkOrders = () => {

    const statusColors = useStatusColors();
    const tertiaryColor = useCSSVar('--tertiary-color');

    const { selectedOption = 'Nombre Titular', setSelectedOption, searchTerm, setSearchTerm } = useWorkOrderContext();
    console.log("Selected Option:", selectedOption);
    const [workOrders, setWorkOrders] = useState([]);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleSearchWorOrderChange = (term, filter) => {
        setSearchTerm(term);
        setSelectedOption(filter);
    };

    const handleSearchWorkOrdersWithDebounce = debounce(handleSearchWorOrderChange, 500);

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const handleSelectClick = (option) => {
        setSelectedOption(option);
        closeFilterModal();
    };

    const handleAddNewWorkOrder = () => {
        navigate("/workOrders/newWorkOrder");
    };

    const handleShowInformationWorkOrderClick = (workOrderId) => {
        navigate(`/workOrders/detailWorkOrder/${workOrderId}`, {
            state: { currentPage: 'workOrders' }
        });
    };

    useEffect(() => {

        const fetchData = async () => {
            let endpoint = '/work-orders/all';

            if (searchTerm) {
                endpoint = '/work-orders/search';
                const searchFieldMapping = {
                    'Placa': 'vehicle_plate',
                    'Código Orden de Trabajo': 'work_order_code',
                    'Nombre Titular': 'client_name',
                    'Asignada a': 'assigned',
                    'Entregada por': 'delivered_by',
                    'Creada por': 'created_by',
                };

                const searchField = searchFieldMapping[selectedOption];

                if (!searchField) {
                    console.error('Campo de búsqueda no válido:', selectedOption);
                    return;
                }

                const payload = {
                    [searchField]: searchTerm,
                };

                try {
                    const response = await apiClient.post(endpoint, payload);

                    const transformedWorkOrders = response.data.map(workOrder => {
                        const newDateStart = formatDate(workOrder.date_start);
                        const translatedStatus = workOrderStatus[workOrder.work_order_status] || workOrder.work_order_status;
                        const formattedPlate = formatPlate(workOrder.vehicle_plate);
                        return {
                            ...workOrder,
                            date_start: newDateStart,
                            work_order_status: translatedStatus,
                            vehicle_plate: formattedPlate,
                            is_billed: workOrder.is_billed,
                        };
                    });

                    setWorkOrders(transformedWorkOrders);
                    setLoading(false);

                } catch (error) {

                    if (error.code === 'ECONNABORTED') {
                        console.error('La solicitud ha superado el tiempo límite.');
                    } else {
                        console.error('Se superó el tiempo límite inténtelo nuevamente.', error.message);
                    }
                    console.log("error obtener ordenes de trabajo", error)
                }
            } else {
                try {
                    const response = await apiClient.get(endpoint);

                    const transformedWorkOrders = response.data.map(workOrder => {
                        const newDateStart = formatDate(workOrder.date_start);
                        const translatedStatus = workOrderStatus[workOrder.work_order_status] || workOrder.work_order_status;
                        const formattedPlate = formatPlate(workOrder.vehicle_plate);
                        return {
                            ...workOrder,
                            date_start: newDateStart,
                            work_order_status: translatedStatus,
                            vehicle_plate: formattedPlate,
                            is_billed: workOrder.is_billed,
                        };
                    });

                    setWorkOrders(transformedWorkOrders);
                    setLoading(false);

                } catch (error) {}
            }
        };

        fetchData();
    }, [searchTerm, selectedOption]);

    useEffect(() => {
        console.log("Valor de selectedOption al regresar:", selectedOption);
    }, [selectedOption]);

    return (

        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <div className="two-column-layout">
                <div className="left-panel">

                    {/*Título del contenedor y cuadro de búsqueda */}
                    <TitleAndSearchBoxSpecial
                        selectedOption={selectedOption}
                        title="Órdenes de Trabajo"
                        onSearchChange={handleSearchWorkOrdersWithDebounce}
                        onButtonClick={openFilterModal}
                        shouldSaveSearch={true}
                    />

                    {/*Lista de órdenes de trabajo */}

                    {loading ? (
                        <div className="loader-container" style={{ marginLeft: '-93px' }}>
                            <PuffLoader color={tertiaryColor} loading={loading} size={60} />
                        </div>
                    ) : (
                        <>
                            <div className="scrollable-list-container">
                                {workOrders.map(workOrderData => (
                                    <div key={workOrderData.id} className="result-work-order" onClick={() => handleShowInformationWorkOrderClick(workOrderData.id)}>
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
                                ))}
                            </div>
                        </>
                    )}

                </div>

                <div className="right-panel">
                    {/*  <CustomButtonContainer>
                        <CustomButton title="AGREGAR ORDEN DE TRABAJO" onClick={handleAddNewWorkOrder} />
                    </CustomButtonContainer>*/}

                </div>
            </div>

            {/*Modal del filtro de búsqueda*/}

            {isFilterModalOpen && (
                <Modal
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    options={['Nombre Titular', 'Placa', 'Código Orden de Trabajo', 'Asignada a', 'Entregada por', 'Creada por']}
                    defaultOption={selectedOption}
                    onOptionChange={handleOptionChange}
                    onSelect={handleSelectClick}
                />
            )}

        </div>

    );

};

export default WorkOrders;