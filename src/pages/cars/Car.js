import "../../Car.css";
import "../../Modal.css";
import "../../NewClient.css";
import "../../Clients.css";
import "../../Loader.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { debounce } from 'lodash';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import PuffLoader from "react-spinners/PuffLoader";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import Modal from "../../modal/Modal";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import apiClient from "../../services/apiClient";
import DataTable from "../../dataTable/DataTable";
import axios from "axios";
import { CustomButtonContainer, CustomButton } from "../../customButton/CustomButton";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import { workOrderStatus } from "../../constants/workOrderConstants";
import SearchModalWorkOrder from "../../modal/SearchModalWorkOrder";
import { CustomPlaceholder } from "../../customPlaceholder/CustomPlaceholder";
import { CustomSingleValue } from "../../customSingleValue/CustomSingleValue";
import { useNavigate, useParams } from "react-router-dom";
import { useCarContext } from "../../contexts/searchContext/CarContext";
import TitleAndSearchBoxSpecial from "../../titleAndSearchBox/TitleAndSearchBoxSpecial";
import { useScrollRestoration } from "../../hooks/useScrollRestoration";

const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
const iconAlertWhite = process.env.PUBLIC_URL + "/images/icons/alerIconWhite.png";
//const alertIcon = process.env.PUBLIC_URL + "/images/icons/alertIcon.png";
const sortLeftIcon = process.env.PUBLIC_URL + "/images/icons/sortLeftIcon.png";
const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";
const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const searchIcon = process.env.PUBLIC_URL + "/images/icons/searchIcon.png";
const filterIcon = process.env.PUBLIC_URL + "/images/icons/filterIcon.png";
const arrowLeftIcon = process.env.PUBLIC_URL + "/images/icons/arrowLeftIcon.png";
const yearIcon = process.env.PUBLIC_URL + "/images/icons/year.png";
const kmIcon = process.env.PUBLIC_URL + "/images/icons/km.png";
const brandIcon = process.env.PUBLIC_URL + "/images/icons/brand.png";
const modelIcon = process.env.PUBLIC_URL + "/images/icons/model.png";
const motorIcon = process.env.PUBLIC_URL + "/images/icons/engine.png";

