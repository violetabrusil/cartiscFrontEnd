import "../../NewClient.css";
import "../../Modal.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useContext } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import Select from 'react-select';
import apiClient from "../../services/apiClient";
import ModalNewClient from "../../modal/ModalNewClient";
import { CustomPlaceholder } from "../../customPlaceholder/CustomPlaceholder";
import ClientContext from "../../contexts/ClientContext";

const alertIcon = process.env.PUBLIC_URL + "/images/icons/alertIcon.png";
const checkedIcon = process.env.PUBLIC_URL + "/images/icons/checkedIcon.png";
const canceledIcon = process.env.PUBLIC_URL + "/images/icons/canceledIcon.png";
const cedulaIcon = process.env.PUBLIC_URL + "/images/icons/cedula.png";
const nameIcon = process.env.PUBLIC_URL + "/images/icons/name.png";
const addressIcon = process.env.PUBLIC_URL + "/images/icons/address.png";
const emailIcon = process.env.PUBLIC_URL + "/images/icons/email.png";
const phoneIcon = process.env.PUBLIC_URL + "/images/icons/phone.png";
const yearIcon = process.env.PUBLIC_URL + "/images/icons/year.png";
const kmIcon = process.env.PUBLIC_URL + "/images/icons/km.png";
const brandIcon = process.env.PUBLIC_URL + "/images/icons/brand.png";
const modelIcon = process.env.PUBLIC_URL + "/images/icons/model.png";
const motorIcon = process.env.PUBLIC_URL + "/images/icons/engine.png";
const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";
const arrowLeftIcon = process.env.PUBLIC_URL + "/images/icons/arrowLeftIcon.png";

