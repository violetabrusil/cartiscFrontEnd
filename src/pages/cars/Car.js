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
import { useStatusColors } from "../../utils/useStatusColors";
import useCSSVar from "../../hooks/UseCSSVar";
import ResultItem from "../../resultItem/ResultItem";

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

    const grayMediumDark = useCSSVar('--gray-medium-dark');
    const blackAlpha34 = useCSSVar('--black-alpha-34');
    const tertiaryColor = useCSSVar('--tertiary-color');

    //Variable para el filtro y la búsqueda de vehículos y clientes
    const { selectedOption = "Nombre Titular", setSelectedOption, searchTerm, setSearchTerm } = useCarContext();
    const [activeTab, setActiveTab] = useState('cédula');
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
    const optionsMaintance = ['Cambio de aceite', 'Cambio de motor'];
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);

    const statusColors = useStatusColors();

    const { vehicleId } = useParams();

    const navigate = useNavigate();

    const transformPlateForSaving = (plateWithDash) => {
        return plateWithDash.replace(/-/g, '');
    };

    const isTabletLandscape = window.matchMedia("(min-width: 800px) and (max-width: 1340px) and (orientation: landscape)").matches;

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            className: 'custom-select-control',
            width: isTabletLandscape ? '95%' : '99%',
            height: '50px', // Estilo personalizado para la altura
            border: `1px solid ${blackAlpha34}`, // Estilo personalizado para el borde con el color deseado
            borderRadius: '4px', // Estilo personalizado para el borde redondeado
            padding: '8px',
            marginBottom: '20px',
            marginTop: '8px'
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: grayMediumDark, // Color del texto del placeholder
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

    const handleOptionChange = (option) => {
        setSelectedOption(option);
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
                        onClick={() => handleShowInformationWorkOrderClick(workOrder.id)}
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
        const vehiclePlate = vehicles.find(vehicle => vehicle.id === numericVehicleId);

        // Asegúrate de que el vehículo fue encontrado antes de continuar
        if (vehiclePlate) {
            setSelectedPlateVehicle(vehiclePlate.plate);
            setShowCarHistory(true);
            setShowCarInformation(false);
            setShowMaintenance(false);
            setShowAddVehicle(false);
            setShowButtonAddVehicle(false);
            getVehicleHistoryData(numericVehicleId);
            navigate(`/cars/carHistory/${numericVehicleId}`);
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
        console.log("estoy dando click")
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

    const handleSearchClientWithDebounce = useCallback(
        debounce(async () => {
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
        // Al montar el componente
        isMounted.current = true;

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
                    setLoading(false);
                    console.log("datos vehiculo", response.data)
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
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
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

                        <div className="panel-content">
                            {/*Lista de vehículos */}
                            <div className="scrollable-list-container">
                                {vehicles.map(vehicle => (
                                    <ResultItem
                                        key={vehicle.id}
                                        type="car"
                                        data={vehicle}
                                        flagIcon={flagIcon}
                                        eyeIcon={eyeIcon}
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
                        <CustomButtonContainer>
                            <CustomButton title="AGREGAR VEHÍCULO" onClick={handleOpenModalSearchClient} />
                        </CustomButtonContainer>
                    )}

                    {/*Sección para mostrar el formulario para agregar un vehículo*/}
                    {showAddVehicle && !showButtonAddVehicle && !showCarHistory && !showCarInformation && !showMaintenance && (
                        <>
                            <CustomTitleSection
                                onBack={handleGoBackButton}
                                title={nameClient}
                            />

                            <div className="panel-content-form">
                                <div className="form-scroll">

                                    <div className={`input-container ${isInputFocused ? "active" : ""}`}>
                                        <div className="label-container">
                                            <img src={flagIcon} alt="Flag" className="flag-icon" />
                                            <label className="label-plate-vehicle">ECUADOR</label>
                                        </div>
                                        <input
                                            className="input-plate"
                                            type="text"
                                            value={plateCar}
                                            onChange={handleCarPlateChange}
                                            onFocus={handleInputFocus}
                                            onBlur={handleInputBlur}
                                        />

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

                                </div>

                                <div className="container-button-next">
                                    <button className="button-next" onClick={handleAddVehicle}>
                                        GUARDAR
                                    </button>
                                </div>
                            </div>

                        </>

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

                        </div>
                    )}

                    {showCarInformation && !showAddVehicle && !showButtonAddVehicle && !showCarHistory && !showMaintenance && (
                        <div>
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

                        </div>
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



