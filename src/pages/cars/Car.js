import "../../Car.css";
import "../../Modal.css";
import "../../NewClient.css";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { Calendar } from "../../calendar/Calendar";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import Modal from "../../modal/Modal";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import "react-datepicker/dist/react-datepicker.css";

const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
const iconAlertWhite = process.env.PUBLIC_URL + "/images/icons/alerIconWhite.png";
const deleteIcon = process.env.PUBLIC_URL + "/images/icons/deleteIcon.png";
const alertIcon = process.env.PUBLIC_URL + "/images/icons/alertIcon.png";
const sortLeftIcon = process.env.PUBLIC_URL + "/images/icons/sortLeftIcon.png";

const Cars = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [showCarInformation, setShowCarInformation] = useState(false);
    const [showCarHistory, setShowCarHistory] = useState(false);
    const [selectedDate, setSelectedDate] = React.useState(null); // Estado para almacenar la fecha seleccionada 
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [showMaintenance, setShowMaintenance] = useState(false);
    const options = ['Cambio de aceite', 'Cambio de motor'];
    const [selectedOptions, setSelectedOptions] = useState([]);

    const handleSearchCarChange = (newSearchTerm) => {
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

    const handleCarHistory = (event) => {
        event.stopPropagation();
        setShowCarHistory(true);
        setShowCarInformation(false);
        setShowMaintenance(false);
    }

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleCarInformation = (event) => {
        event.stopPropagation();
        setShowCarInformation(true)
        setShowCarHistory(false)
        setShowMaintenance(false);
    };

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

    const handleMaintenance = (event) => {
        event.stopPropagation();
        setShowCarHistory(false);
        setShowCarInformation(false);
        setShowMaintenance(true);
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setSelectedOptions(prev => {
            if (checked) {
                // Si el checkbox está seleccionado, agrega la opción a la lista de seleccionados
                return [...prev, name];
            } else {
                // Si el checkbox está deseleccionado, quita la opción de la lista de seleccionados
                return prev.filter(option => option !== name);
            }
        });
    };

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <div className="containerCars">
                <div className="left-section">
                    {/*Título del contenedor y cuadro de búsqueda */}
                    <TitleAndSearchBox
                        title="Autos"
                        onSearchChange={handleSearchCarChange}
                        onButtonClick={openFilterModal}
                    />

                    {/*Lista de vehículos */}
                    <div className="result-car" onClick={handleCarHistory}>
                        <div className="first-result-car">
                            <label>PJL-568</label>
                        </div>
                        <div className="second-result-car">
                            <label>Daniel Taco</label>
                        </div>
                        <div className="third-result-car">
                            <button className="button-eye-car">
                                <img src={eyeIcon} alt="Eye Icon Car" className="icon-eye-car"
                                    onClick={handleCarInformation} />
                            </button>
                        </div>

                    </div>


                </div>

                <div className="right-section">
                    {showCarHistory && !showCarInformation && !showMaintenance && (
                        <div>
                            <div className="containerTitle-car-maintenance">
                                <label className="label-maintenance"></label>
                                <button className="button-maintenance" onClick={handleMaintenance}>
                                    <span className="button-maintenance-text">Mantenimiento</span>
                                    <img src={iconAlertWhite} className="icon-alert-white" alt="Icon Maintenance" />
                                </button>
                            </div>

                            <div className="container-maintenance-filter">
                                <h4>Historial de Operaciones</h4>
                                <button className="button-maintenance-filter">
                                    <span className="button-maintenance-text-filter">Filtro</span>
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={handleDateChange}
                                        customInput={<Calendar />}
                                    />
                                </button>
                            </div>


                        </div>
                    )}

                    {showCarInformation && !showCarHistory && !showMaintenance && (
                        <div>
                            <div className="containerNewClientTitle">
                                <h2>Daniel Taco</h2>
                                <button className="button-delete">
                                    <img src={deleteIcon} alt="Delete Icon" className="button-delete-icon" />
                                </button>
                            </div>

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

                        </div>
                    )}

                    {showMaintenance && !showCarHistory && !showCarInformation && (
                        <div>

                            <div className="containerNewClientTitle">
                                <button className="button-sort" onClick={handleCarHistory}>
                                    <img src={sortLeftIcon} alt="Sort left Icon" className="icon-sort" />
                                </button>
                                <h2 style={{ marginLeft: "8px" }}>Mantenimiento</h2>
                            </div>

                            <div>
                                {options.map((option, index) => (
                                    <div
                                        key={index}
                                        className="container-checkbox"
                                    >
                                        <div
                                            className="label-checkbox"
                                        >
                                            <span>{option}</span>
                                        </div>
                                        <div>
                                            <input
                                                type="checkbox"
                                                name={option}
                                                onChange={handleCheckboxChange}
                                                className="input-checkbox"
                                            />
                                        </div>
                                    </div>
                                ))}
                                { /*<div>Selected options: {selectedOptions.join(', ')}</div> */}

                            </div>

                        </div>
                    )}

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
    )

};

export default Cars;



