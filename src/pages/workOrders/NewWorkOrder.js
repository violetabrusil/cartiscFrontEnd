import "../../NewWorkOrder.css";
import "../../Modal.css"
import 'react-toastify/dist/ReactToastify.css';
import "react-multi-carousel/lib/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import React, { useState, useRef, useEffect, useMemo, useContext } from "react";
import Carousel from "react-multi-carousel";
import { debounce } from 'lodash';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import Modal from "../../modal/Modal";
import VehiclePlans from "../../vehicle-plans/VehiclePlans";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import apiClient from "../../services/apiClient";
import ClientContext from "../../contexts/ClientContext";
import { AddNewClientModal } from "../../modal/AddClientModal";
import { AddNewVehicleModal } from "../../modal/AddVehicleModal";
import useCSSVar from "../../hooks/UseCSSVar";

const clientIcon = process.env.PUBLIC_URL + "/images/icons/userIcon-gray.png";
const autoIcon = process.env.PUBLIC_URL + "/images/icons/autoIcon.png";
const busetaIcon = process.env.PUBLIC_URL + "/images/icons/busIcon.png";
const camionetaIcon = process.env.PUBLIC_URL + "/images/icons/camionetaIcon.png";
const camionIcon = process.env.PUBLIC_URL + "/images/icons/camionIcon.png";
const arrowLeftIcon = process.env.PUBLIC_URL + "/images/icons/arrowLeftIcon.png";
const fuelIcon = process.env.PUBLIC_URL + "/images/icons/fuelIcon.png";
const carPlan = process.env.PUBLIC_URL + "/images/vehicle plans/Car.png";
const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";
const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";


