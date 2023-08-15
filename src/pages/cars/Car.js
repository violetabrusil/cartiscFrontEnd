import "../../Car.css";
import "../../Modal.css";
import "../../NewClient.css";
import "react-datepicker/dist/react-datepicker.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState, useCallback, useRef } from "react";
import DatePicker from "react-datepicker";
import { debounce } from 'lodash';
import { Calendar } from "../../calendar/Calendar";
import { ToastContainer, toast } from 'react-toastify'
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import Modal from "../../modal/Modal";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import apiClient from "../../services/apiClient";
import axios from "axios";

const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
const iconAlertWhite = process.env.PUBLIC_URL + "/images/icons/alerIconWhite.png";
const alertIcon = process.env.PUBLIC_URL + "/images/icons/alertIcon.png";
const sortLeftIcon = process.env.PUBLIC_URL + "/images/icons/sortLeftIcon.png";
const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";
const unavailableIcon = process.env.PUBLIC_URL + "/images/icons/unavailableIcon.png";
const editIcon = process.env.PUBLIC_URL + "/images/icons/editIcon.png";
const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const searchIcon = process.env.PUBLIC_URL + "/images/icons/searchIcon.png";

const Cars = () => {

    //Variable para el filtro y la búsqueda de vehículos y clientes
    const [selectedOption, setSelectedOption] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('cédula');
    const [inputValue, setInputValue] = useState('');
    const [searchClienTerm, setSearchClientTerm] = useState('');
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(null);

    //Varibales para el manejo de los vehículos
    const [vehicles, setVehicles] = useState([]);
    const iconsVehicles = {
        car: process.env.PUBLIC_URL + "/images/icons/autoIcon.png",
        van: process.env.PUBLIC_URL + "/images/icons/camionetaIcon.png",
        bus: process.env.PUBLIC_URL + "/images/icons/busIcon.png",
        truck: process.env.PUBLIC_URL + "/images/icons/camionIcon.png"
    };
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isAlertVehicleSuspend, setIsAlertVechicleSuspend] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSearchClientModalOpen, setIsSearchClientModalOpen] = useState(false);
    const isMounted = useRef(false);
    const source = axios.CancelToken.source();

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [showCarInformation, setShowCarInformation] = useState(false);
    const [showCarHistory, setShowCarHistory] = useState(false);
    const [selectedDate, setSelectedDate] = React.useState(null); // Estado para almacenar la fecha seleccionada 
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [showMaintenance, setShowMaintenance] = useState(false);
    const options = ['Cambio de aceite', 'Cambio de motor'];
    const [selectedOptions, setSelectedOptions] = useState([]);

    const handleSearchCarChange = (term, filter) => {
        console.log(term, filter);
        setSearchTerm(term);
        setSelectedOption(filter);
    };

    const handleSearchVehiclesWithDebounce = debounce(handleSearchCarChange, 500);

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

    const handleCarHistory = (event) => {
        event.stopPropagation();
        setShowCarHistory(true);
        setShowCarInformation(false);
        setShowMaintenance(false);
    }

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleCarInformation = (vehicleId, event) => {
        event.stopPropagation();
        const vehicle = vehicles.find(vehicle => vehicle.id === vehicleId);
        setSelectedVehicle(vehicle);
        setShowCarInformation(true)
        setShowCarHistory(false)
        setShowMaintenance(false);
    };

    const openAlertModalVehicleSuspend = () => {
        setIsAlertVechicleSuspend(true);
    };

    const closeAlertModalVehicleSuspend = () => {
        setIsAlertVechicleSuspend(false);
    };


    const handleOpenModalSearchClient = () => {
        setIsSearchClientModalOpen(true);
    };

    const handleCloseModalSearchClient = () => {
        setIsSearchClientModalOpen(false);
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

    const handleSearchClientWithDebounce = useCallback(
        debounce(async () => {
            console.log("Initiating search with term:", searchClienTerm);
            let endpoint = '';
            if (activeTab === 'cédula') {
                endpoint = `/clients/search-by-cedula/${searchClienTerm}`;
                console.log("Searching with endpoint:", endpoint);
            } else {
                endpoint = `/clients/search-by-name/${searchClienTerm}`;
            }

            try {
                const response = await apiClient.get(endpoint, {
                    cancelToken: source.token
                });

                // Solo actualiza el estado si el componente sigue montado
                if (isMounted.current) {
                    setClients(response.data);
                    console.log("data", response.data);
                }
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log('Previous request cancelled', error.message);
                } else {
                    console.error("Error al buscar:", error);
                }
            }
        }, 500),
        [activeTab, searchClienTerm]
    );

    useEffect(() => {
        // Al montar el componente
        isMounted.current = true;

        console.log("useEffect triggered with:", searchClienTerm);
        if (searchClienTerm) {
            handleSearchClientWithDebounce();
        } else {
            setClients([]);
        }

        //Cleanup al desmontar el componente o al cambiar el término de búsqueda
        return () => {
            isMounted.current = false;  // Indica que el componente ha sido desmontado
            source.cancel('Search term changed or component unmounted'); // Cancela la solicitud
        };
    }, [searchClienTerm, handleSearchClientWithDebounce]);

    useEffect(() => {
        //Función que permite obtener todos los vehículos 
        //registrados cuando inicia la pantalla y busca los vehículos 
        //por placa y nombre de titular

        const fetchData = async () => {

            //Endpoint por defecto
            let endpoint = '/vehicles/all';
            const searchTypePlate = "plate";
            const searchTypeClientName = "client_name";
            //Si hay un filtro de búsqueda
            if (searchTerm) {
                switch (selectedOption) {
                    case 'Placa':
                        endpoint = `/vehicles/search/${searchTypePlate}/${searchTerm}`;
                        break;
                    case 'Nombre Titular':
                        endpoint = `/vehicles/search/${searchTypeClientName}/${searchTerm}`;
                        break;
                    default:
                        break;
                }
            }
            try {
                const response = await apiClient.get(endpoint);
                if (response.data && response.data.length > 0) {
                    const formattedVehicles = response.data.map(vehicle => {
                        if (vehicle.plate) {
                            vehicle.plate = formatPlate(vehicle.plate);
                        }
                        vehicle.iconSrc = iconsVehicles[vehicle.category]
                        return vehicle;
                    });

                    setVehicles(formattedVehicles);
                } else {
                    console.log("No se encontraron vehículos");

                }

            } catch (error) {
                console.log("Error al obtener los datos del vehículo");
            }
        }
        fetchData();
    }, [searchTerm, selectedOption]);

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <div className="containerCars">
                <div className="left-section">
                    {/*Título del contenedor y cuadro de búsqueda */}
                    <TitleAndSearchBox
                        selectedOption={selectedOption}
                        title="Vehículos"
                        onSearchChange={handleSearchVehiclesWithDebounce}
                        onButtonClick={openFilterModal}
                    />

                    {/*Lista de vehículos */}
                    <div className="container-list-vehicle ">
                        {vehicles.map(vehicleData => (
                            <div key={vehicleData.id} className="result-car" onClick={handleCarHistory}>
                                <div className="first-result-car">
                                    <div className="input-plate-container">
                                        <input
                                            className="input-plate-vehicle"
                                            type="text"
                                            value={vehicleData.plate}
                                            readOnly />
                                        <img src={flagIcon} alt="Flag" className="ecuador-icon" />
                                        <label>ECUADOR</label>
                                    </div>
                                </div>
                                <div className="second-result-car">
                                    <div className="div-label">
                                        <label>{vehicleData.client_name}</label>
                                    </div>
                                    <div className="div-icon-vehicle">
                                        <img className="icon-vehicle" src={vehicleData.iconSrc} alt="Icon Vehicle" />
                                    </div>
                                </div>
                                <div className="third-result-car">
                                    <button className="button-eye-car">
                                        <img src={eyeIcon} alt="Eye Icon Car" className="icon-eye-car"
                                            onClick={(event) => handleCarInformation(vehicleData.id, event)} />
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>



                </div>

                <div className="right-section">

                    {!showCarHistory && !showCarInformation && !showMaintenance && (
                        <div className="container-button-add-vehicle">
                            <button className="button-add-vehicle" onClick={handleOpenModalSearchClient} >
                                <span className="text-button-add-vehicle">AGREGAR VEHÍCULO</span>
                            </button>
                        </div>
                    )}
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
                                <h2>Información del vehículo</h2>
                                <button className="button-unavailable" onClick={openAlertModalVehicleSuspend}>
                                    <img src={unavailableIcon} alt="Unavailable Icon" className="button-unavailable-icon" />
                                </button>
                                <button className="button-edit-client">
                                    <img src={editIcon} alt="Edit Client Icon" className="button-edit-client-icon" onClick={() => setIsEditMode(true)} />
                                </button>
                            </div>

                            <div className="container-add-car-form">
                                <div className="form-scroll">
                                    <form>
                                        <div className={`input-container ${isInputFocused ? "active" : ""}`}>
                                            <input className="input-plate" type="text" onFocus={handleInputFocus} onBlur={handleInputBlur} />
                                            <img src={flagIcon} alt="Flag" className="flag-icon" />
                                            <label>ECUADOR</label>
                                            {/*<button className="button-alert" type="button" onClick={handleAlertClick}>
                                                <img src={alertIcon} className="alert" alt="Alert" />
                    </button                >*/}
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

                {isSearchClientModalOpen && (
                    <div className="filter-modal-overlay">
                        <div className="modal-content">
                            <button className="button-close" onClick={handleCloseModalSearchClient}  >
                                <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                            </button>
                            <div className="tabs">
                                <button className={`button-tab ${activeTab === 'cédula' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('cédula')}>
                                    Cédula
                                    <div className="line"></div>
                                </button>
                                <button className={`button-tab ${activeTab === 'nombre' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('nombre')}>
                                    Nombre
                                    <div className="line"></div>
                                </button>
                            </div>
                            <div className="search-client-box">
                                <img src={searchIcon} alt="Search Icon" className="search-client-icon" />
                                <input
                                    className="input-search-client"
                                    value={searchClienTerm}
                                    onChange={e => setSearchClientTerm(e.target.value)}
                                    placeholder={`Buscar por ${activeTab}`}
                                />
                            </div>

                            {clients.length > 0 && (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Cédula</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.map(client => (
                                            <tr key={client.client.id} onClick={() => setSelectedClientId(client.client.id)}>
                                                <td>{client.client.name}</td>
                                                <td>{client.client.cedula}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                            )}

                        </div>

                    </div>

                )}

            </div>

        </div>
    )

};

export default Cars;



