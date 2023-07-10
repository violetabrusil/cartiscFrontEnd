import "../../NewClient.css"
import "../../Modal.css"
import React, { useState } from "react";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import alertIcon from "../../images/icons/alertIcon.png"
import Select from 'react-select';

const NewClient = () => {

    //Variables para el formulario de AddClient
    const [card, setCard] = useState("");
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    //Variables para el formulario de AddCar
    const [carPlate, setCarPlate] = useState("");
    const [year, setYear] = useState("");
    const [typeCar, setTypeCar] = useState(null);
    const [cylinderCapacity, setCylinderCapacity] = useState("");
    const [makeCar, setMakeCar] = useState("");
    const [actualMileage, setActualMileage] = useState("");
    const [isInputFocused, setIsInputFocused] = useState(false);

    // Estado para controlar la visibilidad del formulario
    const [showForm, setShowForm] = useState(false);

    const handleCardChange = (e) => {
        setCard(e.target.value);
    };

    const handleFullNameChange = (e) => {
        setFullName(e.target.value);
    };

    const handleAddressChange = (e) => {
        setAddress(e.target.value);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePhoneChange = (e) => {
        setPhone(e.target.value);
    };

    const handleCarPlateChange = (e) => {
        const value = e.target.value.toUpperCase();
        const regex = /^([A-Z]{0,3})-?(\d{0,4})$/;

        if (regex.test(value)) {
            const formattedValue = value.replace(
                /^([A-Z]{0,3})-?(\d{0,4})$/,
                (match, p1, p2) => {
                    if (p1 && p2) {
                        return p1 + "-" + p2;
                    } else {
                        return value;
                    }
                }
            );
            setCarPlate(formattedValue);
        }
    };

    const handleInputFocus = () => {
        setIsInputFocused(true);
    };

    const handleInputBlur = () => {
        setIsInputFocused(false);
    };

    const handleYearChange = (e) => {
        setYear(e.target.value);
    };

    const handleTypeCarChange = (typeCar) => {
        setTypeCar(typeCar);
    };

    const handleCylinderCapacityChange = (e) => {
        setCylinderCapacity(e.target.value);
    };

    const handleMakeCarChange = (e) => {
        setMakeCar(e.target.value);
    };

    const handleActualMileageChange = (e) => {
        setActualMileage(e.target.value);
    };

    const handleSaveClick = () => {
        // Lógica para guardar los datos del cliente
        console.log("Guardar datos del cliente");
        // Mostrar el formulario
        setShowForm(true);
    };

    const handleAddCarClick = () => {
        // Lógica para guardar los datos del cliente
        console.log("Guardar datos del vehículo");
        openWorkOrderModal();
    };

    const handleAlertClick = () => {
        openAlertModal();
    }

    const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    const openWorkOrderModal = () => {
        setIsWorkOrderModalOpen(true);
    };

    const closeWorkOrderModal = () => {
        setIsWorkOrderModalOpen(false);
    };

    const openAlertModal = () => {
        setIsAlertModalOpen(true);
    };

    const closeAlertModal = () => {
        setIsAlertModalOpen(false);
    };

    const options = [
        { value: 'auto', label: 'Auto' },
        { value: 'camioneta', label: 'Camioneta' },
        { value: 'buseta', label: 'Buseta' },
        { value: 'camion', label: 'Camión' }
    ];

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            className: 'custom-select-control',
            width: '97%', // Estilo personalizado para el ancho
            height: '50px', // Estilo personalizado para la altura
            border: '1px solid rgb(0 0 0 / 34%)', // Estilo personalizado para el borde con el color deseado
            borderRadius: '4px', // Estilo personalizado para el borde redondeado
            padding: '8px',
            marginBottom: '20px',
            marginTop: '8px'
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: '#999', // Color del texto del placeholder
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-select-option',
            // otros estilos personalizados si los necesitas
        }),
    };

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser="Name User" showRol="Rol" />
            <Menu />

            <div className="containerNewClient">
                <div className="left-section-new-client">

                    <div className="containerNewClientTitle">
                        <h2>Información del cliente</h2>
                    </div>

                    <div className="containerNewClient-form">
                        <form>
                            <label className="label-form">
                                Cédula
                                <input className="input-form" type="text" value={card} onChange={handleCardChange} />
                            </label>
                            <label className="label-form">
                                Nombre completo
                                <input className="input-form" type="text" value={fullName} onChange={handleFullNameChange} />
                            </label>
                            <label className="label-form">
                                Dirección
                                <input className="input-form" type="text" value={address} onChange={handleAddressChange} />
                            </label>
                            <label className="label-form">
                                Email
                                <input className="input-form" type="email" value={email} onChange={handleEmailChange} />
                            </label>
                            <label className="label-form">
                                Teléfono
                                <input className="input-form" type="text" value={phone} onChange={handlePhoneChange} />
                            </label>


                        </form>
                    </div>

                    <div className="container-button-next">
                        <button className="button-next" onClick={handleSaveClick}>
                            GUARDAR
                        </button>
                    </div>

                </div>
                <div className="right-section-new-client">
                    {showForm && (
                        <div className="containerNewClientTitle">
                            <h2>Agregar auto</h2>
                        </div>
                    )}
                    {showForm && (
                        <div className="container-add-car-form">
                            <div className="form-scroll">
                                <form>
                                    <div className={`input-container ${isInputFocused ? "active" : ""}`}>
                                        <input className="input-plate" type="text" value={carPlate} onChange={handleCarPlateChange}
                                            onFocus={handleInputFocus} onBlur={handleInputBlur} />
                                        <label>ECUADOR</label>
                                        <button className="button-alert" type="button" onClick={handleAlertClick}>
                                            <img src={alertIcon} className="alert" alt="Alert" />
                                        </button>
                                    </div>

                                    <label className="label-form">
                                        Año
                                        <input className="input-form" type="text" value={year} onChange={handleYearChange} />
                                    </label>
                                    <label className="label-form">
                                        Tipo
                                        <Select
                                            options={options}
                                            value={typeCar}
                                            onChange={handleTypeCarChange}
                                            styles={customStyles}
                                            placeholder="Seleccionar" />
                                    </label>
                                    <label className="label-form">
                                        Cilindraje
                                        <input className="input-form" type="text" value={cylinderCapacity} onChange={handleCylinderCapacityChange} />
                                    </label>
                                    <label className="label-form">
                                        Marca
                                        <input className="input-form" type="email" value={makeCar} onChange={handleMakeCarChange} />
                                    </label>
                                    <label className="label-form">
                                        Teléfono
                                        <input className="input-form" type="text" value={actualMileage} onChange={handleActualMileageChange} />
                                    </label>
                                </form>
                            </div>
                        </div>
                    )}
                    {showForm && (
                        <div className="container-button-next">
                            <button className="button-next" onClick={handleAddCarClick}>
                                GUARDAR
                            </button>
                        </div>
                    )}

                </div>

                {/*Modal para generar una orden de trabajo */}

                {isWorkOrderModalOpen && (
                    <div className="filter-modal-overlay">
                        <div className="filter-modal">
                            <h3 style={{ textAlign: "center" }}>Desea generar una nueva orden de trabajo?</h3>
                            <div className="button-options">
                                <div className="half">
                                    <button className="optionNo-button" onClick={closeWorkOrderModal}>
                                        No
                                    </button>
                                </div>
                                <div className="half">
                                    <button className="optionYes-button" onClick={closeWorkOrderModal}>
                                        Si
                                    </button>

                                </div>
                            </div>

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
    );
};

export default NewClient;
