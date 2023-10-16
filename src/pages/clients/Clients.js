import "../../Clients.css";
import "../../Modal.css";
import "../../NewClient.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify'
import { debounce } from 'lodash';
import Select from 'react-select';
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import apiClient from "../../services/apiClient";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import Modal from "../../modal/Modal";
import { getVehicleCategory } from "../../constants/vehicleCategoryConstants";
import { CustomButtonContainer, CustomButton } from "../../customButton/CustomButton";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import { CustomPlaceholder } from "../../customPlaceholder/CustomPlaceholder";

const clientIcon = process.env.PUBLIC_URL + "/images/icons/userIcon-gray.png";
const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
const autoIcon = process.env.PUBLIC_URL + "/images/icons/autoIcon.png";
const busetaIcon = process.env.PUBLIC_URL + "/images/icons/busIcon.png";
const camionetaIcon = process.env.PUBLIC_URL + "/images/icons/camionetaIcon.png";
const camionIcon = process.env.PUBLIC_URL + "/images/icons/camionIcon.png";
//const alertIcon = process.env.PUBLIC_URL + "/images/icons/alertIcon.png";
const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";
const cedulaIcon = process.env.PUBLIC_URL + "/images/icons/cedula.png";
const nameIcon = process.env.PUBLIC_URL + "/images/icons/name.png";
const addressIcon = process.env.PUBLIC_URL + "/images/icons/address.png";
const emailIcon = process.env.PUBLIC_URL + "/images/icons/email.png";
const phoneIcon = process.env.PUBLIC_URL + "/images/icons/phone.png";
const categoryIcon = process.env.PUBLIC_URL + "/images/icons/category.png";
const yearIcon = process.env.PUBLIC_URL + "/images/icons/year.png";
const kmIcon = process.env.PUBLIC_URL + "/images/icons/km.png";
const brandIcon = process.env.PUBLIC_URL + "/images/icons/brand.png";
const modelIcon = process.env.PUBLIC_URL + "/images/icons/model.png";
const motorIcon = process.env.PUBLIC_URL + "/images/icons/engine.png";