const NewClient = () => {

    //Variables para el formulario de AddClient
    const [cedula, setCedula] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [userData, setUserData] = useState([]);
    const { setSelectedClient } = useContext(ClientContext);

    //Variables para el formulario de AddCar
    const [carPlate, setCarPlate] = useState("");
    const [year, setYear] = useState("");
    const [category, setCategory] = useState("");
    const [km, setKm] = useState("");
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [motor, setMotor] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const { setSelectedVehicle } = useContext(ClientContext);

    const navigate = useNavigate();

    // Estado para controlar la visibilidad del formulario
    const [showForm, setShowForm] = useState(false);

    //Estado para controlar la visibilidad del modal 
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');

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

    const handleTypeCarChange = (selectedOptionCategoryCar) => {
        setCategory(selectedOptionCategoryCar.value);
    };

    const handleSaveClick = async (event) => {
        // Para evitar que el formulario recargue la página
        event.preventDefault();
    
        try {
            const response = await apiClient.post('/clients/register', { cedula, name, address, phone, email });
            
            toast.success('Cliente registrado', {
                position: toast.POSITION.TOP_RIGHT
            });
            setTimeout(() => {
                setShowModal(true);
                setModalType('success');
            }, 3000);
            setUserData(response.data);
            setSelectedClient(response.data);
    
        } catch (error) {

            if (error.response && error.response.status === 400 && error.response.data.errors) {
                // Muestra los errores en toasts
                error.response.data.errors.forEach(err => {
                    toast.error(`${err.field}: ${err.message}`, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                });
            }
        }
    };    

    const handleYes = () => {
        setShowModal(false);
        setShowForm(true);
    };

    const handleNo = () => {
        setShowModal(false);
        navigate("/clients");
    };

    const handleReturn = () => {
        setShowModal(false);
        setModalType(''); // Opcional, para restablecer el tipo de modal.
    };

    const transformPlateForSaving = (plateWithDash) => {
        return plateWithDash.replace(/-/g, '');
    };

    const handleAddVehicle = async (event) => {
        // Para evitar que el formulario recargue la página
        const client_id = userData.id;
        const plate = transformPlateForSaving(carPlate);
        event.preventDefault();
        try {
            const response = await apiClient.post('/vehicles/register', { client_id, category, plate, brand, model, year, motor, km });
            setSelectedVehicle(response.data);
            toast.success('Vehículo registrado', {
                position: toast.POSITION.TOP_RIGHT
            });
            setTimeout(() => {
                openWorkOrderModal();
            }, 3000);

        } catch (error) {
            toast.error('Error al guardar un vehiculo', {
                position: toast.POSITION.TOP_RIGHT
            });
        }

    };

    const handleAlertClick = () => {
        openAlertModal();
    };

    const handleAddWorkOrder = () => {
        navigate("/workOrders/newWorkOrder")
    };

    const handleGoBack = () => {
        navigate("/clients");
    };

    const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    const openWorkOrderModal = () => {
        setIsWorkOrderModalOpen(true);
    };

    const closeWorkOrderModal = () => {
        setIsWorkOrderModalOpen(false);
        navigate("/clients")
    };

    const openAlertModal = () => {
        setIsAlertModalOpen(true);
    };

    const closeAlertModal = () => {
        setIsAlertModalOpen(false);
    };

    const options = [
        { value: 'car', label: 'Auto' },
        { value: 'van', label: 'Camioneta' },
        { value: 'bus', label: 'Buseta' },
        { value: 'truck', label: 'Camión' }
    ];

    const isTabletLandscape = window.matchMedia("(min-width: 800px) and (max-width: 1340px) and (orientation: landscape)").matches;

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            className: 'custom-select-control',
            width: isTabletLandscape ? '96%' : '98%', // Estilo personalizado para el ancho
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
        menu: (provided, state) => ({
            ...provided,
            width: '100%', // puedes ajustar el ancho del menú aquí
        }),
    };

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <ToastContainer />

            <div className="containerNewClient">
                <div className="left-section-new-client">

                    <div className="containerNewClientTitle">
                        <button onClick={handleGoBack} className="button-arrow">
                            <img src={arrowLeftIcon} className="arrow-icon" alt="Arrow Icon" />
                        </button>
                        <h2>Información del cliente</h2>
                    </div>

                    <div className="containerNewClient-form">
                        <form>
                            <label className="label-form">
                                Cédula
                                <div className="input-form-new-client">
                                    <input
                                        className="input-form"
                                        type="text"
                                        value={cedula}
                                        onChange={(e) => setCedula(e.target.value)}
                                    />

                                    <img
                                        src={cedulaIcon}
                                        alt="Id Icon"
                                        className="input-new-client-icon"
                                    />
                                </div>

                            </label>
                            <label className="label-form">
                                Nombre completo
                                <div className="input-form-new-client">
                                    <input
                                        className="input-form"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />

                                    <img
                                        src={nameIcon}
                                        alt="Name Icon"
                                        className="input-new-client-icon"
                                    />
                                </div>

                            </label>
                            <label className="label-form">
                                Dirección
                                <div className="input-form-new-client">
                                    <input
                                        className="input-form"
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />

                                    <img
                                        src={addressIcon}
                                        alt="Address Icon"
                                        className="input-new-client-icon"
                                    />
                                </div>

                            </label>
                            <label className="label-form">
                                Email
                                <div className="input-form-new-client">
                                    <input
                                        className="input-form"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />

                                    <img
                                        src={emailIcon}
                                        alt="Email Icon"
                                        className="input-new-client-icon"
                                    />
                                </div>

                            </label>
                            <label className="label-form">
                                Teléfono
                                <div className="input-form-new-client">
                                    <input
                                        className="input-form"
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />

                                    <img
                                        src={phoneIcon}
                                        alt="Phone Icon"
                                        className="input-new-client-icon"
                                    />
                                </div>

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
                            <button onClick={handleGoBack} className="button-arrow-new-client">
                                <img src={arrowLeftIcon} className="arrow-icon-new-client" alt="Arrow Icon" />
                            </button>
                            <h2>Agregar auto</h2>
                        </div>
                    )}
                    {showForm && (
                        <div className="container-add-car-form">
                            <div className="form-scroll">
                                <form>
                                    <ToastContainer />
                                    <div className={`input-container ${isInputFocused ? "active" : ""}`}>
                                        <input
                                            className="input-plate"
                                            type="text"
                                            value={carPlate}
                                            onChange={handleCarPlateChange}
                                            onFocus={handleInputFocus}
                                            onBlur={handleInputBlur}
                                        />
                                        <img src={flagIcon} alt="Flag" className="flag-icon" />
                                        <label className="label-new-plate-vehicle">ECUADOR</label>
                                        {/* <button className="button-alert" type="button" onClick={handleAlertClick}>
                                            <img src={alertIcon} className="alert" alt="Alert" />
                    </button> */}
                                    </div>

                                    <label className="label-form">
                                        Año
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-add-vehicle"
                                                type="number"
                                                value={year}
                                                onChange={(e) => setYear(parseInt(e.target.value))}
                                            />

                                            <img
                                                src={yearIcon}
                                                alt="Year Icon"
                                                className="input-new-client-icon"
                                            />

                                        </div>

                                    </label>
                                    <label className="label-form">
                                        Categoría

                                        <Select
                                            components={{ Placeholder: CustomPlaceholder }}
                                            isSearchable={false}
                                            options={options}
                                            value={options.find(option => option.value === category)}
                                            onChange={handleTypeCarChange}
                                            styles={customStyles}
                                            placeholder="Seleccionar"
                                            menuPortalTarget={document.body} />

                                    </label>
                                    <label className="label-form">
                                        Kilometraje actual
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-add-vehicle"
                                                type="number"
                                                value={km}
                                                onChange={(e) => setKm(parseInt(e.target.value))}
                                            />

                                            <img
                                                src={kmIcon}
                                                alt="Km Icon"
                                                className="input-new-client-icon"
                                                style={{ width: '30px' }}
                                            />
                                        </div>

                                    </label>
                                    <label className="label-form">
                                        Marca
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-add-vehicle"
                                                type="text"
                                                value={brand}
                                                onChange={(e) => setBrand(e.target.value)}
                                            />
                                            <img
                                                src={brandIcon}
                                                alt="Brand Icon"
                                                className="input-new-client-icon"
                                            />

                                        </div>

                                    </label>
                                    <label className="label-form">
                                        Modelo
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-add-vehicle"
                                                type="text"
                                                value={model}
                                                onChange={(e) => setModel(e.target.value)}
                                            />
                                            <img
                                                src={modelIcon}
                                                alt="Model Icon"
                                                className="input-new-client-icon"
                                                style={{ top: '35%' }}
                                            />

                                        </div>

                                    </label>
                                    <label className="label-form">
                                        Motor
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-add-vehicle"
                                                type="number"
                                                value={motor}
                                                onChange={(e) => setMotor(e.target.value)}
                                            />
                                            <img
                                                src={motorIcon}
                                                alt="Motor Icon"
                                                className="input-new-client-icon"

                                            />
                                        </div>

                                    </label>
                                </form>
                            </div>
                        </div>
                    )}
                    {showForm && (
                        <div className="container-button-next">
                            <button className="button-next" onClick={handleAddVehicle}>
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
                                    <button className="optionYes-button" onClick={handleAddWorkOrder}>
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

            {showModal && (
                <ModalNewClient
                    primaryMessage={modalType === 'success' ?
                        "El cliente se registró exitosamente" : "Ha ocurrido un error"}
                    secondaryMessage={modalType === 'success' ?
                        "Desea agregar un vehículo" : "Intente nuevamente en unos minutos, si persiste contacte con soporte"}
                    handleNo={handleNo}
                    handleYes={modalType === 'error' ? handleReturn : handleYes}
                    icon={modalType === 'success' ? checkedIcon : canceledIcon}
                    modalType={modalType}
                />
            )}



        </div>
    );
};

export default NewClient;