const NewWorkOrder = () => {

    const blackAlpha34 = useCSSVar('--black-alpha-34');

    const WorkOrderStatusOptions = [
        { value: 'to_start', label: 'Por iniciar' },
        { value: 'assigned', label: 'Asignada' },
        { value: 'in_development', label: 'En desarrollo' },
        { value: 'stand_by', label: 'En pausa' },
        { value: 'cancelled', label: 'Cancelada' },
        { value: 'completed', label: 'Completada' },
        { value: 'deleted', label: 'Eliminada' },
    ];

    const { user } = useContext(AuthContext);

    const [selectedOption, setSelectedOption] = useState('Nombre');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [clients, setClients] = useState([]);
    const { selectedClient, setSelectedClient } = useContext(ClientContext);
    const { selectedVehicle } = useContext(ClientContext);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [isKmModalOpen, setIsKmModalOpen] = useState(false);
    const [dateStart, setDateStart] = useState(new Date());
    const [workOrderStatus, setWorkOrderStatus] = useState(WorkOrderStatusOptions[0]);
    const [createdBy, setCreatedBy] = useState(user?.username || "");
    const [isChecked, setIsChecked] = useState(false);
    const [showConfirmationToast, setShowConfirmationToast] = useState(false);
    const [actualKm, setActualKm] = useState("");
    const [comments, setComments] = useState("");
    const [observations, setObservations] = useState('');
    const navigate = useNavigate();
    const [symptoms, setSymptoms] = useState([]);
    const symptomsEndRef = useRef(null);
    const symptomsContainerRef = useRef(null);
    const [placeholder, setPlaceholder] = useState("Describa los síntomas");
    const [pointsOfInterest, setPointsOfInterest] = useState([]);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
    const [toastShown, setToastShown] = useState(false);
    const [shouldUpdateClients, setShouldUpdateClients] = useState(false);
    const [shouldUpdateVehicles, setShouldUpdateVehicles] = useState(false);

    const showToast = (message, type) => {
        toast[type](message, { position: toast.POSITION.TOP_RIGHT });
    };

    const handleSearchClientChange = (term, filter) => {
        setSearchTerm(term);
        setSelectedOption(filter);
    };

    const handleSearchClientWithDebounce = debounce(handleSearchClientChange, 500);

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const openAddClientModal = () => {
        setIsAddClientModalOpen(true);
    };

    const closeAddClientModal = () => {
        setIsAddClientModalOpen(false);
        setShouldUpdateClients(true);
    };

    const openAddVehicleModal = () => {
        setIsAddVehicleModalOpen(true);
    };

    const closeAddVehicleModal = () => {
        setIsAddVehicleModalOpen(false);
        setShouldUpdateVehicles(true);
    };

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const handleSelectClick = (option) => {
        setSelectedOption(option);
        // Cerrar el modal después de seleccionar.
        closeFilterModal();
    };

    const handleClientSelect = async (client) => {
        setSelectedClient(client);
        await getVehicleOfClient(client.id);
    };

    const handleDeselectClient = () => {
        setSelectedClient();
        setSearchTerm('');
        setVehicles([]);
    };

    const iconsVehicles = useMemo(() => {
        return {
            car: process.env.PUBLIC_URL + "/images/icons/autoIcon.png",
            van: process.env.PUBLIC_URL + "/images/icons/camionetaIcon.png",
            bus: process.env.PUBLIC_URL + "/images/icons/busIcon.png",
            truck: process.env.PUBLIC_URL + "/images/icons/camionIcon.png"
        };
    }, []);

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

    const customStylesStatus = {
        control: (provided, state) => ({
            ...provided,
            height: '33px',
            minHeight: '33px',
            border: `1px solid ${blackAlpha34}`
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: blackAlpha34,
            fontWeight: '600',
        }),
    };

    const handleSelectChange = (statusWorkOrder) => {
        setWorkOrderStatus(statusWorkOrder.value);
    };

    const keyMapping = {
        "Antena": "antenna",
        "Radio": "radio",
        "Plumas": "wipers",
        "Extintor": "fire_extinguisher",
        "Control puerta": "door_lock",
        "Encendedor": "cigarette_lighter",
        "Maqueta": "carpet",
        "Espejos": "mirrors",
        "Triángulos": "warning_triangles",
        "Llantas": "tires",
        "Gata": "jack",
        "Herramientas": "tools",
        "Gas": "fuel_level",
        "Llave rueda": "wheel_wrench"
    };

    const [vehicles, setVehicles] = useState([]);

    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 5,
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 4,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 3,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        },
    };

    //Opciones para el estado de entrega del vehículo
    const optionsCheckBox = {
        group1: ['Antena', 'Radio', 'Plumas', 'Extintor', 'Control puerta'],
        group2: ['Encendedor', 'Maqueta', 'Espejos', 'Triángulos', 'Combustible'],
        group3: ['Llantas', 'Gata', 'Herramientas', 'Llave rueda', 'Gas']
    };

    //Estado de las selecciones y porcentajes
    const [selections, setSelections] = useState({
        group1: Array(optionsCheckBox.group1.length).fill(false),
        group2: Array(optionsCheckBox.group2.length).fill(false),
        group3: Array(optionsCheckBox.group3.length).fill(false),
    });

    const [percentages, setPercentages] = useState({
        group3: [null, null, null, 0, null],
    });

    //Función para manjenar los cambios en los checkbox
    const handleCheckboxChange = (group, index) => {
        setSelections((prev) => ({
            ...prev,
            [group]: [
                ...prev[group].slice(0, index),
                !prev[group][index],
                ...prev[group].slice(index + 1),
            ],
        }));
    };

    //Función para manejar los cambios en los porcentajes
    const handlePorcentageChange = (group, index, event) => {
        setPercentages((prev) => ({
            ...prev,
            [group]: [
                ...prev[group].slice(0, index),
                event.target.value,
                ...prev[group].slice(index + 1),
            ],
        }));
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const text = event.target.innerText.trim();
            if (text !== '') {
                setSymptoms(prev => [...prev, text]);
                event.target.innerText = '';
            }
        }
    };

    const handleUpdateSymptom = (index, newSymptom) => {
        const newSymptoms = [...symptoms];
        newSymptoms[index] = newSymptom;
        setSymptoms(newSymptoms);
        // Si la lista no está vacía después de la actualización,
        // oculta el texto del marcador de posición.
        if (newSymptoms.some(item => item)) {
            setPlaceholder("");
        }
    };

    const getVehicleOfClient = async (clientId) => {
       
        try {
            const response = await apiClient.get(`/vehicles/active/${clientId}`);
            if (response.data && response.data.length > 0) {
                const formattedVehicles = response.data.map((vehicle) => {
                    if (vehicle.plate) {
                        vehicle.plate = formatPlate(vehicle.plate);
                    }
                    vehicle.iconSrc = iconsVehicles[vehicle.category];
                    return vehicle;
                });
                setVehicles(formattedVehicles);
                setToastShown(false);
            } else {
                setVehicles([]);
                setToastShown(true);
            }
        } catch (error) {
            showToast('Error al obtener los vehículos del cliente', 'error');
        }
    };

    const handleWorkOrderCreation = () => {
        if (actualKm.trim() !== '') {
            // Si el campo de kilometraje actual no está vacío, llamar directamente a la función de crear la orden de trabajo
            createNewWorkOrder();
        } else {
            // Si el campo de kilometraje actual está vacío, abrir el modal
            setIsKmModalOpen(true);
        }
    };

    const closeWorkOrderCreation = () => {
        setIsKmModalOpen(false);
    };

    const handleAccept = () => {
        // Validar si el checkbox no está marcado y el input está vacío, mostrar el mensaje de advertencia
        if (!isChecked && !actualKm.trim()) {
            toast.warn("Es necesario ingresar el nuevo kilometraje.", {
                position: toast.POSITION.TOP_RIGHT
            });

            // No cerrar el modal en este caso
            return;
        }

        // Validar si el checkbox está marcado y el valor del kilómetro no tiene un formato numérico válido
        if (isChecked && !isNumber(actualKm)) {
            toast.warn('El KM ingresado no tiene un formato numérico válido. Intente nuevamente.', {
                position: toast.POSITION.TOP_RIGHT
            });

            // No cerrar el modal en este caso
            return;
        }

        // Ahora, solo si isChecked es true y actualKm no está vacío o si el formato es válido, llamamos a la función
        createNewWorkOrder();
        setIsKmModalOpen(false); // Cerrar el modal después de llamar a la función si todo está bien
    };

    const resetForm = () => {
        setSelectedClient(null);
        setSearchTerm("");
        setClients([]);
        setActualKm("");
        setSymptoms([]);
        setObservations("");
        setPointsOfInterest([]);
    };

    const isNumber = (value) => !isNaN(Number(value));

    const createNewWorkOrder = async () => {
        const vehicleStatus = {};
        Object.keys(optionsCheckBox).forEach(group => {
            optionsCheckBox[group].forEach((option, index) => {
                const key = keyMapping[option];
                if (key) {  // Si el mapeo existe
                    if (key !== 'fuel_level') {
                        vehicleStatus[key] = selections[group][index];
                    } else {
                        vehicleStatus[key] = parseInt(percentages[group][index], 10) || 0;
                    }
                }
            });
        });

        vehicleStatus.points_of_interest = pointsOfInterest.map(point => {
            return {
                side: point.side, // Aquí deberías determinar el lado correcto si es necesario.
                x: point.x,
                y: point.y
            }
        });
        vehicleStatus.presented_symptoms = symptoms.join(', ');
        vehicleStatus.general_observations = observations;

        const kmVehicleSelected = vehicles.find(vehicle => vehicle.id === selectedVehicleId);

        if (!isNumber(actualKm)) {
            toast.warn('El KM ingresado no tiene un formato numérico válido. Intente nuevamente.', {
                position: toast.POSITION.TOP_RIGHT
            });
            return;
        }

        const actualKmValue = actualKm !== undefined && !isNaN(Number(actualKm)) ? Number(actualKm) : null;

        const payload = {
            vehicle_id: selectedVehicleId ? selectedVehicleId : selectedVehicle?.id,
            comments: comments,
            work_order_status: workOrderStatus,
            date_start: dateStart,
            created_by: createdBy,
            vehicle_status: vehicleStatus,
            km: actualKmValue !== 0 ? actualKmValue : kmVehicleSelected.km,
        };

        console.log("datos a enviar", payload)

        try {

            const response = await apiClient.post('/work-orders/create', payload)
            const workOrderId = response.data.id;
            if (response.status === 201) {
                toast.success('Orden de trabajo creada exitósamente', {
                    position: toast.POSITION.TOP_RIGHT
                });
                setTimeout(() => {
                    navigate(`/workOrders/detailWorkOrder/${workOrderId}`);
                    resetForm();
                }, 3000);

            } else {

                toast.error('Ha ocurrido un error crear la orden de trabajo', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }

        } catch (error) {
            console.error("Error al crear la orden de trabajo", error);
            toast.error('Error al crear la orden de trabajo.', {
                position: toast.POSITION.TOP_RIGHT
            });
        }

    };

    const onBack = () => {
        navigate("/workOrders");
        resetForm();
    };

    const getClient = async () => {

        let endpoint = '/clients/all';

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
            toast.error('Error al obtener los datos de los clientes', {
                position: toast.POSITION.TOP_RIGHT
            });

        }
    };

    useEffect(() => {
        getClient();
    }, [searchTerm, selectedOption])

    useEffect(() => {
        if (shouldUpdateClients) {
            getClient();
            setShouldUpdateClients(false);
        }
    }, [shouldUpdateClients]);
    
    useEffect(() => {
        if (shouldUpdateVehicles && selectedClient) {
            getVehicleOfClient(selectedClient.id);
            setShouldUpdateVehicles(false);
        }
    }, [shouldUpdateVehicles, selectedClient]);

    const selectAllCheckboxes = () => {
        let newSelections = { ...selections };

        Object.keys(optionsCheckBox).forEach(group => {
            newSelections[group] = newSelections[group].map(() => true);
        });

        setSelections(newSelections);
    };

    useEffect(() => {
        if (user) {
            setCreatedBy(user.username);
        }
    }, [user]);

    useEffect(() => {
        if (symptomsEndRef.current && symptomsContainerRef.current) {
            const symptomsEndPosition = symptomsEndRef.current.getBoundingClientRect().bottom;
            const containerBottomPosition = symptomsContainerRef.current.getBoundingClientRect().bottom;

            if (symptomsEndPosition > containerBottomPosition) {
                const overflowAmount = symptomsEndPosition - containerBottomPosition;
                symptomsContainerRef.current.scrollTop += overflowAmount;
            }
        }
    }, [symptoms]);

    useEffect(() => {
        if (selectedVehicle && selectedVehicle.km) {
            setActualKm(selectedVehicle.km);
            //console.log("valor del km", selectedVehicle)
        }
    }, [selectedVehicle]);

    useEffect(() => {
        if (isChecked) {
            const kmVehicleSelected = vehicles.find(vehicle => vehicle.id === selectedVehicleId);
            setActualKm(kmVehicleSelected ? kmVehicleSelected.km : '');
        } else {
            // Si el checkbox no está marcado, restablecer a un valor vacío
            setActualKm('');
        }
    }, [isChecked, selectedVehicleId, vehicles]);

    return (

        <div>

            <ToastContainer />

            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <div className="new-work-order-general-container">


                <div className="new-work-order-title-container">
                    <button onClick={onBack} className="button-arrow-client">
                        <img src={arrowLeftIcon} className="arrow-icon-client" alt="Arrow Icon" />
                    </button>
                    <h2 style={{ flex: 'auto' }}>Nueva Orden de Trabajo</h2>
                    <button className="confirm-button" onClick={handleWorkOrderCreation}>
                        <span className="text-confirm-button ">Confirmar</span>
                    </button>
                </div>

                <div className="client-search-container">
                    <div className="left-div">
                        {selectedClient ? (
                            <div style={{ marginLeft: '30px', marginRight: '30px', marginTop: '10px' }}>
                                <div style={{ display: 'flex' }}>
                                    <button onClick={handleDeselectClient} className="button-arrow-client">
                                        <img src={arrowLeftIcon} className="arrow-icon-client" alt="Arrow Icon" />
                                    </button>
                                    <h2>Cliente</h2>
                                </div>

                                <div className="label-container">
                                    <label className="label-title">Nombre:</label>
                                    <label className="label-input">{selectedClient.name}</label>
                                </div>
                                <div className="label-container">
                                    <label className="label-title">Cédula:</label>
                                    <label className="label-input">{selectedClient.cedula}</label>
                                </div>
                                <div className="label-container">
                                    <label className="label-title">Dirección:</label>
                                    <label className="label-input">{selectedClient.address}</label>
                                </div>
                                <div className="label-container">
                                    <label className="label-title">Teléfono:</label>
                                    <label className="label-input">{selectedClient.phone}</label>
                                </div>
                                <div className="label-container">
                                    <label className="label-title">Correo:</label>
                                    <label className="label-input">{selectedClient.email}</label>
                                </div>

                            </div>
                        ) :
                            (
                                <>
                                    <div>
                                        {/*Título del contenedor y cuadro de búsqueda */}
                                        <div style={{ marginTop: "10px" }}>
                                            <TitleAndSearchBox
                                                selectedOption={selectedOption}
                                                onSearchChange={handleSearchClientWithDebounce}
                                                onButtonClick={openFilterModal}
                                                isSpecial={true}
                                                showAddButton={true}
                                                onAddClient={openAddClientModal}
                                            />
                                        </div>
                                    </div>


                                    {/*Lista de clientes*/}
                                    {clients.length > 0 && (
                                        <div>
                                            {clients.map(clientData => (
                                                <div className="result-client-container" key={clientData.client.id} onClick={() => handleClientSelect(clientData.client)}>
                                                    <div className="first-result-work-order">
                                                        <img src={clientIcon} alt="Client Icon" className="icon-client" />
                                                        <div className="container-data-client">
                                                            <label className="label-name-client">{clientData.client.name}</label>

                                                            <div className="vehicle-count-container-work-order">
                                                                {
                                                                    (!clientData.vehicles_count ||
                                                                        Object.values(clientData.vehicles_count).every(val => val === 0)
                                                                    ) ? (
                                                                        <div>
                                                                            Sin vehículos
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            {clientData.vehicles_count.car > 0 && (
                                                                                <div className="container-car-number-work-order">
                                                                                    <label className="car-number-work-order">{clientData.vehicles_count.car}</label>
                                                                                    <img src={autoIcon} alt="Car client" className="icon-car" />
                                                                                </div>

                                                                            )}

                                                                            {clientData.vehicles_count.van > 0 && (
                                                                                <div className="container-car-number-work-order">
                                                                                    <label className="car-number-work-order"> {clientData.vehicles_count.van}
                                                                                    </label>
                                                                                    <div className="van-container-work-order">
                                                                                        <img src={camionetaIcon} alt="Van client" className="icon-van-work-order"></img>
                                                                                    </div>

                                                                                </div>
                                                                            )}


                                                                            {clientData.vehicles_count.bus && (
                                                                                <div className="container-car-number-work-order">
                                                                                    <label className="car-number-work-order"> {clientData.vehicles_count.bus}
                                                                                    </label>
                                                                                    <img src={busetaIcon} alt="Bus client" className="icon-bus-work-order"></img>
                                                                                </div>

                                                                            )}

                                                                            {clientData.vehicles_count.truck && (
                                                                                <div className="container-car-number-work-order">
                                                                                    <label className="car-number-work-order"> {clientData.vehicles_count.truck}
                                                                                    </label>
                                                                                    <img src={camionIcon} alt="Truck client" className="icon-car-work-order"></img>
                                                                                </div>

                                                                            )}

                                                                        </>
                                                                    )
                                                                }



                                                            </div>



                                                        </div>
                                                    </div>



                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )
                        }

                    </div>

                    <div className="right-div-container">

                        <div className="right-div">
                            {/* Contenido del segundo div derecho */}
                            {selectedClient && (
                                <>
                                    <div className="add-vehicle-container" onClick={openAddVehicleModal}>
                                        <img src={addIcon} alt="Add Vehicle" className="add-vehicle-icon" />
                                        <button className="add-new-vehicle-carousel" >Agregar Vehículo</button>
                                    </div>

                                    <div className="container-carousel">
                                        <Carousel responsive={responsive}>

                                            {vehicles.map((vehicle, index) => (
                                                <div
                                                    key={index}
                                                    className={`carousel ${vehicle.id === selectedVehicleId || (selectedVehicle && vehicle.id === selectedVehicle.id) ? 'selected' : ''}`}
                                                    onClick={() => setSelectedVehicleId(vehicle.id)}
                                                >
                                                    <img
                                                        src={iconsVehicles[vehicle.category]}
                                                        alt={`Vehicle ${index + 1}`}
                                                        className="vehicle-carousel"
                                                    />
                                                    <div className="input-plate-container-new-work-order">
                                                        <input
                                                            className="input-plate-vehicle-new-work-order"
                                                            type="text"
                                                            value={vehicle.plate}
                                                            readOnly
                                                        />
                                                        <img src={flagIcon} alt="Flag" className="ecuador-icon" />
                                                        <label>ECUADOR</label>
                                                    </div>
                                                </div>
                                            ))}
                                        </Carousel>
                                    </div>


                                </>

                            )}

                        </div>

                        <div className="right-div">
                            <div className="container-fields-new-work-order">

                                <div className="input-group-work-order">
                                    <label>Creada por</label>
                                    <input
                                        type="text"
                                        className="input-field-right"
                                        value={createdBy}
                                        onChange={e => setCreatedBy(e.target.value)}
                                    />
                                </div>

                                <div className="input-group-work-order">
                                    <label>Fecha de inicio</label>
                                    <DatePicker
                                        className="input-field-right"
                                        selected={dateStart}
                                        onChange={date => setDateStart(date)}
                                    />
                                </div>

                                <div className="input-group-work-order">
                                    <label>Estado</label>
                                    <Select
                                        isSearchable={false}
                                        styles={customStylesStatus}
                                        value={workOrderStatus}
                                        onChange={handleSelectChange}
                                        options={WorkOrderStatusOptions}
                                        placeholder="Seleccione"
                                        classNamePrefix="react-select"
                                        isDisabled={!selectedClient || !selectedVehicleId}
                                    />
                                </div>

                            </div>

                            <div className="container-div-comments" >
                                <div className="container-div-left">
                                    <label>Comentarios</label>
                                    <textarea
                                        className="textarea-work-order"
                                        value={comments}
                                        onChange={e => setComments(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="container-div-rigth">
                                    <label>Kilometraje actual</label>
                                    <input
                                        type="text"
                                        className="input-field-km"
                                        value={actualKm}
                                        onChange={e => setActualKm(e.target.value)}
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="title-second-section-container">
                    <h3>Estado entrega de vehículo</h3>
                </div>

                <div style={{ textAlign: "right", marginBottom: '10px' }}>
                    <button
                        className="btn-select-all"
                        onClick={selectAllCheckboxes}>
                        Seleccionar todos
                    </button>
                </div>

                <div className="checkbox-container">
                    {Object.keys(selections).map((group) => (
                        <div key={group} className="checkbox-group">
                            {selections[group].map((isChecked, index) => {
                                const currentOption = optionsCheckBox[group][index];

                                // Caso Gas
                                if (currentOption === 'Gas') {
                                    return (
                                        <div key={index}>
                                            <img src={fuelIcon} alt="Fuel Icon" className="fuel-icon" />
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={percentages[group][index] || ''}
                                                onChange={(event) => handlePorcentageChange(group, index, event)}
                                            />
                                            {' %'}
                                        </div>
                                    );
                                }

                                // Caso Combustible
                                if (currentOption === 'Combustible') {
                                    return <label key={index}>{currentOption}</label>; // Solo renderiza el label "Combustible"
                                }

                                // Caso Default (para todas las otras opciones)
                                return (
                                    <label key={index}>
                                        {currentOption}
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleCheckboxChange(group, index)}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="second-container">

                    <div className="half-second-container">
                        <h3>Síntomas presentados</h3>
                        <div className="content-new-work-order">
                            <div
                                contentEditable
                                suppressContentEditableWarning
                                onKeyDown={handleKeyPress}
                                className={`editable-container ${symptoms.length ? '' : 'placeholder'}`}
                                onFocus={() => setPlaceholder("")}

                            >
                                {placeholder}
                            </div>

                            <div className="list-sypmtoms-container" ref={symptomsContainerRef}>
                                <ul>
                                    {symptoms.map((item, index) => (
                                        <li key={index}
                                            ref={index === symptoms.length - 1 ? symptomsEndRef : null}
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleUpdateSymptom(index, e.currentTarget.textContent)}
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="half-second-container">
                        <h3>Observaciones generales</h3>
                        <div className="content-new-work-order">
                            <textarea
                                className="textarea-class"
                                placeholder="Describa las observaciones"
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}>

                            </textarea>
                        </div>
                    </div>

                </div>

                <div className="title-second-section-container">
                    <h3>Puntos de interés</h3>
                </div>

                <VehiclePlans
                    imgSrc={carPlan}
                    updatePoints={(points) => setPointsOfInterest(points)}
                />

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

            {/*Modal para agregar nuevo cliente*/}

            {isAddClientModalOpen && (
                <AddNewClientModal
                    isOpen={isAddClientModalOpen}
                    onClose={closeAddClientModal}
                    OnUpdate={() => setShouldUpdateClients(true)}
                />
            )}

            {/*Modal para agregar un nuevo vehículo*/}

            {isAddVehicleModalOpen && (
                <AddNewVehicleModal
                    isOpen={isAddVehicleModalOpen}
                    onClose={closeAddVehicleModal}
                    selectedClientId={selectedClient ? selectedClient.id : null}
                    OnUpdate={() => setShouldUpdateVehicles(true)}
                />
            )}

            {/*Modal para actualizar kilometraje*/}

            {isKmModalOpen && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal">
                        <div style={{ display: 'flex' }}>
                            <h3 style={{ textAlign: "center" }}>Es necesario actualizar el kilometraje del vehículo</h3>
                            <div style={{ flex: "1", marginTop: '18px' }}>
                                <button className="button-close" onClick={closeWorkOrderCreation}  >
                                    <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                                </button>
                            </div>

                        </div>

                        <div >
                            <label className="container-checkbox-modal">
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => setIsChecked(!isChecked)}
                                />
                                Mantener valor anterior
                            </label>
                        </div>
                        <div className="container-km-actual">
                            <label style={{ fontWeight: '500', marginTop: '6px' }}>Kilometraje actual:</label>
                            {isChecked ? (
                                // Renderizar el valor del kilómetro si el checkbox está marcado
                                <input
                                    className="input-km-actual"
                                    type="text"
                                    value={actualKm}
                                    disabled={true}
                                />

                            ) : (
                                // Renderizar el input del kilómetro si el checkbox no está marcado
                                <input
                                    className="input-km-actual"
                                    type="text"
                                    value={actualKm}
                                    onChange={(e) => setActualKm(e.target.value)}
                                />
                            )}
                        </div>

                        <div className="full">
                            <button className="optionYes-button" onClick={handleAccept}>
                                Aceptar
                            </button>
                        </div>

                    </div>
                </div>
            )}




        </div>
    );


};

export default NewWorkOrder;