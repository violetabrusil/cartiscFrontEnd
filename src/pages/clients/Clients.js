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

const clientIcon = process.env.PUBLIC_URL + "/images/icons/userIcon-gray.png";
const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
const unavailableIcon = process.env.PUBLIC_URL + "/images/icons/unavailableIcon.png";
const autoIcon = process.env.PUBLIC_URL + "/images/icons/autoIcon.png";
const busetaIcon = process.env.PUBLIC_URL + "/images/icons/busIcon.png";
const camionetaIcon = process.env.PUBLIC_URL + "/images/icons/camionetaIcon.png";
const camionIcon = process.env.PUBLIC_URL + "/images/icons/camionIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const alertIcon = process.env.PUBLIC_URL + "/images/icons/alertIcon.png";
const editIcon = process.env.PUBLIC_URL + "/images/icons/editIcon.png";
const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";

const Clients = () => {

    const navigate = useNavigate();

    //Variables para la sección de clientes
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
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
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
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

    const handleAlertClick = () => {
        openAlertModal();
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

    //Función para suspender un cliente
    const handleUnavailableClient = async (event) => {
        //Para evitar que el formulario recargue la página
        event.preventDefault();
        setIsAlertClientSuspend(false);
        try {

            const response = await apiClient.post(`/clients/suspend/${selectedClient.client.id}`)

            if (response.status === 200) {
                setClientSuspended(prevState => !prevState);
                const updatedClients = clients.filter(client => client.id !== selectedClient.client.id);
                console.log(updatedClients);
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
                toast.success('Información actualizada correctamente.', {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 5000 // duración de 5 segundos
                });
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

            } catch (error) {
                console.log("Error al obtener los datos de los clientes", error);

            }
        }
        fetchData();
    }, [searchTerm, selectedOption, clientSuspended, refreshClients]);

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
                        <div className="container-title-client">
                            <h2>Vehículos</h2>
                            <button className="button-add-car" onClick={handleShowAddVehicle}>
                                <img src={addIcon} alt="Add Car Icon" className="button-add-car-icon" />
                            </button>
                        </div>
                    )}

                    {/* Aquí colocamos los componentes para la sección derecha */}
                    {!showClientCarInformation && !showClientInformation && !showAddVehicle && (
                        <div className="container-button-add-client">
                            <button className="button-add-client" onClick={handleAddClient} >
                                <span className="text-button-add-client">AGREGAR CLIENTE</span>
                            </button>
                        </div>

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
                                        <label className="vehicle-plate">{vehicle.plate}</label>
                                    </div>
                                </div>
                            ))}
                        </div>


                    )}

                    {/*Información del cliente */}
                    <ToastContainer />
                    {showClientInformation && !showClientCarInformation && !showAddVehicle && (
                        <div>
                            <div className="container-title-client">
                                <h2>Información del cliente</h2>

                                <button className="button-unavailable" onClick={openAlertModalClientSuspend}>
                                    <img src={unavailableIcon} alt="Unavailable Icon" className="button-unavailable-icon" />
                                </button>
                                <button className="button-edit-client">
                                    <img src={editIcon} alt="Edit Client Icon" className="button-edit-client-icon" onClick={() => setIsEditMode(true)} />
                                </button>
                            </div>

                            <div className="container-data-client-form">
                                <form>
                                    <label className="label-form">
                                        Cédula
                                        <input
                                            className="input-form"
                                            type="text"
                                            value={cedula}
                                            onChange={(e) => setCedula(e.target.value)}
                                            readOnly={!isEditMode}
                                        />
                                    </label>
                                    <label className="label-form">
                                        Nombre completo
                                        <input
                                            className="input-form"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            readOnly={!isEditMode}
                                        />
                                    </label>
                                    <label className="label-form">
                                        Dirección
                                        <input
                                            className="input-form"
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            readOnly={!isEditMode}
                                        />
                                    </label>
                                    <label className="label-form">
                                        Email
                                        <input
                                            className="input-form"
                                            type="text"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            readOnly={!isEditMode}
                                        />
                                    </label>
                                    <label className="label-form">
                                        Teléfono
                                        <input
                                            className="input-form"
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            readOnly={!isEditMode}
                                        />
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
                        <div className="containerNewClientTitle">
                            <h2>{selectedClientData?.client?.name}</h2>
                            <button className="button-delete" onClick={openAlertModalVehicleSuspend}>
                                <img src={unavailableIcon} alt="Suspended Vehicle" className="button-suspend-client-icon" />
                            </button>
                        </div>
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
                                        <input
                                            className="input-form"
                                            type="text"
                                            value={vehicleData ? vehicleData.year : ""}
                                            readOnly
                                        />
                                    </label>
                                    <label className="label-form">
                                        Categoría
                                        <input
                                            className="input-form"
                                            type="text"
                                            value={vehicleData ? getVehicleCategory(vehicleData.category) : ""}
                                            readOnly
                                        />
                                    </label>
                                    <label className="label-form">
                                        Kilometraje actual
                                        <input
                                            className="input-form"
                                            value={vehicleData ? vehicleData.km : ""}
                                            readOnly
                                        />
                                    </label>
                                    <label className="label-form">
                                        Marca
                                        <input
                                            className="input-form"
                                            type="text"
                                            value={vehicleData ? vehicleData.brand : ""}
                                            readOnly
                                        />
                                    </label>
                                    <label className="label-form">
                                        Modelo
                                        <input
                                            className="input-form"
                                            type="text"
                                            value={vehicleData ? vehicleData.model : ""}
                                            readOnly
                                        />
                                    </label>
                                    <label className="label-form">
                                        Motor
                                        <input
                                            className="input-form"
                                            type="text"
                                            value={vehicleData ? vehicleData.motor : ""}
                                            readOnly
                                        />
                                    </label>
                                </form>
                            </div>
                        </div>
                    )}

                    {showAddVehicle && (
                        <div className="containerNewClientTitle">
                            <h2>Agregar vehículo</h2>
                        </div>
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
                                        <input className="input-form" type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} />
                                    </label>
                                    <label className="label-form">
                                        Categoría
                                        <Select
                                            options={options}
                                            value={options.find(option => option.value === category)}
                                            onChange={handleTypeCarChange}
                                            styles={customStyles}
                                            placeholder="Seleccionar" />
                                    </label>
                                    <label className="label-form">
                                        Kilometraje actual
                                        <input className="input-form" type="number" value={km} onChange={(e) => setKm(parseInt(e.target.value))} />
                                    </label>
                                    <label className="label-form">
                                        Marca
                                        <input className="input-form" type="text" value={brand} onChange={(e) => setBrand(e.target.value)} />
                                    </label>
                                    <label className="label-form">
                                        Modelo
                                        <input className="input-form" type="text" value={model} onChange={(e) => setModel(e.target.value)} />
                                    </label>
                                    <label className="label-form">
                                        Motor
                                        <input className="input-form" type="text" value={motor} onChange={(e) => setMotor(e.target.value)} />
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
