import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { debounce } from 'lodash';
import { ToastContainer, toast } from 'react-toastify';
import PuffLoader from "react-spinners/PuffLoader";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import apiClient from "../../services/apiClient";
import DataTable from "../../dataTable/DataTable";
import axios from "axios";
import { workOrderStatus } from "../../constants/workOrderConstants";
import SearchModalWorkOrder from "../../modal/SearchModalWorkOrder";
import { useNavigate, useParams } from "react-router-dom";
import { useCarContext } from "../../contexts/searchContext/CarContext";
import TitleAndSearchBoxSpecial from "../../titleAndSearchBox/TitleAndSearchBoxSpecial";
import { useStatusColors } from "../../utils/useStatusColors";
import useCSSVar from "../../hooks/UseCSSVar";
import ResultItem from "../../resultItem/ResultItem";
import VehicleFormPanel from "./VehicleFormPanel";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import { CustomColorContainer } from '../../customColorContainer/CustomColorContainer';
import { ButtonCard } from '../../buttons/buttonCards/ButtonCard';
import SectionTitle from '../../components/SectionTitle';
import CustomModal from "../../modal/customModal/CustomModal";
import { vehicleSearchOptions } from '../../constants/filterOptions';

const eyeBlueIcon = process.env.PUBLIC_URL + "/images/icons/eyeBlueIcon.png";
const sortLeftIcon = process.env.PUBLIC_URL + "/images/icons/sortLeftIcon.png";
const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";