const Cars = () => {

    const { selectedOption = "Nombre Titular", setSelectedOption, searchTerm, setSearchTerm } = useCarContext();
    const [activeTab, setActiveTab] = useState('cédula');
    const [searchClienTerm, setSearchClientTerm] = useState('');
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [nameClient, setNameClient] = useState('');
    const [loading, setLoading] = useState(true);

    const [vehicles, setVehicles] = useState([]);
    const iconsVehicles = useMemo(() => {
        return {
            car: process.env.PUBLIC_URL + "/images/icons/autoIcon.png",
            suv: process.env.PUBLIC_URL + "/images/icons/suvIcon.png",
            pickup_truck: process.env.PUBLIC_URL + "/images/icons/camionetaIcon.png",
            van: process.env.PUBLIC_URL + "/images/icons/busIcon.png",
            truck: process.env.PUBLIC_URL + "/images/icons/camionIcon.png"
        };
    }, []); 

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isSearchClientModalOpen, setIsSearchClientModalOpen] = useState(false);
    const isMounted = useRef(false);
    const source = axios.CancelToken.source();
    const options = [
        { value: 'car', label: 'Auto' },
        { value: 'suv', label: 'SUV' },
        { value: 'pickup_truck', label: 'Camioneta' },
        { value: 'van', label: 'Buseta' },
        { value: 'truck', label: 'Camión' },
    ];
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [refreshVehicles, setRefreshVehicles] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAlertVehicleSuspend, setIsAlertVechicleSuspend] = useState(false);
    const [vehicleSuspended, setVehicleSuspended] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [workOrders, setWorkOrders] = useState([]);
    const [isSearchWorkOrderModalOpen, setIsSearchWorkOrderModalOpen] = useState(false);
    const [selectedPlateVehicle, setSelectedPlateVehicle] = useState(null);

    const [category, setCategory] = useState('');
    const [plateCar, setPlateCar] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [motor, setMotor] = useState('');
    const [km, setKm] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [showCarInformation, setShowCarInformation] = useState(false);
    const [showCarHistory, setShowCarHistory] = useState(false);
    const [showMaintenance, setShowMaintenance] = useState(false);
    const [showButtonAddVehicle, setShowButtonAddVehicle] = useState(true);
    const [showAddVehicle, setShowAddVehicle] = useState(false);
    const optionsMaintance = ['Cambio de aceite', 'Cambio de motor'];
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);

    const { vehicleId } = useParams();

    const navigate = useNavigate();

    const transformPlateForSaving = (plateWithDash) => {
        return plateWithDash.replace(/-/g, '');
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            className: 'custom-select-control',
            width: '100%',
            height: '44px', 
            border: '1px solid rgb(0 0 0 / 34%)',
            borderRadius: '4px',
            padding: '8px',
            marginBottom: '20px',
            marginTop: '8px',
            boxSizing: 'border-box'
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: '#999', 
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-select-option',
        }),
        menu: (provided, state) => ({
            ...provided,
            width: '100%', 
        }),

    };

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
        setSearchTerm("");
        setSelectedOption("Nombre Titular");
    };

    const handleSearchVehiclesWithDebounce = useMemo(
        () => debounce((term) => {
            if (term.length === 0) {
                setSearchTerm("");
            } else if (term.length >= 3) {
                setSearchTerm(term);
            }
        }, 500),
        [setSearchTerm]
    );

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
        setSelectedOption(option);
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
                <label style={{ color: statusColors[value], fontWeight: "bold" }}>
                    {value}
                </label>
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
        },
        {
            Header: 'Total',
            accessor: 'total',
            Cell: ({ value }) => (
                <span>
                    $ {parseFloat(value).toFixed(2)}
                </span>
            )
        },
        {
            Header: 'Creado por',
            accessor: 'created_by'
        },
        {
            Header: "",
            Cell: ({ row }) => {
                const workOrder = row.original;
                return (
                    <button
                        className="button-eye-car-work-order"
                        onClick={() => handleShowInformationWorkOrderClick(workOrder.id, `/cars/carHistory/${vehicleId}`)}
                    >

                        <img src={eyeIcon} alt="Eye Icon Work Order" className="icon-eye-car-work-order"
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
        const day = String(date.getUTCDate()).padStart(2, '0'); 
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); 
        const year = date.getUTCFullYear();  

        return `${day}/${month}/${year}`;
    };

    const statusColors = {
        "Por iniciar": "#316EA8",
        "Asignada": "#0C1F31",
        "En ejecución": "#4caf50",
        "En espera": "#fbc02d",
        "Cancelada": "#e74c3c",
        "Completada": "#2e7d32",
        "Eliminada": "#6E757D"
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
        if (event) {
            event.stopPropagation();
        }

        const numericVehicleId = Number(vehicleId);
        const vehiclePlate = vehicles.find(vehicle => vehicle.id === numericVehicleId);

        if (vehiclePlate) {
            setSelectedPlateVehicle(vehiclePlate.plate);
            setWorkOrders([]);
            setShowCarHistory(true);
            setShowCarInformation(false);
            setShowMaintenance(false);
            setShowAddVehicle(false);
            setShowButtonAddVehicle(false);
            getVehicleHistoryData(numericVehicleId);
            navigate(`/cars/carHistory/${numericVehicleId}`);
        } else {
            console.error(`No se encontró el vehículo con ID: ${numericVehicleId}`);
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
        return plateInput; 
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
                return [...prev, name];
            } else {
                return prev.filter(option => option !== name);
            }
        });
    };

    const handleAddVehicle = async (event) => {
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
            resetForm();

        } catch (error) {
            toast.error('Error al guardar un vehiculo', {
                position: toast.POSITION.TOP_RIGHT
            });
        }

    };

    const handleSearchClientWithDebounce = useMemo(
        () => debounce(async (term, tab, signal) => {
            if (!term) return;
            let endpoint = tab === 'cédula'
                ? `/clients/search-by-cedula/${term}`
                : `/clients/search-by-name/${term}`;

            try {
                const response = await apiClient.get(endpoint, { signal });
                setClients(response.data || []);
            } catch (error) {
                if (error.name === 'AbortError') return;
                setClients([]);
            }
        }, 500),
        []
    );

    const handleEditVehicle = async (event) => {
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
                    autoClose: 5000 
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

    const handleUnavailableVehicle = async (event) => {
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

    useEffect(() => {
        const controller = new AbortController();
        if (searchClienTerm) {
            handleSearchClientWithDebounce(searchClienTerm, activeTab, controller.signal);
        } else {
            setClients([]);
        }
        return () => controller.abort();
    }, [searchClienTerm, activeTab, handleSearchClientWithDebounce]);

    useEffect(() => {

        const controller = new AbortController();

        const fetchData = async () => {

            setLoading(true);
            let endpoint = '/vehicles/all';
            const searchTypePlate = "plate";
            const searchTypeClientName = "client_name";

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
                const response = await apiClient.get(endpoint, {
                    signal: controller.signal
                });

                if (!controller.signal.aborted) {
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
                        setVehicles([]);
                    }

                }

            } catch (error) {
                if (error.name === 'AbortError' || error.name === 'CanceledError') {
                    return;
                }
                console.error('Error al cargar la información:', error.message);
                setVehicles([]);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };
        fetchData();

        return () => controller.abort();

    }, [searchTerm, selectedOption, refreshVehicles, vehicleSuspended, iconsVehicles]);

    useEffect(() => {
        console.log("Valor de selectedOption al regresar:", selectedOption, searchTerm);
    }, [selectedOption, searchTerm]);


    useEffect(() => {
        if (selectedVehicle) {
            setPlateCar(selectedVehicle.plate);
            setYear(selectedVehicle.year);
            setCategory(selectedVehicle.category);
            setKm(selectedVehicle.km);
            setBrand(selectedVehicle.brand);
            setModel(selectedVehicle.model);
            setMotor(selectedVehicle.motor);
        }
    }, [selectedVehicle, iconsVehicles]);

    useEffect(() => {
        if (!vehicleId || vehicles.length === 0) return;

        const numericVehicleId = Number(vehicleId);
        const vehicleExists = vehicles.some(v => v.id === numericVehicleId);

        if (vehicleExists && !showCarHistory) {
            handleCarHistory(numericVehicleId);
        }
    }, [vehicleId, vehicles.length]);

    const isAddVehicleButtonHidden = showAddVehicle || showCarHistory || showCarInformation || showMaintenance;
    const vehicleListScrollRef = useScrollRestoration('cars:list', !loading && !isAddVehicleButtonHidden);

    const isResolvingVehicleFromUrl = Boolean(vehicleId) && !showCarHistory;

    if (isResolvingVehicleFromUrl) {
        return (
            <div>
                <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
                <Menu resetFunction={resetVehicleState} />
                <div className="loader-container" style={{ marginLeft: '-93px' }}>
                    <PuffLoader color="#316EA8" loading={true} size={60} />
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu resetFunction={resetVehicleState} />

            <div className={`containerCars ${isAddVehicleButtonHidden ? "hide-list-mobile compact-header-mobile" : ""}`}>
                <div className="left-section-cars">
                    <TitleAndSearchBoxSpecial
                        selectedOption={selectedOption}
                        searchTerm={searchTerm}
                        title="Vehículos"
                        onSearchChange={handleSearchVehiclesWithDebounce}
                        onButtonClick={openFilterModal}
                        shouldSaveSearch={true}
                        wrapperClassName="title-search-wrapper"
                    />

                    {loading ? (
                        <div className="loader-container" style={{ marginLeft: '-93px' }}>
                            <PuffLoader color="#316EA8" loading={loading} size={60} />
                        </div>
                    ) : (

                        <>
                       
                            <div className="container-list-vehicle" ref={vehicleListScrollRef}>
                                {vehicles.map(vehicleData => (
                                    <div key={vehicleData.id} className="result-car" onClick={(event) => handleCarHistory(vehicleData.id, event)}>
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
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleCarInformation(vehicleData, event)
                                                    }} />
                                            </button>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </>

                    )}

                </div>

                <div className="right-section-cars">
                    <ToastContainer />
                    {showButtonAddVehicle && !showCarHistory && !showCarInformation && !showMaintenance && (
                        <CustomButtonContainer>
                            <CustomButton title="AGREGAR VEHÍCULO" onClick={handleOpenModalSearchClient} />
                        </CustomButtonContainer>
                    )}

                    {showAddVehicle && !showButtonAddVehicle && !showCarHistory && !showCarInformation && !showMaintenance && (
                        <>
                            <CustomTitleSection
                                onBack={handleGoBackButton}
                                title={nameClient}
                            />

                            <div className="container-add-car-form">
                                <div className="form-scroll">
                                    <form>
                                        <div className={`input-container ${isInputFocused ? "active" : ""}`}>
                                            <input className="input-plate" type="text" value={plateCar} onChange={handleCarPlateChange}
                                                onFocus={handleInputFocus} onBlur={handleInputBlur}
                                                autoComplete="off" autoCorrect="off" autoCapitalize="characters" spellCheck="false" />
                                            <img src={flagIcon} alt="Flag" className="flag-icon" />
                                            <label className="label-plate-vehicle">ECUADOR</label>
                                            {/*<button className="button-alert" type="button" onClick={handleAlertClick}>
                                            <img src={alertIcon} className="alert" alt="Alert" />
                                        </button>
                                        */}
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

                            <div className="container-button-next">
                                <button className="button-next" onClick={handleAddVehicle}>
                                    GUARDAR
                                </button>
                            </div>
                        </>


                    )}

                    {showCarHistory && !showAddVehicle && !showButtonAddVehicle && !showCarInformation && !showMaintenance && (
                        <>
                            {/*
                            <div className="containerTitle-car-maintenance">
                                <label className="label-maintenance"></label>
                                <button className="button-maintenance" onClick={handleMaintenance}>
                                    <span className="button-maintenance-text">Mantenimiento</span>
                                    <img src={iconAlertWhite} className="icon-alert-white" alt="Icon Maintenance" />
                                </button>
                            </div>
                            */}
                            <div className="container-maintenance-filter">
                                <button onClick={handleGoBackButton} className="button-arrow-new-client">
                                    <img src={arrowLeftIcon} className="arrow-icon-new-client" alt="Arrow Icon" />
                                </button>
                                <h2>Historial de Órdenes de trabajo</h2>
                                <button className="button-maintenance-filter" onClick={handleOpenModalWorkOrder}>
                                    <img src={filterIcon} alt="Filter Icon" className="filter-icon" />
                                    <span className="button-maintenance-text-filter">Filtro</span>
                                </button>

                            </div>

                            <div className="car-history-section">
                                <DataTable
                                    data={workOrders}
                                    columns={columns}
                                    highlightRows={true}
                                />
                            </div>

                        </>
                    )}

                    {showCarInformation && !showAddVehicle && !showButtonAddVehicle && !showCarHistory && !showMaintenance && (
                        <>
                            <CustomTitleSection
                                onBack={handleGoBackButton}
                                title="Información del vehículo"
                                showDisableIcon={true}
                                onDisable={openAlertModalVehicleSuspend}
                                showEditIcon={true}
                                onEdit={() => setIsEditMode(true)}
                            />

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
                                                autoComplete="off"
                                                autoCorrect="off"
                                                autoCapitalize="characters"
                                                spellCheck="false"
                                            />
                                            <img src={flagIcon} alt="Flag" className="flag-icon" />
                                            <label className="label-plate-vehicle">ECUADOR</label>
                                            {/*<button className="button-alert" type="button" onClick={handleAlertClick}>
                                                <img src={alertIcon} className="alert" alt="Alert" />
                    </button                >*/}
                                        </div>

                                        <label className="label-form">
                                            Año
                                            <div className="input-form-new-client">
                                                <input
                                                    className="input-form-add-vehicle"
                                                    type="number"
                                                    value={year}
                                                    onChange={(e) => setYear(parseInt(e.target.value))}
                                                    readOnly={!isEditMode}
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
                                                components={{ SingleValue: CustomSingleValue }}
                                                isSearchable={false}
                                                options={options}
                                                value={options.find(option => option.value === category)}
                                                onChange={handleTypeCarChange}
                                                styles={customStyles}
                                                readOnly={!isEditMode}
                                                menuPortalTarget={document.body}
                                            />
                                        </label>
                                        <label className="label-form">
                                            Kilometraje actual
                                            <div className="input-form-new-client">
                                                <input
                                                    className="input-form-add-vehicle"
                                                    type="number"
                                                    value={km}
                                                    onChange={(e) => setKm(parseInt(e.target.value))}
                                                    readOnly={!isEditMode}
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
                                                    readOnly={!isEditMode}
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
                                                    readOnly={!isEditMode}
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
                                                    readOnly={!isEditMode}
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

                                {isEditMode &&
                                    <div className="container-button-edit-vehicle">
                                        <button className="button-edit-data-vehicle" onClick={handleEditVehicle}>
                                            GUARDAR
                                        </button>
                                    </div>
                                }
                            </div>

                        </>
                    )}

                    {showMaintenance && !showAddVehicle && !showButtonAddVehicle && !showCarHistory && !showCarInformation && (
                        <>

                            <div className="containerNewClientTitle">
                                <button className="button-sort" onClick={handleCarHistory}>
                                    <img src={sortLeftIcon} alt="Sort left Icon" className="icon-sort" />
                                </button>
                                <h2 style={{ marginLeft: "8px" }}>Mantenimiento</h2>
                            </div>

                            <div className="container-maintenance-options">
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

                        </>
                    )}

                </div>

                {/*Modal del filtro de búsqueda*/}

                {isFilterModalOpen && (
                    <Modal
                        isOpen={isFilterModalOpen}
                        onClose={closeFilterModal}
                        options={['Nombre Titular', 'Placa']}
                        defaultOption={selectedOption}
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
                            <p className="search-client-instruction">
                                Para agregar un vehículo, primero busca al cliente por cédula o nombre y selecciónalo de los resultados.
                            </p>
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

            </div>

        </div>
    )

};

export default Cars;



