import "../../WorkOrders.css";
import "../../Loader.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';
import { ToastContainer } from "react-toastify";
import PuffLoader from "react-spinners/PuffLoader";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import Modal from "../../modal/Modal";
import apiClient from "../../services/apiClient";
import { CustomButtonContainer, CustomButton } from "../../customButton/CustomButton";
import { workOrderStatus } from "../../constants/workOrderConstants";

const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";

const WorkOrders = () => {

    const [selectedOption, setSelectedOption] = useState('Placa');
    const [searchTerm, setSearchTerm] = useState('');
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
        // Aquí se puede manejar la opción seleccionada.
        setSelectedOption(option);
        // Cerrar el modal después de seleccionar.
        closeFilterModal();
    };

    function formatDate(isoDate) {
        const date = new Date(isoDate);
        const day = String(date.getUTCDate()).padStart(2, '0');  // Usamos getUTCDate en lugar de getDate
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Usamos getUTCMonth en lugar de getMonth
        const year = date.getUTCFullYear();  // Usamos getUTCFullYear en lugar de getFullYear

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
        return plateInput; // Devuelve la placa sin cambios si no cumple con el formato esperado.
    };

    const statusColors = {
        "Por iniciar": "#316EA8",
        "Asignada": "#0C1F31",
        "En ejecución": "#4caf50",
        "En espera": "#fbc02d",
        "Cancelada": "#e74c3c",
        "Completada": "#2e7d32",
        "Eliminada": "#6E757D"
    };

    const handleAddNewWorkOrder = () => {
        // Redirige a la página deseada
        navigate("/workOrders/newWorkOrder");
    };

    const handleShowInformationWorkOrderClick = (workOrderId) => {
        navigate(`/workOrders/detailWorkOrder/${workOrderId}`);
    };

    useEffect(() => {
        console.log("buscar", searchTerm, selectedOption);
    
        const fetchData = async () => {
            let endpoint = '/work-orders/all';
            const searchByVehiclePlate = "vehicle_plate";
            const searchByWorkOrderCode = "work_order_code";
            const searchByNameClient = "client_name";
            const searchAssigned = "assigned";
            const searchDelivered_by = "delivered_by";
            const searchCreated_by = "created_by";
    
            let requestConfig = {};  // Configuración adicional para las solicitudes POST
    
            if (searchTerm) {
                // Si hay un término de búsqueda, cambia a la búsqueda POST
                endpoint = '/work-orders/search';
                let searchField = '';
                switch (selectedOption) {
                    case 'Placa':
                        searchField = searchByVehiclePlate;
                        break;
                    case 'Código Orden de Trabajo':
                        searchField = searchByWorkOrderCode;
                        break;
                    case 'Nombre Titular':
                        searchField = searchByNameClient;
                        break;
                    case 'Asignada a':
                        searchField = searchAssigned;
                        break;
                    case 'Entregada por':
                        searchField = searchDelivered_by;
                        break;
                    case 'Creada por':
                        searchField = searchCreated_by;
                        break;
                    default:
                        break;
                }
    
                // Configuración para la solicitud POST
                const payload = {
                    [searchField]: searchTerm,
                };
                console.log("payload a enviar", payload)
    
                requestConfig = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: payload,
                };
            }
            
            console.log("datos a enviar", requestConfig)
            try {
                const response = await apiClient(endpoint, requestConfig);
                console.log("endpoint", apiClient(requestConfig))
                console.log("respuesta", response.data)
                
    
                // Transformamos la fecha y el status de cada work order
                const transformedWorkOrders = response.data.map(workOrder => {
                    const newDateStart = formatDate(workOrder.date_start);
                    const translatedStatus = workOrderStatus[workOrder.work_order_status] || workOrder.work_order_status;
                    const formattedPlate = formatPlate(workOrder.vehicle_plate);
                    return {
                        ...workOrder,
                        date_start: newDateStart,
                        work_order_status: translatedStatus,
                        vehicle_plate: formattedPlate
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
            }
        }
    
        fetchData();
    }, [searchTerm, selectedOption]);

    return (

        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <ToastContainer />

            <div className="work-order-container">
                <div className="left-section-work-order">

                    {/*Título del contenedor y cuadro de búsqueda */}
                    <TitleAndSearchBox
                        selectedOption={selectedOption}
                        title="Órdenes de Trabajo"
                        onSearchChange={handleSearchWorkOrdersWithDebounce}
                        onButtonClick={openFilterModal}
                    />

                    {/*Lista de órdenes de trabajo */}

                    {loading ? (
                        <div className="loader-container" style={{ marginLeft: '-93px' }}>
                            <PuffLoader color="#316EA8" loading={loading} size={60} />
                        </div>
                    ) : (
                        <>
                            <div className="container-list-work-orders">
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

                                    </div>
                                ))}
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

            {/*Modal del filtro de búsqueda*/}

            {isFilterModalOpen && (
                <Modal
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    options={['Placa', 'Código Orden de Trabajo', 'Nombre Titular', 'Asignada a', 'Entregada por', 'Creada por']}
                    defaultOption="Placa"
                    onOptionChange={handleOptionChange}
                    onSelect={handleSelectClick}
                />
            )}

        </div>

    );

};

export default WorkOrders;