const Cars = () => {

    const tertiaryColor = useCSSVar('--tertiary-color');

    //Variable para el filtro y la búsqueda de vehículos y clientes
    const { selectedOption = "Nombre Titular", setSelectedOption, searchTerm, setSearchTerm } = useCarContext();
    const [activeTab, setActiveTab] = useState('nombre');
    const [searchClienTerm, setSearchClientTerm] = useState('');
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [nameClient, setNameClient] = useState('');
    const [loading, setLoading] = useState(true);

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

    const [isInputFocused, setIsInputFocused] = useState(false);
    const [refreshVehicles, setRefreshVehicles] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAlertVehicleSuspend, setIsAlertVechicleSuspend] = useState(false);
    const [vehicleSuspended, setVehicleSuspended] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [workOrders, setWorkOrders] = useState([]);
    const [isSearchWorkOrderModalOpen, setIsSearchWorkOrderModalOpen] = useState(false);
    const [selectedPlateVehicle, setSelectedPlateVehicle] = useState(null);

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
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [showCarInformation, setShowCarInformation] = useState(false);
    const [showCarHistory, setShowCarHistory] = useState(false);
    const [showMaintenance, setShowMaintenance] = useState(false);
    const [showButtonAddVehicle, setShowButtonAddVehicle] = useState(true);
    const [showAddVehicle, setShowAddVehicle] = useState(false);
    const options = [
        { value: 'car', label: 'Auto' },
        { value: 'van', label: 'Camioneta' },
        { value: 'bus', label: 'Buseta' },
        { value: 'truck', label: 'Camión' }
    ];

    const optionsMaintance = ['Cambio de aceite', 'Cambio de motor'];
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);

    const statusColors = useStatusColors();

    const { vehicleId } = useParams();

    const navigate = useNavigate();

    const transformPlateForSaving = (plateWithDash) => {
        return plateWithDash.replace(/-/g, '');
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

    const handleSelectClick = (option) => {
        // Aquí se puede manejar la opción seleccionada.
        setSelectedOption(option);
        // Cerrar el modal después de seleccionar.
        closeFilterModal();
    };

    const columns = [
        {
            Header: 'Código',
            accessor: 'work_order_code',
        },
        {
            Header: 'Estado',
            accessor: 'work_order_status',
            Cell: ({ value }) =>
                <CustomColorContainer
                    statusColors={statusColors}
                    value={value}

                />
        },
        {
            Header: 'Fecha inicio',
            accessor: 'date_start',
        },
        {
            Header: 'Fecha fin',
            accessor: 'date_finish',
            Cell: ({ value }) => {
                return value === 'NaN/NaN/NaN' ? '-' : value;
            }
        },
        {
            Header: 'Kilometraje',
            accessor: 'km',
            Cell: ({ value }) => (
                <span style={{ fontWeight: 'bold' }}>
                    {value}
                </span>
            )
        },
        {
            Header: 'Total',
            accessor: 'total',
            Cell: ({ value }) => (
                <span style={{ fontWeight: 'bold' }}>
                    $ {parseFloat(value).toFixed(2)}
                </span>
            )
        },
        {
            Header: "Ver detalle",
            Cell: ({ row }) => {
                const workOrder = row.original;
                return (
                    <button
                        className="button-eye-car-work-order"
                        onClick={() => handleShowInformationWorkOrderClick(workOrder.id)}
                    >
                        <img src={eyeBlueIcon} alt="Eye Icon Work Order" className="icon-eye-car-work-order"
                        />
                    </button>
                );
            },
            id: 'edit-product-button'
        },
    ];

    const openWorkOrderModal = () => {
        setIsWorkOrderModalOpen(true);
    };

    const closeWorkOrderModal = () => {
        setIsWorkOrderModalOpen(false);
    };

    const handleAddWorkOrder = () => {
        navigate("/workOrders/newWorkOrder")
    };

    function formatDate(isoDate) {
        const date = new Date(isoDate);
        const day = String(date.getUTCDate()).padStart(2, '0');  // Usamos getUTCDate en lugar de getDate
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Usamos getUTCMonth en lugar de getMonth
        const year = date.getUTCFullYear();  // Usamos getUTCFullYear en lugar de getFullYear

        return `${day}/${month}/${year}`;
    };

    const getVehicleHistoryData = async (vehicleId) => {
        try {
            const response = await apiClient.get(`/work-orders/by-vehicle/${vehicleId}`)
            const transformedWorkOrders = response.data.map(workOrder => {
                const newDateStart = formatDate(workOrder.date_start);
                const newDateFinish = formatDate(workOrder.date_finish);
                const translatedStatus = workOrderStatus[workOrder.work_order_status] || workOrder.work_order_status;
                return {
                    ...workOrder,
                    date_start: newDateStart,
                    date_finish: newDateFinish,
                    work_order_status: translatedStatus,
                };
            });

            setWorkOrders(transformedWorkOrders);
            console.log("datos del historial", response.data)


        } catch (error) {
            toast.error('Hubo un error al obtener el historial', {
                position: toast.POSITION.TOP_RIGHT
            });
        }

    };

    const handleCarHistory = (vehicleId, event) => {
        // Si se proporciona un evento, detiene la propagación
        if (event) {
            event.stopPropagation();
        }

        // Guarda el ID del vehículo en el estado para usarlo después
        // setSelectedVehicleId(vehicleId);
        const numericVehicleId = Number(vehicleId);
        // Encuentra el vehículo en el array de vehículos
        const vehicleInformation = vehicles.find(vehicle => vehicle.id === numericVehicleId);

        // Asegúrate de que el vehículo fue encontrado antes de continuar
        if (vehicleInformation) {
            setSelectedPlateVehicle(vehicleInformation.plate);
            setNameClient(vehicleInformation.client_name);
            setCategory(vehicleInformation.category);
            setShowCarHistory(true);
            setShowCarInformation(false);
            setShowMaintenance(false);
            setShowAddVehicle(false);
            setShowButtonAddVehicle(false);
            getVehicleHistoryData(numericVehicleId);
            navigate(`/cars/carHistory/${numericVehicleId}`);
            console.log("pp")
        } else {
            // Maneja el caso en que el vehículo no se encuentra
            console.error(`No se encontró el vehículo con ID: ${numericVehicleId}`);
            // Aquí puedes decidir qué hacer si no se encuentra el vehículo
        }
    };

    const handleOpenModalWorkOrder = () => {
        setIsSearchWorkOrderModalOpen(true);
    };

    const handleCloseModalWorkOrder = () => {
        setIsSearchWorkOrderModalOpen(false);
    };

    const handleSearhWorkOrder = async (searchData) => {

        const plate = selectedPlateVehicle.replace(/-/g, "");
        // Transformar las claves del objeto searchData
        const transformedSearchData = {
            work_order_code: searchData.WorkOrderCode || null,
            work_order_status: searchData.WorkOrderStatus || null,
            date_start_of_search: searchData.DateStartOfSearch || null,
            date_finish_of_search: searchData.DateFinishOfSearch || null,
            assigned: searchData.Assigned || null,
            delivered_by: searchData.DeliveredBy || null,
            created_by: searchData.CreatedBy || null,
            vehicle_plate: plate
        };

        try {

            const response = await apiClient.post('/work-orders/search', transformedSearchData);

            const transformedWorkOrders = response.data.map(workOrder => {
                const newDateStart = formatDate(workOrder.date_start);
                const newDateFinish = formatDate(workOrder.date_finish);
                const translatedStatus = workOrderStatus[workOrder.work_order_status] || workOrder.work_order_status;
                return {
                    ...workOrder,
                    date_start: newDateStart,
                    date_finish: newDateFinish,
                    work_order_status: translatedStatus,
                };
            });

            setWorkOrders(transformedWorkOrders);
            handleCloseModalWorkOrder();

        } catch (error) {
            toast.error('Hubo un error al realizar la búsqueda.', {
                position: toast.POSITION.TOP_RIGHT,
            });
        }
    };

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
        setSearchClientTerm('');
        fetchAllClients();
    };

    const handleCloseModalSearchClient = () => {
        setIsSearchClientModalOpen(false);
        setSearchClientTerm('');
        setClients([]);
        setActiveTab('nombre');
    };

    const onSearchChange = (e) => {
        const value = e.target.value;
        if (activeTab === 'nombre' && !/^[a-zA-Z\s]*$/.test(value)) return;
        if (activeTab === 'cédula' && !/^[0-9]*$/.test(value)) return;
        setSearchClientTerm(value);
    };

    const handleShowAddVehicle = (clientId, event) => {

        if (event) event.stopPropagation();

        setShowButtonAddVehicle(false);
        setShowAddVehicle(true);
        handleCloseModalSearchClient();
        setSelectedClientId(clientId);
        const name_client = clients.find(client => client.client.id === clientId);
        setNameClient(name_client.client.name);
        resetForm();
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

    const handleTypeCarChange = (selectedOptionCategoryCar) => {
        setCategory(selectedOptionCategoryCar.value);
    };

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
            setTimeout(() => {
                openWorkOrderModal();
            }, 3000);
            setShowButtonAddVehicle(true);

            // Restablecer el estado del formulario de agregar auto
            resetForm();

        } catch (error) {
            toast.error('Error al guardar un vehiculo', {
                position: toast.POSITION.TOP_RIGHT
            });
        }

    };

    const fetchAllClients = async () => {
        const response = await apiClient.get('/clients/all');
        setClients(response.data);
    };

    const handleSearchClientWithDebounce = useCallback(
        debounce(async () => {

            if (searchClienTerm.trim() === '') {
                fetchAllClients();
                return;
            }

            let endpoint = '';
            if (activeTab === 'cédula') {
                endpoint = `/clients/search-by-cedula/${searchClienTerm}`;
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

                } else {

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
            console.log("error guardar vehiculo", error)
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
            toast.error('Error al suspender al vehículo. Por favor, inténtalo de nuevo..', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    const handleGoBackButton = () => {
        setShowButtonAddVehicle(true);
        setShowAddVehicle(false);
        setShowCarHistory(false);
        setShowCarInformation(false);
        navigate('/cars');
    };

    const handleShowInformationWorkOrderClick = (workOrderId, currentPage) => {
        navigate(`/workOrders/detailWorkOrder/${workOrderId}`, { state: { from: currentPage } });
    };

    //Para realizar la búsqueda del cliente en el modal
    useEffect(() => {
        isMounted.current = true;

        if (searchClienTerm.trim() === '') {
            // Si el término de búsqueda está vacío, obtener todos los clientes
            const fetchAllClients = async () => {
                try {
                    const response = await apiClient.get('/clients/all', {
                        cancelToken: source.token,
                    });
                    if (isMounted.current) {
                        setClients(response.data);
                    }
                } catch (error) {
                    if (!axios.isCancel(error)) {
                        // Manejar error
                        console.error(error);
                    }
                }
            };
            fetchAllClients();
        } else {
            // Si hay texto, ejecutar la búsqueda con debounce
            handleSearchClientWithDebounce();
        }

        return () => {
            isMounted.current = false;
            const CancelToken = axios.CancelToken;
            const source = CancelToken.source();
            source.cancel('Search term changed or component unmounted');
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
                    setLoading(false);
                } else {
                    setLoading(false);
                }

            } catch (error) {
                if (error.code === 'ECONNABORTED') {
                    console.error('La solicitud ha superado el tiempo límite.');
                } else {
                    console.error('Error al cargar la información vuelva a intentarlo.', error.message);
                }
            }
        }
        fetchData();
    }, [searchTerm, selectedOption, refreshVehicles, vehicleSuspended, iconsVehicles]);

    useEffect(() => {
        console.log("Valor de selectedOption al regresar:", selectedOption, searchTerm);
    }, [selectedOption, searchTerm]);

    //Obtención de la información del vehículo para editarlo
    useEffect(() => {
        if (selectedVehicle) {
            setPlateCar(selectedVehicle.plate);
            setYear(selectedVehicle.year);
            setCategory(selectedVehicle.category);
            setKm(selectedVehicle.km);
            setBrand(selectedVehicle.brand);
            setModel(selectedVehicle.model);
            setMotor(selectedVehicle.motor);
            setNameClient(selectedVehicle.client_name);

        }
    }, [selectedVehicle, iconsVehicles]);

    useEffect(() => {
        // Convierte vehicleId a un número
        const numericVehicleId = Number(vehicleId);

        if (numericVehicleId && vehicles.length > 0) {
            // Llama a handleCarHistory con el ID numérico
            handleCarHistory(numericVehicleId);
        }
    }, [vehicleId, vehicles]); // Dependencias del useEffect

    return (
        <div>
            <Header showIconCartics={true} showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu resetFunction={resetVehicleState} />

            <div className="two-column-layout">
                <div className="left-panel">

                    {/*Título del contenedor y cuadro de búsqueda */}
                    <TitleAndSearchBoxSpecial
                        selectedOption={selectedOption}
                        title="Vehículos"
                        onSearchChange={handleSearchVehiclesWithDebounce}
                        onButtonClick={openFilterModal}
                        shouldSaveSearch={true}
                    />

                    {loading ? (
                        <div className="loader-container" style={{ marginLeft: '-93px' }}>
                            <PuffLoader color={tertiaryColor} loading={loading} size={60} />
                        </div>
                    ) : (

                        <div className="scrollable-list-container">
                            <div className="panel-content">
                                {/*Lista de vehículos */}

                                {vehicles.map(vehicle => (
                                    <ResultItem
                                        key={vehicle.id}
                                        type="car"
                                        data={vehicle}
                                        flagIcon={flagIcon}
                                        eyeIcon={eyeBlueIcon}
                                        onClickMain={e => handleCarHistory(vehicle.id, e)}
                                        onClickEye={handleCarInformation}
                                    />
                                ))}

                            </div>
                        </div>

                    )}

                </div>

                <div className="right-panel">
                    <ToastContainer />
                    {/*Sección para mostrar el botón de agregar vehículo */}
                    {showButtonAddVehicle && !showCarHistory && !showCarInformation && !showMaintenance && (
                        <>
                            <SectionTitle
                                title="Panel de Vehículos"
                            />

                            <ButtonCard
                                icon="addVehicle"
                                title="Nuevo Vehículo"
                                description="Agrega un vehículo de un cliente"
                                onClick={handleOpenModalSearchClient}
                            />
                        </>
                    )}

                    {/*Sección para mostrar el formulario para agregar un vehículo*/}
                    {showAddVehicle && !showButtonAddVehicle && !showCarHistory && !showCarInformation && !showMaintenance && (
                        <VehicleFormPanel
                            mode="add"
                            plateCar={plateCar}
                            setPlateCar={setPlateCar}
                            year={year}
                            setYear={setYear}
                            brand={brand}
                            setBrand={setBrand}
                            model={model}
                            setModel={setModel} 
                            motor={motor}
                            setMotor={setMotor}
                            category={category}
                            setCategory={setCategory}
                            km={km}
                            setKm={setKm}
                            handleInputFocus={handleInputFocus}
                            handleInputBlur={handleInputBlur}
                            onSubmit={handleAddVehicle}
                            onBack={handleGoBackButton}
                            nameClient={nameClient}
                        />

                    )}

                    {showCarHistory && !showAddVehicle && !showButtonAddVehicle && !showCarInformation && !showMaintenance && (
                        <div>
                            {/*
                            <div className="containerTitle-car-maintenance">
                                <label className="label-maintenance"></label>
                                <button className="button-maintenance" onClick={handleMaintenance}>
                                    <span className="button-maintenance-text">Mantenimiento</span>
                                    <img src={iconAlertWhite} className="icon-alert-white" alt="Icon Maintenance" />
                                </button>
                            </div>
                             */}

                            <CustomTitleSection
                                onBack={handleGoBackButton}
                                titlePrefix="Panel Vehículos"
                                title="Historial de Órdenes de trabajo"
                                showCustomButton={false}
                                showDisableIcon={false}
                                showEditIcon={false}
                                showFilterIcon={true}
                                onFilter={handleOpenModalWorkOrder}
                            />

                            <div className="vehicle-history-header">

                                <div className="vehicle-info-left">
                                    <div className="plate-container">
                                        <div className="plate-display">
                                            <div className="plate-ecuador-row">
                                                <img src={flagIcon} alt="flag" className="ecuador-flag" />
                                                <span className="ecuador-label">ECUADOR</span>
                                            </div>
                                            <div className="plate-value">{selectedPlateVehicle}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="vehicle-info-right">
                                    <div className="vehicle-icon-container">
                                        <img className="vehicle-icon" src={iconsVehicles[category]} alt="Icon Vehicle" />
                                    </div>
                                    <div className="vehicle-client-name">
                                        <label>{nameClient}</label>
                                    </div>
                                </div>


                            </div>


                            <div className="car-history-section">
                                <DataTable
                                    data={workOrders}
                                    columns={columns}
                                    highlightRows={true}
                                />
                            </div>

                        </div>
                    )}

                    {showCarInformation && !showAddVehicle && !showButtonAddVehicle && !showCarHistory && !showMaintenance && (
                        <VehicleFormPanel
                            mode="edit"
                            plateCar={plateCar}
                            setPlateCar={setPlateCar}
                            year={year}
                            setYear={setYear}
                            brand={brand}
                            setBrand={setBrand}
                            model={model}
                            setModel={setModel}
                            motor={motor}
                            setMotor={setMotor}
                            category={category}
                            setCategory={setCategory}
                            km={km}
                            setKm={setKm}
                            isEditMode={isEditMode}
                            setIsEditMode={setIsEditMode}
                            isInputFocused={isInputFocused}
                            handleInputFocus={handleInputFocus}
                            handleInputBlur={handleInputBlur}
                            onSubmit={handleEditVehicle}
                            onBack={handleGoBackButton}
                            onDisable={openAlertModalVehicleSuspend}
                            onEdit={() => setIsEditMode(true)}
                            nameClient={nameClient}
                        />
                    )}

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

                    <CustomModal
                        isOpen={isFilterModalOpen}
                        onCancel={closeFilterModal}
                        type="filter-options"
                        subTitle="Seleccione el filtro de búsqueda"
                        onSelect={handleSelectClick}
                        defaultOption={selectedOption}
                        options={vehicleSearchOptions}
                        showCloseButton={false}
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

                    <CustomModal
                        isOpen={isSearchClientModalOpen}
                        onClose={handleCloseModalSearchClient}
                        type="search-client"
                        title="Buscar cliente"
                        onSearchChange={onSearchChange}
                        searchClientTerm={searchClienTerm}
                        activeTab={activeTab}
                        handleTabChange={setActiveTab}
                        clients={clients}
                        handleClientSelect={(id, event) => {
                            handleShowAddVehicle(id, event);
                            handleCloseModalSearchClient();
                        }}
                        showCloseButton={true}
                    />

                )}

                {isAlertVehicleSuspend && (

                    <CustomModal
                        isOpen={isAlertVehicleSuspend}
                        type="confirm-suspend"
                        subTitle="¿Está seguro de suspender el vehículo?"
                        description="Al suspender el vehículo, se ocultará temporalmente del sistema.
                        Podrás volver a activarlo desde Configuración en cualquier momento."
                        onCancel={closeAlertModalVehicleSuspend}
                        onConfirm={handleUnavailableVehicle}
                        showCloseButton={false}
                    />

                )}

                {isSearchWorkOrderModalOpen && (
                    <SearchModalWorkOrder
                        fields={[
                            'WorkOrderCode',
                            'WorkOrderStatus',
                            'DateStartOfSearch',
                            'DateFinishOfSearch',
                            'Assigned',
                            'DeliveredBy',
                            'CreatedBy'
                        ]}
                        onSearch={handleSearhWorkOrder}
                        onClose={handleCloseModalWorkOrder}
                    />
                )}

                {isWorkOrderModalOpen && (

                    <CustomModal
                        isOpen={isWorkOrderModalOpen}
                        type="confirm-workorder"
                        subTitle="Desea generar una nueva orden de trabajo?"
                        description="Se va a registrar una nueva orden de trabajo para este vehículo.
                        Si lo prefiere, puede hacerlo más adelante desde el módulo Órdenes de Trabajo"
                        onCancel={closeWorkOrderModal}
                        onConfirm={handleAddWorkOrder}
                        showCloseButton={false}
                    />
                )}

            </div>

        </div>
    )

};

export default Cars;



