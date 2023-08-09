import "../../Clients.css";
import "../../Modal.css";
import "../../NewClient.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import Modal from "../../modal/Modal";

const clientIcon = process.env.PUBLIC_URL + "/images/icons/userIcon-gray.png";
const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
const carIcon = process.env.PUBLIC_URL + "/images/icons/carIcon-gray.png";
const unavailableIcon = process.env.PUBLIC_URL + "/images/icons/unavailableIcon.png";
const autoIcon = process.env.PUBLIC_URL + "/images/icons/autoIcon.png";
const busetaIcon = process.env.PUBLIC_URL + "/images/icons/busIcon.png";
const camionetaIcon = process.env.PUBLIC_URL + "/images/icons/camionetaIcon.png";
const camionIcon = process.env.PUBLIC_URL + "/images/icons/camionIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const alertIcon = process.env.PUBLIC_URL + "/images/icons/alertIcon.png";
const deleteIcon = process.env.PUBLIC_URL + "/images/icons/deleteIcon.png";

const Clients = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const navigate = useNavigate();
    const [showClientInformation, setShowClientInformation] = useState(false);
    const [showClientCarInformation, setShowClientCarInformation] = useState(false);
    const [showTitle, setShowTitle] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    const handleSearchClientChange = (newSearchTerm) => {
        setSearchTerm(newSearchTerm);
        // Aquí puedes hacer cualquier otra lógica que necesites cuando cambie el término de búsqueda
    };

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const handleSelectClick = () => {
        // Aquí se puede manejar la opción seleccionada.
        console.log(selectedOption);

        // Cerrar el modal después de seleccionar.
        closeFilterModal();
    };

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

    const handleAddClient = () => {
        // Redirige a la página deseada
        navigate("/clients/newClient");
    };

    const handleClientInformation = (event) => {
        event.stopPropagation();
        setShowClientInformation(true);
        setShowClientCarInformation(false);
        setShowTitle(false);
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
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <div className="containerClients">
                <div className="left-section">
                    {/*Título del contenedor con el botón para filtrar búsqueda */}
                    <TitleAndSearchBox
                        title="Clientes"
                        onSearchChange={handleSearchClientChange}
                        onButtonClick={openFilterModal}
                    />

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
                        <div className="container-title-client">
                            <h2>Autos</h2>
                            <button className="button-add-car" onClick={openFilterModal}>
                                <img src={addIcon} alt="Add Car Icon" className="button-add-car-icon" />
                            </button>
                        </div>
                    )}

                    {/* Aquí colocamos los componentes para la sección derecha */}
                    {!showClientCarInformation && !showClientInformation && (
                        <div className="container-button-add-client">
                            <button className="button-add-client" onClick={handleAddClient} >
                                <span className="text-button-add-client">AGREGAR CLIENTE</span>
                            </button>
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
                            <div className="container-title-client">
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
                <Modal
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    options={['Cédula', 'Nombre']}
                    onOptionChange={handleOptionChange}
                    onSelect={handleSelectClick}
                />
            )}

        </div>
    );
};

export default Clients;
