import "../../Clients.css";
import "../../Modal.css";
import "../../NewClient.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import filterIcon from "../../images/icons/filterIcon.png";
import searchIcon from "../../images/icons/searchIcon.png";
import clientIcon from "../../images/icons/userIcon-gray.png";
import eyeIcon from "../../images/icons/eyeIcon.png";
import carIcon from "../../images/icons/carIcon-gray.png";
import unavailableIcon from "../../images/icons/unavailableIcon.png";
import autoIcon from "../../images/icons/autoIcon.png";
import busetaIcon from "../../images/icons/busIcon.png";
import camionetaIcon from "../../images/icons/camionetaIcon.png";
import camionIcon from "../../images/icons/camionIcon.png";
import addIcon from "../../images/icons/addIcon.png";
import alertIcon from "../../images/icons/alertIcon.png";
import deleteIcon from "../../images/icons/deleteIcon.png";

const Clients = () => {

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const navigate = useNavigate();
    const [showClientInformation, setShowClientInformation] = useState(false);
    const [showClientCarInformation, setShowClientCarInformation] = useState(false);
    const [showTitle, setShowTitle] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    const [vehicles] = useState([
        { type: "auto", plate: "ABC123" },
        { type: "buseta", plate: "GHI789" },
        { type: "camioneta", plate: "DEF456" },
        { type: "camion", plate: "JKL012" },
    ]);

    // Divide los vehículos en grupos de dos
    const vehicleGroups = vehicles.reduce((acc, vehicle, index) => {
        if (index % 2 === 0) {
            acc.push(vehicles.slice(index, index + 2));
        }
        return acc;
    }, []);

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const handleAddClient = () => {
        // Redirige a la página deseada
        navigate("/clients/newClient");
    };

    const handleClientInformation = (event) => {
        event.stopPropagation();
        setShowClientInformation(true);
        setShowClientCarInformation(false);
        setShowTitle(true);
    };

    const handleClientCarInformation = () => {
        setShowClientInformation(false);
        setShowClientCarInformation(true);
        setShowTitle(true);
    };

    const handleCarInformation = (vehicle, event) => {
        event.stopPropagation();
        setSelectedVehicle(vehicle);
    }

    const handleInputFocus = () => {
        setIsInputFocused(true);
    };

    const handleInputBlur = () => {
        setIsInputFocused(false);
    };

    const openAlertModal = () => {
        setIsAlertModalOpen(true);
    };

    const closeAlertModal = () => {
        setIsAlertModalOpen(false);
    };

    const handleAlertClick = () => {
        openAlertModal();
    }

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser="Name User" showRol="Rol" />
            <Menu />

            <div className="containerClients">
                <div className="left-section">
                    {/*Título del contenedor con el botón para filtrar búsqueda */}
                    <div className="containerTitle">
                        <h2>Clientes</h2>
                        <button className="button-filter" onClick={openFilterModal}>
                            <img src={filterIcon} alt="Filter Icon" className="button-icon" />
                            <span className="button-text">Filtro</span>
                        </button>
                    </div>
                    {/*Buscador*/}
                    <div className="search-box">
                        <img src={searchIcon} alt="Search Icon" className="search-icon" />
                        <input type="text" className="search-input" />
                    </div>
                    {/*Lista de clientes*/}
                    <div className="result-client" onClick={handleClientCarInformation}>
                        <div className="first-result">
                            <img src={clientIcon} alt="Client Icon" className="icon-client" />
                            <div className="container-data">
                                <label className="name-client">Daniel Taco</label>
                                <div className="container-car-number">
                                    <label className="car-number">1</label>
                                    <img src={carIcon} alt="Car client" className="icon-car"></img>
                                </div>

                            </div>
                        </div>

                        <div className="second-result">
                            <button className="button-eye" onClick={handleClientInformation}>
                                <img src={eyeIcon} alt="Eye Icon" className="icon-eye" />
                            </button>
                        </div>

                    </div>
                </div>
                <div className="right-section">

                    {!selectedVehicle && showTitle && (
                        <div className="containerTitle">
                            <h2>Autos</h2>
                            <button className="button-add-car" onClick={openFilterModal}>
                                <img src={addIcon} alt="Add Car Icon" className="button-add-car-icon" />
                            </button>
                        </div>
                    )}

                    {/* Aquí colocamos los componentes para la sección derecha */}
                    {!showClientCarInformation && !showClientInformation && (
                        <div className="container-button-add-client">
                            <button className="button-add-client" onClick={handleAddClient} >AGREGAR CLIENTE</button>
                        </div>

                    )}

                    {/*Información del o los vehículos del cliente */}

                    {!selectedVehicle && showClientCarInformation && !showClientInformation && (

                        <div className="vehicle-info">

                            {vehicleGroups.map((group, index) => (
                                <div key={index} className="vehicle-group">
                                    {group.map((vehicle, innerIndex) => (
                                        <div key={innerIndex} className="vehicle" onClick={(event) => handleCarInformation(vehicle, event)}>
                                            <div className="vehicle-content">
                                                {vehicle.type === "auto" && (
                                                    <img src={autoIcon} alt="Auto Icon" className="auto-icon" />
                                                )}
                                                {vehicle.type === "camioneta" && (
                                                    <img src={camionetaIcon} alt="Camioneta Icon" className="camioneta-icon" />
                                                )}
                                                {vehicle.type === "buseta" && (
                                                    <img src={busetaIcon} alt="Buseta Icon" className="buseta-icon" />
                                                )}
                                                {vehicle.type === "camion" && (
                                                    <img src={camionIcon} alt="Camion Icon" className="camion-icon" />
                                                )}
                                                <label className="vehicle-plate">{vehicle.plate}</label>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                    )}

                    {/*Información del cliente */}

                    {showClientInformation && !showClientCarInformation && (
                        <div>
                            <div className="containerTitle">
                                <h2>Información del cliente</h2>
                                <button className="button-unavailable">
                                    <img src={unavailableIcon} alt="Unavailable Icon" className="button-unavailable-icon" />
                                </button>
                            </div>

                            <div className="containerNewClient-form">
                                <form>
                                    <label className="label-form">
                                        Cédula
                                        <input className="input-form" type="text" />
                                    </label>
                                    <label className="label-form">
                                        Nombre completo
                                        <input className="input-form" type="text" />
                                    </label>
                                    <label className="label-form">
                                        Dirección
                                        <input className="input-form" type="text" />
                                    </label>
                                    <label className="label-form">
                                        Email
                                        <input className="input-form" type="email" />
                                    </label>
                                    <label className="label-form">
                                        Teléfono
                                        <input className="input-form" type="text" />
                                    </label>


                                </form>
                            </div>

                        </div>



                    )}

                    {/*Información del vehículo del cliente */}

                    {selectedVehicle && (
                        <div className="containerNewClientTitle">
                            <h2>Daniel Taco</h2>
                            <button className="button-delete">
                                <img src={deleteIcon} alt="Delete Icon" className="button-delete-icon" />
                            </button>
                        </div>
                    )}

                    {selectedVehicle && (
                        <div className="container-add-car-form">
                            <div className="form-scroll">
                                <form>
                                    <div className={`input-container ${isInputFocused ? "active" : ""}`}>
                                        <input className="input-plate" type="text" onFocus={handleInputFocus} onBlur={handleInputBlur} />
                                        <label>ECUADOR</label>
                                        <button className="button-alert" type="button" onClick={handleAlertClick}>
                                            <img src={alertIcon} className="alert" alt="Alert" />
                                        </button>
                                    </div>

                                    <label className="label-form">
                                        Año
                                        <input className="input-form" type="text" />
                                    </label>
                                    <label className="label-form">
                                        Tipo
                                        <input className="input-form" type="text" />
                                    </label>
                                    <label className="label-form">
                                        Cilindraje
                                        <input className="input-form" />
                                    </label>
                                    <label className="label-form">
                                        Marca
                                        <input className="input-form" />
                                    </label>
                                    <label className="label-form">
                                        Teléfono
                                        <input className="input-form" type="text" />
                                    </label>
                                </form>
                            </div>
                        </div>
                    )}

                    {/*Modal para alertas */}

                    {isAlertModalOpen && (
                        <div className="filter-modal-overlay">
                            <div className="filter-modal">
                                <h3>Alertas</h3>
                                <div className="button-options">
                                    <div className="half">
                                        <button className="optionNo-button" onClick={closeAlertModal}>
                                            No
                                        </button>
                                    </div>
                                    <div className="half">
                                        <button className="optionYes-button" onClick={closeAlertModal}>
                                            Si
                                        </button>

                                    </div>
                                </div>

                            </div>
                        </div>
                    )}


                </div>
            </div>

            {/*Modal del filtro de búsqueda*/}

            {isFilterModalOpen && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal">
                        <h3>Seleccione el filtro a buscar</h3>
                        <div className="filter-options">
                            <label>
                                <input type="radio" name="filter" value="cedula" />
                                Cédula
                            </label>
                            <label>
                                <input type="radio" name="filter" value="nombre" />
                                Nombre
                            </label>
                        </div>
                        <button className="modal-button" onClick={closeFilterModal}>
                            Seleccionar
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Clients;
