import "../../Car.css";
import "../../Modal.css";
import "../../NewClient.css";
import "../../Clients.css";
//import "react-datepicker/dist/react-datepicker.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
//import DatePicker from "react-datepicker";
import { debounce } from 'lodash';
//import { Calendar } from "../../calendar/Calendar";
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import Modal from "../../modal/Modal";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import apiClient from "../../services/apiClient";
import axios from "axios";

const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
//const iconAlertWhite = process.env.PUBLIC_URL + "/images/icons/alerIconWhite.png";
//const alertIcon = process.env.PUBLIC_URL + "/images/icons/alertIcon.png";
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
    const [activeTab, setActiveTab] = useState('cédula');;
    const [searchClienTerm, setSearchClientTerm] = useState('');
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [nameClient, setNameClient] = useState('');

    //Varibales para el manejo de los vehículos
    const [vehicles, setVehicles] = useState([]);
    const iconsVehicles = useMemo(() => {
        return {
            car: process.env.PUBLIC_URL + "/images/icons/autoIcon.png",
            van: process.env.PUBLIC_URL + "/images/icons/camionetaIcon.png",
            bus: process.env.PUBLIC_URL + "/images/icons/busIcon.png",
            truck: process.env.PUBLIC_URL + "/images/icons/camionIcon.png"
        };
    }, []); // No hay dependencias, ya que se trata de una inicialización única
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isSearchClientModalOpen, setIsSearchClientModalOpen] = useState(false);
    const isMounted = useRef(false);
    const source = axios.CancelToken.source();
    const options = [
        { value: 'car', label: 'Auto' },
        { value: 'van', label: 'Camioneta' },
        { value: 'bus', label: 'Buseta' },
        { value: 'truck', label: 'Camión' }
    ];
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [refreshVehicles, setRefreshVehicles] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAlertVehicleSuspend, setIsAlertVechicleSuspend] = useState(false);
    //const [selectedDate, setSelectedDate] = React.useState(null); // Estado para almacenar la fecha seleccionada 
    const [vehicleSuspended, setVehicleSuspended] = useState(false);

    //Variables para guardar a un vehículo
    const [category, setCategory] = useState('');
    const [plateCar, setPlateCar] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [motor, setMotor] = useState('');
    const [km, setKm] = useState('');

    //Variables para de modales y secciones
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    //const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [showCarInformation, setShowCarInformation] = useState(false);
    const [showCarHistory, setShowCarHistory] = useState(false);
    const [showMaintenance, setShowMaintenance] = useState(false);
    const [showButtonAddVehicle, setShowButtonAddVehicle] = useState(true);
    const [showAddVehicle, setShowAddVehicle] = useState(false);
    //const options = ['Cambio de aceite', 'Cambio de motor'];
    //const [selectedOptions, setSelectedOptions] = useState([]);

    const transformPlateForSaving = (plateWithDash) => {
        return plateWithDash.replace(/-/g, '');
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

    const resetVehicleState = () => {
        setShowAddVehicle(false);
        setShowCarInformation(false);
        setShowCarHistory(false);
        setShowButtonAddVehicle(true);
        // resetea otros estados...
    };

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
        setShowAddVehicle(false);
        setShowButtonAddVehicle(false);
    }

    /*
    const handleDateChange = (date) => {
        setSelectedDate(date);
    };
    */

    const handleCarInformation = (vehicle, event) => {
        event.stopPropagation();

        setSelectedVehicle(vehicle);
        setShowCarInformation(true);
        setShowCarHistory(false);
        setShowMaintenance(false);
        setShowAddVehicle(false);
        setShowButtonAddVehicle(false);
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
        setSearchClientTerm('');
        setClients([]);
        setActiveTab('cédula');
    };

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        setSearchClientTerm('');
        setClients([]);
    };

    const handleShowAddVehicle = (clientId, event) => {
        event.stopPropagation();
        setShowButtonAddVehicle(false);
        setShowAddVehicle(true);
        handleCloseModalSearchClient();
        setSelectedClientId(clientId);
        const name_client = clients.find(client => client.client.id === clientId);
        setNameClient(name_client.client.name);

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

    const handleInputFocus = () => {
        setIsInputFocused(true);
    };

    const handleInputBlur = () => {
        setIsInputFocused(false);
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
            setPlateCar(formattedValue);
        }
    };

    const handleTypeCarChange = (selectedOptionCategoryCar) => {
        setCategory(selectedOptionCategoryCar.value);
    };

    /*
    const openAlertModal = () => {
        setIsAlertModalOpen(true);
    };

    const closeAlertModal = () => {
        setIsAlertModalOpen(false);
    };

    const handleAlertClick = () => {
        openAlertModal();
    };

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
    */

    const handleAddVehicle = async (event) => {
        // Para evitar que el formulario recargue la página
        const client_id = selectedClientId;
        const plate = transformPlateForSaving(plateCar);
        event.preventDefault();
        try {
            const response = await apiClient.post('/vehicles/register', { client_id, category, plate, brand, model, year, motor, km });

            const newVehicle = response.data;
            setVehicles(prevVehicles => [...prevVehicles, newVehicle]);
            setRefreshVehicles(prev => !prev);
            setShowAddVehicle(false);
            toast.success('Vehículo registrado', {
                position: toast.POSITION.TOP_RIGHT
            });
            setShowButtonAddVehicle(true);

            // Restablecer el estado del formulario de agregar auto
            resetForm();

        } catch (error) {
            console.log("error", error)
            toast.error('Error al guardar un vehiculo', {
                position: toast.POSITION.TOP_RIGHT
            });
        }

    };

    const handleSearchClientWithDebounce = useCallback(
        debounce(async () => {
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

    //Función para editar la información de un vehículo
    const handleEditVehicle = async (event) => {
        // Para evitar que el formulario recargue la página
        event.preventDefault();
        const plate = transformPlateForSaving(plateCar);

        try {
            const response = await apiClient.put(`/vehicles/update/${selectedVehicle.id}`, {
                plate,
                year,
                category,
                km,
                brand,
                model,
                motor
            });

            if (response.data && response.data.id) {
                setIsEditMode(false);
                const newVehicle = response.data;
                setVehicles(prevVehicles =>
                    prevVehicles.map(vehicle =>
                        vehicle.id === newVehicle.id ? newVehicle : vehicle
                    )
                );
                setRefreshVehicles(prev => !prev);
                toast.success('Información actualizada correctamente.', {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 5000 // duración de 5 segundos
                });
                setShowCarInformation(false);
                setShowButtonAddVehicle(true);
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

    //Función para suspender un cliente
    const handleUnavailableVehicle = async (event) => {
        //Para evitar que el formulario recargue la página
        event.preventDefault();
        setIsAlertVechicleSuspend(false);

        try {

            const response = await apiClient.put(`/vehicles/change-status/${selectedVehicle.id}?status=suspended`)

            if (response.status === 200) {
                setVehicleSuspended(prevState => !prevState);
                const updateVehicles = vehicles.filter(vehicle => vehicle.id !== selectedVehicle.id);
                setVehicles(updateVehicles);
                setShowCarInformation(false);
                setShowCarHistory(false);
                setShowButtonAddVehicle(true);
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

    //Para realizar la búsqueda del cliente en el modal
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
    }, [searchTerm, selectedOption, refreshVehicles, vehicleSuspended, iconsVehicles]);

    //Obtención de la información del vehículo para editarlo
    useEffect(() => {
        if (selectedVehicle) {
            setPlateCar(selectedVehicle.plate);
            setYear(selectedVehicle.year);
            setCategory(selectedVehicle.category);
            console.log("categoyr", (selectedVehicle.category))
            setKm(selectedVehicle.km);
            setBrand(selectedVehicle.brand);
            setModel(selectedVehicle.model);
            setMotor(selectedVehicle.motor);
        }
    }, [selectedVehicle, iconsVehicles]);

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu resetFunction={resetVehicleState} />

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
                                            onClick={(event) => handleCarInformation(vehicleData, event)} />
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>



                </div>

                <div className="right-section">
                    <ToastContainer />
                    {/*Sección para mostrar el botón de agregar vehículo */}
                    {showButtonAddVehicle && !showCarHistory && !showCarInformation && !showMaintenance && (
                        <div className="container-button-add-vehicle">
                            <button className="button-add-vehicle" onClick={handleOpenModalSearchClient} >
                                <span className="text-button-add-vehicle">AGREGAR VEHÍCULO</span>
                            </button>
                        </div>
                    )}

                    {/*Sección para mostrar el formulario para agregar un vehículo*/}
                    {showAddVehicle && !showButtonAddVehicle && !showCarHistory && !showCarInformation && !showMaintenance && (
                        <>
                            <div className="container-new-vehicle">
                                <h2>{nameClient}</h2>
                            </div>

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

                            <div className="container-button-next">
                                <button className="button-next" onClick={handleAddVehicle}>
                                    GUARDAR
                                </button>
                            </div>
                        </>


                    )}
                    {/* 
                    {showCarHistory && !showAddVehicle && !showButtonAddVehicle && !showCarInformation && !showMaintenance && (
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
                    */}

                    {showCarInformation && !showAddVehicle && !showButtonAddVehicle && !showCarHistory && !showMaintenance && (
                        <div>
                            <div className="containerNewClientTitle">
                                <h2>Información del vehículo</h2>
                                <button className="button-unavailable" onClick={openAlertModalVehicleSuspend}>
                                    <img src={unavailableIcon} alt="Unavailable Icon" className="button-unavailable-icon" onClick={openAlertModalVehicleSuspend} />
                                </button>
                                <button className="button-edit-client">
                                    <img src={editIcon} alt="Edit Client Icon" className="button-edit-client-icon" onClick={() => setIsEditMode(true)} />
                                </button>
                            </div>

                            <div className="container-add-car-form">
                                <div className="form-scroll">
                                    <form>
                                        <div className={`input-container ${isInputFocused ? "active" : ""}`}>
                                            <input
                                                className="input-plate"
                                                type="text"
                                                value={plateCar}
                                                onFocus={handleInputFocus}
                                                onBlur={handleInputBlur}
                                                onChange={handleCarPlateChange}
                                                readOnly={!isEditMode}
                                            />
                                            <img src={flagIcon} alt="Flag" className="flag-icon" />
                                            <label>ECUADOR</label>
                                            {/*<button className="button-alert" type="button" onClick={handleAlertClick}>
                                                <img src={alertIcon} className="alert" alt="Alert" />
                    </button                >*/}
                                        </div>

                                        <label className="label-form">
                                            Año
                                            <input
                                                className="input-form"
                                                type="number"
                                                value={year}
                                                onChange={(e) => setYear(parseInt(e.target.value))}
                                                readOnly={!isEditMode}
                                            />
                                        </label>
                                        <label className="label-form">
                                            Categoría
                                            <Select
                                                options={options}
                                                value={options.find(option => option.value === category)}
                                                onChange={handleTypeCarChange}
                                                styles={customStyles}
                                                placeholder="Seleccionar"
                                                readOnly={!isEditMode}
                                            />
                                        </label>
                                        <label className="label-form">
                                            Kilometraje actual
                                            <input
                                                className="input-form"
                                                type="number"
                                                value={km}
                                                onChange={(e) => setKm(parseInt(e.target.value))}
                                                readOnly={!isEditMode}
                                            />
                                        </label>
                                        <label className="label-form">
                                            Marca
                                            <input
                                                className="input-form"
                                                type="text"
                                                value={brand}
                                                onChange={(e) => setBrand(e.target.value)}
                                                readOnly={!isEditMode}
                                            />
                                        </label>
                                        <label className="label-form">
                                            Modelo
                                            <input
                                                className="input-form"
                                                type="text"
                                                value={model}
                                                onChange={(e) => setModel(e.target.value)}
                                                readOnly={!isEditMode}
                                            />
                                        </label>
                                        <label className="label-form">
                                            Motor
                                            <input
                                                className="input-form"
                                                type="number"
                                                value={motor}
                                                onChange={(e) => setMotor(e.target.value)}
                                                readOnly={!isEditMode}
                                            />
                                        </label>
                                    </form>
                                </div>

                                {isEditMode &&
                                    <div className="container-button-edit-vehicle">
                                        <button className="button-edit-data-vehicle" onClick={handleEditVehicle}>
                                            GUARDAR
                                        </button>
                                    </div>
                                }
                            </div>

                        </div>
                    )}

                    {/* */}

                    {showMaintenance && !showAddVehicle && !showButtonAddVehicle && !showCarHistory && !showCarInformation && (
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
                                            {/* 
                                            <input
                                                type="checkbox"
                                                name={option}
                                                onChange={handleCheckboxChange}
                                                className="input-checkbox"
                                            />
                                            */}
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

                {isSearchClientModalOpen && (
                    <div className="filter-modal-overlay">
                        <div className="modal-content">
                            <button className="button-close" onClick={handleCloseModalSearchClient}  >
                                <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                            </button>
                            <div className="tabs">
                                <button className={`button-tab ${activeTab === 'cédula' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('cédula')}>
                                    Cédula
                                    <div className="line"></div>
                                </button>
                                <button className={`button-tab ${activeTab === 'nombre' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('nombre')}>
                                    Nombre
                                    <div className="line"></div>
                                </button>
                            </div>
                            <div className="search-client-box">
                                <img src={searchIcon} alt="Search Icon" className="search-client-icon" />
                                <input
                                    className="input-search-client"
                                    value={searchClienTerm}
                                    onChange={e => {
                                        const value = e.target.value;
                                        if (activeTab === 'cédula' && !/^[0-9]*$/.test(value)) return;
                                        if (activeTab === 'nombre' && !/^[a-zA-Z\s]*$/.test(value)) return;
                                        setSearchClientTerm(value);
                                    }}
                                    placeholder={`Buscar por ${activeTab}`}
                                    pattern={activeTab === 'cédula' ? "[0-9]*" : "[a-zA-Z ]*"}
                                />
                            </div>

                            {clients.length > 0 && (
                                <table className="client-table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Cédula</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.map(client => (
                                            <tr key={client.client.id} onClick={(event) => handleShowAddVehicle((client.client.id), event)}>
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

                {isAlertVehicleSuspend && (
                    <div className="filter-modal-overlay">
                        <div className="filter-modal">
                            <h3 style={{ textAlign: "center" }}>¿Está seguro de suspender el vehículo?</h3>
                            <div className="button-options">
                                <div className="half">
                                    <button className="optionNo-button" onClick={closeAlertModalVehicleSuspend}>
                                        No
                                    </button>
                                </div>
                                <div className="half">
                                    <button className="optionYes-button" onClick={handleUnavailableVehicle}  >
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



