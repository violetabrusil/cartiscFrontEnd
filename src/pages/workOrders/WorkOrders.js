import "../../WorkOrders.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';
import { ToastContainer } from "react-toastify";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import Modal from "../../modal/Modal";
import apiClient from "../../services/apiClient";
import { CustomButtonContainer, CustomButton } from "../../customButton/CustomButton";
import { workOrderStatus } from "../../constants/workOrderConstants";

const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";

const WorkOrders = () => {

    const [selectedOption, setSelectedOption] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [workOrders, setWorkOrders] = useState([]);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearchWorOrderChange = (term, filter) => {
        console.log(term, filter);
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
        console.log(option);
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

    useEffect(() => {
        const fetchData = async () => {
            let endpoint = '/work-orders/all';
            if (searchTerm) {
                switch (selectedOption) {
                    case 'Placa':
                        //endpoint = `/vehicles/search/${searchTypePlate}/${searchTerm}`;
                        break;
                    case 'Nombre Titular':
                        //endpoint = `/vehicles/search/${searchTypeClientName}/${searchTerm}`;
                        break;
                    default:
                        break;
                }
            }
            try {
                const response = await apiClient.get(endpoint);

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
                console.log("respuesta servidor", transformedWorkOrders);

            } catch (error) {
                console.log("Error al obtener las órdenes de trabajo", error);
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
                    <div className="container-list-work-orders">
                        {workOrders.map(workOrderData => (
                            <div key={workOrderData.id} className="result-work-order">
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
                    options={['Placa', 'Nombre Titular']}
                    onOptionChange={handleOptionChange}
                    onSelect={handleSelectClick}
                />
            )}

        </div>

    );

};

export default WorkOrders;