const Clients = () => {

    const navigate = useNavigate();

    //Variables para la sección de clientes
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState('Nombre');
    const [selectedClient, setSelectedClient] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [clientSuspended, setClientSuspended] = useState(false);
    const [isAlertClientSuspend, setIsAlertClientSuspend] = useState(false);

    const [cedula, setCedula] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    //Variables para la sección de autos

    const [clientVehicles, setClientVehicles] = useState([]);
    const [vehicleData, setVehicleData] = useState(null);
    const [selectedClientData, setSelectedClientData] = useState(null);
    const [isAlertVehicleSuspend, setIsAlertVehicleSuspend] = useState(false);
    const [showAddVehicle, setShowAddVehicle] = useState(false);

    const [category, setCategory] = useState('');
    const [plateCar, setPlateCar] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [motor, setMotor] = useState('');
    const [km, setKm] = useState('');

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
            setPlateCar(formattedValue);
        }
    };

    const transformPlateForSaving = (plateWithDash) => {
        return plateWithDash.replace(/-/g, '');
    };

    const handleTypeCarChange = (selectedOptionCategoryCar) => {
        setCategory(selectedOptionCategoryCar.value);
    };

    //constantes para ver informacion del cliente y del vehiculo respectivamente
    //y modales
    const [showClientInformation, setShowClientInformation] = useState(false);
    const [showClientCarInformation, setShowClientCarInformation] = useState(false);
    const [showTitle, setShowTitle] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    //const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [refreshClients, setRefreshClients] = useState(false);

    const handleSearchClientChange = (term, filter) => {
        console.log(term, filter);
        setSearchTerm(term);
        setSelectedOption(filter);
    };

    const handleSearchWithDebounce = debounce(handleSearchClientChange, 500);

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
        console.log(option);
        setSelectedOption(option);
        // Cerrar el modal después de seleccionar.
        closeFilterModal();
    };

    const handleAddClient = () => {
        // Redirige a la página deseada
        navigate("/clients/newClient");
    };

    const handleClientInformation = (clientId, event) => {
        event.stopPropagation();
        const client = clients.find(client => client.client.id === clientId);
        setSelectedClient(client);
        setShowClientInformation(true);
        setShowClientCarInformation(false);
        setShowTitle(false);
        setSelectedVehicle(null);
        // Ahora, establece los estados relacionados con la visualización de la información del cliente
        const clientdata = clients.find(client => client.client.id === clientId);
        setSelectedClientData(clientdata);
        setShowClientInformation(true);
        setShowClientCarInformation(false);
        setShowAddVehicle(false);
    };

    const handleClientCarInformation = (clientId, event) => {
        const clientData = clients.find(client => client.client.id === clientId);
        event.stopPropagation();
        fetchVehicleInfoByClientId(clientId);
        console.log("id client", clientId)
        setSelectedClientData(clientData);
        console.log(clientData)
        setShowClientInformation(false);
        setShowClientCarInformation(true);
        setShowTitle(true);
        setShowAddVehicle(false);
        setSelectedVehicle(false);

    };

    const handleCarInformation = (vehicle, event) => {
        event.stopPropagation();
        setVehicleData(vehicle);
        setSelectedVehicle(true);
        setShowAddVehicle(false);
        setShowClientInformation(false);
        setShowClientCarInformation(true);
    };

    const handleShowAddVehicle = (event) => {
        event.stopPropagation();
        setSelectedVehicle(false);
        setShowAddVehicle(true);
        setShowClientCarInformation(false);
        setShowClientInformation(false);
    };

    const handleAddVehicle = async (event) => {
        // Para evitar que el formulario recargue la página
        const client_id = selectedClientData.client.id;
        const plate = transformPlateForSaving(plateCar);
        event.preventDefault();
        try {
            const response = await apiClient.post('/vehicles/register', { client_id, category, plate, brand, model, year, motor, km });

            const newVehicle = response.data;
            setClientVehicles(prevVehicles => [...prevVehicles, newVehicle]);
            setRefreshClients(prev => !prev);
            setShowClientCarInformation(true);
            setShowClientInformation(false);
            setShowAddVehicle(false);
            setSelectedVehicle(false);

            toast.success('Vehículo registrado', {
                position: toast.POSITION.TOP_RIGHT
            });
            setShowClientCarInformation(true);
            // Restablecer el estado del formulario de agregar auto
            resetForm();

        } catch (error) {
            console.log("error", error)
            toast.error('Error al guardar un vehiculo', {
                position: toast.POSITION.TOP_RIGHT
            });
        }

    };

    // Función para restablecer el formulario
    const resetForm = () => {
        setPlateCar("");
        setYear("");
        setCategory("");
        setKm("");
        setBrand("");
        setModel("");
        setMotor("");
    };

    const handleInputFocus = () => {
        setIsInputFocused(true);
    };

    const handleInputBlur = () => {
        setIsInputFocused(false);
    };

    /*
    const openAlertModal = () => {
        setIsAlertModalOpen(true);
    };

    const closeAlertModal = () => {
        setIsAlertModalOpen(false);
    };
    */

    const openAlertModalClientSuspend = () => {
        setIsAlertClientSuspend(true);
    }

    const closeAlerModalClientSuspend = () => {
        setIsAlertClientSuspend(false);
    }

    const openAlertModalVehicleSuspend = () => {
        setIsAlertVehicleSuspend(true);
    }

    const closeAlerModalVehicleSuspend = () => {
        setIsAlertVehicleSuspend(false);
    }

    /*const handleAlertClick = () => {
        openAlertModal();
    };*/

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

    //Función para suspender un cliente
    const handleUnavailableClient = async (event) => {
        //Para evitar que el formulario recargue la página
        event.preventDefault();
        setIsAlertClientSuspend(false);
        try {

            const response = await apiClient.put(`/clients/suspend/${selectedClient.client.id}`)

            if (response.status === 200) {
                setClientSuspended(prevState => !prevState);
                const updatedClients = clients.filter(client => client.id !== selectedClient.client.id);
                setClients(updatedClients);
                setShowClientCarInformation(false);
                setShowClientInformation(false);
                toast.success('Cliente suspendido', {
                    position: toast.POSITION.TOP_RIGHT
                });

            } else {
                toast.error('Ha ocurrido un error al suspender al cliente.', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }

        } catch (error) {
            console.log('Error al suspender al cliente', error);
            toast.error('Error al suspender al cliente. Por favor, inténtalo de nuevo..', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    //Función para editar la información de un cliente
    const handleEditClient = async (event) => {
        // Para evitar que el formulario recargue la página
        event.preventDefault();

        try {
            const response = await apiClient.put(`/clients/update/${selectedClient.client.id}`, {
                cedula,
                name,
                address,
                email,
                phone
            });

            if (response.data && response.data.id) {
                setIsEditMode(false);
                const newClient = response.data;
                setClients(prevClients =>
                    prevClients.map(client =>
                        client.id === newClient.id ? newClient : client
                    )
                );
                setRefreshClients(prev => !prev);
                toast.success('Información actualizada correctamente.', {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 5000 // duración de 5 segundos
                });
                setShowClientInformation(false);
            } else {
                toast.error('Ha ocurrido un error al actualizar la información.', {
                    position: toast.POSITION.TOP_RIGHT
                })
            }

        } catch (error) {
            console.log('Error al actualizar la información del cliente', error);
            toast.error('Error al guardar los cambios. Por favor, inténtalo de nuevo..', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    //Función para obtener los vehículos de un cliente
    const fetchVehicleInfoByClientId = async (clientId) => {
        try {
            const response = await apiClient.get(`/vehicles/active/${clientId}`);
            console.log("data vehiculo", response.data)
            if (response.data && response.data.length > 0) {
                const formattedVehicles = response.data.map(vehicle => {
                    if (vehicle.plate) {
                        vehicle.plate = formatPlate(vehicle.plate);
                    }
                    return vehicle;
                });

                setClientVehicles(formattedVehicles);
            } else {
                console.log("No se encontraron vehículos para este cliente.");
                setClientVehicles([]); // O lo que desees hacer si no hay vehículos
            }
        } catch (error) {
            console.error("Error al obtener los datos del vehículo:", error);
        }
    };

    //Función para suspender el vehículo de un cliente
    const handleUnavailableVehicle = async (event) => {
        //Para evitar que el formulario recargue la página
        event.preventDefault();
        setIsAlertVehicleSuspend(false);
        console.log(vehicleData)

        try {

            const response = await apiClient.put(`/vehicles/change-status/${vehicleData.id}?status=suspended`)

            if (response.status === 200) {
                setShowClientCarInformation(false);
                setShowClientInformation(false);
                toast.success('Vehículo suspendido', {
                    position: toast.POSITION.TOP_RIGHT
                });

            } else {
                toast.error('Ha ocurrido un error al suspender el vehículo.', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }

        } catch (error) {
            console.log('Error al suspender al vehículo', error);
            toast.error('Error al suspender al vehículo. Por favor, inténtalo de nuevo..', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    const handleGoBackToButtons = () => {
        setShowAddVehicle(false);
        setShowClientCarInformation(false);
        setShowClientInformation(false);
        setShowTitle(false);
    };

    const handleGoBack = () => {
        setShowClientCarInformation(true);
        setSelectedVehicle(false);
        setShowClientInformation(false);
        setShowAddVehicle(false);
    };

    useEffect(() => {
        //Función que permite obtener todos los clientes 
        //cuando recien se inicia la pantala y busca lo clientes
        //por cédula y nombre

        const fetchData = async () => {

            let endpoint = '/clients/all'; //Endpoint por defecto

            //Si hay un filtro de búsqueda
            if (searchTerm) {
                switch (selectedOption) {
                    case 'Cédula':
                        endpoint = `/clients/search-by-cedula/${searchTerm}`;
                        break;
                    case 'Nombre':
                        endpoint = `/clients/search-by-name/${searchTerm}`;
                        break;
                    default:
                        break;
                }

            }
            try {
                const response = await apiClient.get(endpoint);
                setClients(response.data);
                console.log("clientes obtenidos", response.data)

            } catch (error) {
                console.log("Error al obtener los datos de los clientes", error);

            }
        }
        fetchData();
    }, [searchTerm, selectedOption, refreshClients, clientSuspended,]);

    //Obtención de la información del cliente para editarlo
    useEffect(() => {
        if (selectedClient) {
            setCedula(selectedClient.client.cedula);
            setName(selectedClient.client.name);
            setAddress(selectedClient.client.address);
            setEmail(selectedClient.client.email);
            setPhone(selectedClient.client.phone);
        }
    }, [selectedClient]);

    const options = [
        { value: 'car', label: 'Auto' },
        { value: 'van', label: 'Camioneta' },
        { value: 'bus', label: 'Buseta' },
        { value: 'truck', label: 'Camión' }
    ];

    const resetClientState = () => {
        setShowClientCarInformation(false);
        // resetea otros estados...
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            className: 'custom-select-control',
            width: '93%', // Estilo personalizado para el ancho
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
            width: '93%', // puedes ajustar el ancho del menú aquí
            marginTop: '-17px'
        }),

    };

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu resetFunction={resetClientState} />

            <div className="containerClients">
                <div className="left-section">
                    {/*Título del contenedor con el botón para filtrar búsqueda */}
                    <TitleAndSearchBox
                        selectedOption={selectedOption}
                        title="Clientes"
                        onSearchChange={handleSearchWithDebounce}
                        onButtonClick={openFilterModal}
                    />

                    {/*Lista de clientes*/}
                    <div className="container-list-client">
                        {clients.map(clientData => (
                            <div className="result-client" onClick={(event) => handleClientCarInformation(clientData.client.id, event)} key={clientData.client.id}>
                                <div className="first-result">
                                    <img src={clientIcon} alt="Client Icon" className="icon-client" />
                                    <div className="container-data">
                                        <label className="name-client">{clientData.client.name}</label>

                                        <div className="vehicle-count-container">
                                            {/* Si el vehicles_count es vacío */}
                                            <div className="container-car-number">
                                                <label className="car-number">{(clientData.vehicles_count && clientData.vehicles_count.car) || 0}</label>
                                                <img src={autoIcon} alt="Car client" className="icon-car" />
                                            </div>

                                            {/* Si vehicles_count no es vacío, muestra los otros íconos */}
                                            {clientData.vehicles_count && (
                                                <>

                                                    {clientData.vehicles_count.van && (
                                                        <div className="container-car-number">
                                                            <label className="car-number"> {clientData.vehicles_count.van}
                                                            </label>
                                                            <div className="van-container">
                                                                <img src={camionetaIcon} alt="Van client" className="icon-van"></img>
                                                            </div>

                                                        </div>
                                                    )}

                                                    {clientData.vehicles_count.bus && (
                                                        <div className="container-car-number">
                                                            <label className="car-number"> {clientData.vehicles_count.bus}
                                                            </label>
                                                            <img src={busetaIcon} alt="Bus client" className="icon-bus"></img>
                                                        </div>

                                                    )}

                                                    {clientData.vehicles_count.truck && (
                                                        <div className="container-car-number">
                                                            <label className="car-number"> {clientData.vehicles_count.truck}
                                                            </label>
                                                            <img src={camionIcon} alt="Truck client" className="icon-car"></img>
                                                        </div>

                                                    )}
                                                </>
                                            )}
                                        </div>



                                    </div>
                                </div>

                                <div className="second-result">
                                    <button className="button-eye" onClick={(event) => handleClientInformation(clientData.client.id, event)}>
                                        <img src={eyeIcon} alt="Eye Icon" className="icon-eye" />
                                    </button>
                                </div>

                            </div>

                        ))}
                    </div>

                </div>

                <div className="right-section">

                    {!selectedVehicle && showTitle && !showAddVehicle && (
                        <CustomTitleSection
                            title="Vehículos"
                            onBack={handleGoBackToButtons}
                            showAddIcon={true}
                            onAdd={handleShowAddVehicle}
                        />
                    )}

                    {/* Aquí colocamos los componentes para la sección derecha */}
                    {!showClientCarInformation && !showClientInformation && !showAddVehicle && (
                        <CustomButtonContainer>
                            <CustomButton title="AGREGAR CLIENTE" onClick={handleAddClient} />
                        </CustomButtonContainer>
                    )}

                    {/*Información del o los vehículos del cliente */}

                    {!selectedVehicle && showClientCarInformation && !showClientInformation && !showAddVehicle && (

                        <div className="vehicle-info">
                            {clientVehicles.map(vehicle => (
                                <div key={vehicle.id} className="vehicle" onClick={(event) => handleCarInformation(vehicle, event)}>
                                    <div className="vehicle-content">
                                        {vehicle.category === "car" && (
                                            <img src={autoIcon} alt="Auto Icon" className="auto-icon" />
                                        )}
                                        {vehicle.category === "van" && (
                                            <img src={camionetaIcon} alt="Camioneta Icon" className="camioneta-icon" />
                                        )}
                                        {vehicle.category === "bus" && (
                                            <img src={busetaIcon} alt="Buseta Icon" className="buseta-icon" />
                                        )}
                                        {vehicle.category === "truck" && (
                                            <img src={camionIcon} alt="Camion Icon" className="camion-icon" />
                                        )}
                                        <label className="vehicle-plate"> {formatPlate(vehicle.plate)}</label>
                                    </div>
                                </div>
                            ))}
                        </div>

                    )}

                    {/*Información del cliente */}
                    <ToastContainer />
                    {showClientInformation && !showClientCarInformation && !showAddVehicle && (
                        <div>
                            <CustomTitleSection
                                title="Información del cliente"
                                onBack={handleGoBackToButtons}
                                showDisableIcon={true}
                                onDisable={openAlertModalClientSuspend}
                                showEditIcon={true}
                                onEdit={() => setIsEditMode(true)}
                            />

                            <div className="container-data-client-form">
                                <form>
                                    <label className="label-form">
                                        Cédula
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                type="text"
                                                value={cedula}
                                                onChange={(e) => setCedula(e.target.value)}
                                                readOnly={!isEditMode}
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
                                                className="input-form-detail"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                readOnly={!isEditMode}
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
                                                className="input-form-detail"
                                                type="text"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                readOnly={!isEditMode}
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
                                                className="input-form-detail"
                                                type="text"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                readOnly={!isEditMode}
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
                                                className="input-form-detail"
                                                type="text"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                readOnly={!isEditMode}
                                            />

                                            <img
                                                src={phoneIcon}
                                                alt="Phone Icon"
                                                className="input-new-client-icon"
                                            />
                                        </div>
                                    </label>

                                    {isEditMode &&

                                        <div className="container-button-edit-product">
                                            <button className="button-edit-data-client" onClick={handleEditClient}>
                                                GUARDAR
                                            </button>
                                        </div>
                                    }
                                    <ToastContainer />


                                </form>
                            </div>

                        </div>
                    )}

                    {/*Información del vehículo del cliente */}

                    {selectedVehicle && (
                        <CustomTitleSection
                            title={selectedClientData?.client?.name}
                            onBack={handleGoBack}
                            showDisableIcon={true}
                            onDisable={openAlertModalVehicleSuspend}
                        />
                    )}

                    {selectedVehicle && (
                        <div className="container-add-car-form">
                            <div className="form-scroll">
                                <form>
                                    <div className={`input-container ${isInputFocused ? "active" : ""}`}>
                                        <input
                                            className="input-plate"
                                            type="text"
                                            value={vehicleData ? vehicleData.plate : ""}
                                            onFocus={handleInputFocus}
                                            onBlur={handleInputBlur}
                                            readOnly />
                                        <img src={flagIcon} alt="Flag" className="flag-icon" />
                                        <label>ECUADOR</label>
                                        {/*<button className="button-alert" type="button" onClick={handleAlertClick}>
                                            <img src={alertIcon} className="alert" alt="Alert" />
                                            </button>*/}
                                    </div>

                                    <label className="label-form">
                                        Año
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                type="text"
                                                value={vehicleData ? vehicleData.year : ""}
                                                readOnly
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
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                type="text"
                                                value={vehicleData ? getVehicleCategory(vehicleData.category) : ""}
                                                readOnly
                                            />
                                            <img
                                                src={categoryIcon}
                                                alt="Category Icon"
                                                className="input-new-client-icon"
                                            />
                                        </div>
                                    </label>
                                    <label className="label-form">
                                        Kilometraje actual
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                value={vehicleData ? vehicleData.km : ""}
                                                readOnly
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
                                                className="input-form-detail"
                                                type="text"
                                                value={vehicleData ? vehicleData.brand : ""}
                                                readOnly
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
                                                className="input-form-detail"
                                                type="text"
                                                value={vehicleData ? vehicleData.model : ""}
                                                readOnly
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
                                                className="input-form-detail"
                                                type="text"
                                                value={vehicleData ? vehicleData.motor : ""}
                                                readOnly
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

                    {showAddVehicle && (
                        <CustomTitleSection
                            title="Agregar vehículo"
                            onBack={handleGoBackToButtons}
                        />
                    )}

                    <ToastContainer />

                    {showAddVehicle && (
                        <div className="container-add-car-form">
                            <div className="form-scroll">
                                <form>
                                    <div className={`input-container ${isInputFocused ? "active" : ""}`}>
                                        <input className="input-plate" type="text" value={plateCar} onChange={handleCarPlateChange}
                                            onFocus={handleInputFocus} onBlur={handleInputBlur} />
                                        <img src={flagIcon} alt="Flag" className="flag-icon" />
                                        <label>ECUADOR</label>
                                        {/*<button className="button-alert" type="button" onClick={handleAlertClick}>
                                            <img src={alertIcon} className="alert" alt="Alert" />
                                        </button>
                                        */}
                                    </div>

                                    <label className="label-form">
                                        Año
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form"
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
                                            placeholder="Seleccionar" />
                                    </label>
                                    <label className="label-form">
                                        Kilometraje actual
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form"
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
                                                className="input-form"
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
                                                className="input-form"
                                                type="text"
                                                value={model} onChange={(e) => setModel(e.target.value)}
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
                                                className="input-form"
                                                type="text"
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
                    {showAddVehicle && (
                        <div className="container-button-next">
                            <button className="button-next" onClick={handleAddVehicle}>
                                GUARDAR
                            </button>
                        </div>
                    )}

                    {/*Modal para alertas */}

                    {/* 

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
                    */}

                </div>
            </div>

            {/*Modal del filtro de búsqueda*/}

            {isFilterModalOpen && (
                <Modal
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    options={['Cédula', 'Nombre']}
                    defaultOption="Nombre"
                    onOptionChange={handleOptionChange}
                    onSelect={handleSelectClick}
                />
            )}

            {isAlertClientSuspend && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal">
                        <h3 style={{ textAlign: "center" }}>¿Está seguro de suspender al cliente?</h3>
                        <div className="button-options">
                            <div className="half">
                                <button className="optionNo-button" onClick={closeAlerModalClientSuspend}>
                                    No
                                </button>
                            </div>
                            <div className="half">
                                <button className="optionYes-button" onClick={handleUnavailableClient}>
                                    Si
                                </button>

                            </div>
                        </div>

                    </div>
                </div>

            )}

            {isAlertVehicleSuspend && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal">
                        <h3 style={{ textAlign: "center" }}>¿Está seguro de suspender el vehículo?</h3>
                        <div className="button-options">
                            <div className="half">
                                <button className="optionNo-button" onClick={closeAlerModalVehicleSuspend}>
                                    No
                                </button>
                            </div>
                            <div className="half">
                                <button className="optionYes-button" onClick={handleUnavailableVehicle}>
                                    Si
                                </button>

                            </div>
                        </div>

                    </div>
                </div>

            )}



        </div>
    );
};

export default Clients;
