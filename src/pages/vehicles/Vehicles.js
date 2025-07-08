import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { debounce } from 'lodash';
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
import Icon from '../../components/Icons';
import ScrollListWithIndicators from '../../components/ScrollListWithIndicators';
import { showToastOnce } from "../../utils/toastUtils";
import { formatDate, formatPlate } from "../../utils/formatters";

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

    const iconMap = {
        car: "car",
        van: "van",
        bus: "bus",
        truck: "truck",
        suv: "suv",
    };

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
                        <Icon name="eye" className="icon-eye" />
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

        } catch (error) {
            showToastOnce("error", "Error al obtner el historial del vehículo.");
        }

    };

    const handleCarHistory = (vehicleId, event) => {

        if (event) {
            event.stopPropagation();
        }

        const numericVehicleId = Number(vehicleId);
        const vehicleInformation = vehicles.find(vehicle => vehicle.id === numericVehicleId);

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
            showToastOnce("error", "Error al realizar la búsqueda");
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
            showToastOnce("success", "Vehículo registrado");
            setTimeout(() => {
                openWorkOrderModal();
            }, 3000);
            setShowButtonAddVehicle(true);
            resetForm();

        } catch (error) {
            showToastOnce("error", "Error al guardar un vehiculo");
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
                showToastOnce("success", "Información actualizada correctamente.");
                setShowCarInformation(false);
                setShowButtonAddVehicle(true);
            }

        } catch (error) {
            showToastOnce("error", "Error al guardar los cambios. Por favor, inténtalo de nuevo.");
        }
    };

    //Función para suspender un cliente
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
                showToastOnce("success", "Vehículo suspendido.");
            }

        } catch (error) {
            showToastOnce("error", "Error al suspender al vehículo. Por favor, inténtalo de nuevo.");
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

            const fetchAllClients = async () => {
                try {
                    const response = await apiClient.get('/clients/all', {
                        cancelToken: source.token,
                    });
                    if (isMounted.current) {
                        setClients(response.data);
                    }
                } catch (error) {
                    if (!axios.isCancel(error)) { }
                }
            };
            fetchAllClients();
        } else {
            handleSearchClientWithDebounce();
        }

        return () => {
            isMounted.current = false;
            const CancelToken = axios.CancelToken;
            const source = CancelToken.source();
            source.cancel('Search term changed or component unmounted');
        };
    }, [searchClienTerm, handleSearchClientWithDebounce]);

    //Función que permite obtener todos los vehículos 
    //registrados cuando inicia la pantalla y busca los vehículos 
    //por placa y nombre de titular
    useEffect(() => {

        const fetchData = async () => {

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
                const response = await apiClient.get(endpoint);
                if (response.data && response.data.length > 0) {
                    const formattedVehicles = response.data.map(vehicle => {
                        if (vehicle.plate) {
                            vehicle.plate = formatPlate(vehicle.plate);
                        }
                        return vehicle;
                    });

                    setVehicles(formattedVehicles);
                    setLoading(false);
                } else {
                    setLoading(false);
                }

            } catch (error) {
                if (error.code === 'ECONNABORTED') {
                    showToastOnce("error", "Error al cargar la información vuelva a intentarlo.");
                } 
            }
        }
        fetchData();
    }, [searchTerm, selectedOption, refreshVehicles, vehicleSuspended]);

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
    }, [selectedVehicle]);

    useEffect(() => {
        const numericVehicleId = Number(vehicleId);

        if (numericVehicleId && vehicles.length > 0) {
            handleCarHistory(numericVehicleId);
        }
    }, [vehicleId, vehicles]); 

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

                        <ScrollListWithIndicators
                            items={vehicles}
                            renderItem={(vehicle) => (
                                <ResultItem
                                    key={vehicle.id}
                                    type="car"
                                    data={vehicle}
                                    flagIcon={flagIcon}
                                    onClickMain={e => handleCarHistory(vehicle.id, e)}
                                    onClickEye={handleCarInformation}
                                />

                            )}
                        />
                    )}

                </div>

                <div className="right-panel">

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
                                        <Icon name={iconMap[category]} className="vehicle-icon" />
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



