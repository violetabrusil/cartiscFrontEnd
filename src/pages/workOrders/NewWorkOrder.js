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

const clientIcon = process.env.PUBLIC_URL + "/images/icons/userIcon-gray.png";
const autoIcon = process.env.PUBLIC_URL + "/images/icons/autoIcon.png";
const busetaIcon = process.env.PUBLIC_URL + "/images/icons/busIcon.png";
const camionetaIcon = process.env.PUBLIC_URL + "/images/icons/camionetaIcon.png";
const camionIcon = process.env.PUBLIC_URL + "/images/icons/camionIcon.png";
const arrowLeftIcon = process.env.PUBLIC_URL + "/images/icons/arrowLeftIcon.png";
const fuelIcon = process.env.PUBLIC_URL + "/images/icons/fuelIcon.png";
const carPlan = process.env.PUBLIC_URL + "/images/vehicle plans/Car.png";
const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";

const NewWorkOrder = () => {

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
    console.log("usuario logeado", user)

    const [selectedOption, setSelectedOption] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const debounceTimeout = useRef(null);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [isKmModalOpen, setIsKmModalOpen] = useState(false);

    const [dateStart, setDateStart] = useState(new Date());
    const [workOrderStatus, setWorkOrderStatus] = useState(WorkOrderStatusOptions[0]);
    const [createdBy, setCreatedBy] = useState(user?.username || "");
    const [actualKm, setActualKm] = useState("");
    const [comments, setComments] = useState("");
    const [observations, setObservations] = useState('');
    const navigate = useNavigate();

    const [symptoms, setSymptoms] = useState([]);
    const symptomsEndRef = useRef(null);
    const symptomsContainerRef = useRef(null);
    const [placeholder, setPlaceholder] = useState("Describa los síntomas");
    const [pointsOfInterest, setPointsOfInterest] = useState([]);

    const handleSearchClientChange = (term, filter) => {
        console.log(term, filter);
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

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const handleSelectClick = (option) => {
        console.log(option);
        setSelectedOption(option);
        // Cerrar el modal después de seleccionar.
        closeFilterModal();
    };

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        if (client && client.id) {
            getVehicleOfClient(client.id);
        }
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
            border: '1px solid rgb(0 0 0 / 34%)'
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: 'rgb(0 0 0 / 34%)',
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
            items: 3,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2,
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
        console.log("seleccion", selections)
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

    const getClient = async () => {

        let endpoint;

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
    };

    const getVehicleOfClient = async (clientId) => {
        try {
            const response = await apiClient.get(`/vehicles/active/${clientId}`);
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
            console.log("Error al obtener los vehículos del cliente", error);
        }

    };

    const handleWorkOrderCreation = () => {
        if (!actualKm) {
            setIsKmModalOpen(true);
        } else {
            createNewWorkOrder();
        }
    };

    const handleNoUpdate = () => {
        const kmVehicleSelected = vehicles.find(vehicle => vehicle.id === selectedVehicleId);
        console.log("km vehiculo seleccionado", kmVehicleSelected.km)
        setActualKm(kmVehicleSelected.km); // Debes tener una función o método para obtener el kilometraje actual del vehículo
        setIsKmModalOpen(false);
        createNewWorkOrder(); // Luego de actualizar el kilometraje, llama a la función para crear la orden de trabajo
    };

    const handleYesUpdate = () => {
        setIsKmModalOpen(false);
        // Aquí simplemente cierras el modal. El usuario deberá ingresar el kilometraje manualmente en el formulario
    };

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
                side: "left", // Aquí deberías determinar el lado correcto si es necesario.
                x: point.x,
                y: point.y
            }
        });
        vehicleStatus.presented_symptoms = symptoms.join(', ');
        vehicleStatus.general_observations = observations;

        const payload = {
            vehicle_id: selectedVehicleId,
            comments: comments,
            work_order_status: workOrderStatus,
            date_start: dateStart,
            created_by: createdBy,
            vehicle_status: vehicleStatus,
            km: Number(actualKm),
        };

        console.log("datos a enviar", payload)
        console.log(typeof payload.km, payload.km);

        try {

            const response = await apiClient.post('/work-orders/create', payload)
            console.log("estado", response.status)
            if (response.status === 201) {
                console.log("Dentro del if de éxito")
                toast.success('Orden de trabajo creada exitósamente', {
                    position: toast.POSITION.TOP_RIGHT
                });
                setTimeout(() => {
                    navigate('/workOrders');
                }, 3000);

            } else {

                toast.error('Ha ocurrido un error crear la orden de trabajo', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }

        } catch (error) {
            console.error("Error al crear la orden de trabajo", error);
            toast.error('Error inesperado al crear la orden de trabajo.', {
                position: toast.POSITION.TOP_RIGHT
            });
        }

    };

    useEffect(() => {

        if (searchTerm) {
            // Limpia el timeout anterior si el usuario sigue escribiendo
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

            // Establece un timeout para esperar que el usuario termine de escribir
            debounceTimeout.current = setTimeout(() => {
                getClient(); // Tu función para obtener los clientes
            }, 500); // 500ms de espera
        } else {
            setClients([]); // Limpia los clientes si el searchTerm está vacío
        }

        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current); // Limpia el timeout al desmontar el componente
        };

    }, [searchTerm, selectedOption])

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


    return (
        <div>

            <ToastContainer />

            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <div className="new-work-order-general-container">


                <div className="new-work-order-title-container">
                    <h2>Nueva Orden de Trabajo</h2>
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
                                    {/*Título del contenedor y cuadro de búsqueda */}
                                    <div style={{ marginTop: "10px" }}>
                                        <TitleAndSearchBox
                                            selectedOption={selectedOption}
                                            onSearchChange={handleSearchClientWithDebounce}
                                            onButtonClick={openFilterModal}
                                            isSpecial={true}
                                        />
                                    </div>

                                    {/*Lista de clientes*/}
                                    {searchTerm && clients.length > 0 && (
                                        <div>
                                            {clients.map(clientData => (
                                                <div className="result-client-container" key={clientData.client.id} onClick={() => handleClientSelect(clientData.client)}>
                                                    <div className="first-result-work-order">
                                                        <img src={clientIcon} alt="Client Icon" className="icon-client" />
                                                        <div className="container-data-client">
                                                            <label className="label-name-client">{clientData.client.name}</label>

                                                            <div className="vehicle-count-container-work-order">
                                                                {/* Si el vehicles_count es vacío */}
                                                                <div className="container-car-number-work-order">
                                                                    <label className="car-number-work-order">{(clientData.vehicles_count && clientData.vehicles_count.car) || 0}</label>
                                                                    <img src={autoIcon} alt="Car client" className="icon-car-work-order" />
                                                                </div>

                                                                {/* Si vehicles_count no es vacío, muestra los otros íconos */}
                                                                {clientData.vehicles_count && (
                                                                    <>
                                                                        {clientData.vehicles_count.van && (
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
                                                                )}

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
                            <Carousel responsive={responsive} className="carousel-vehicles ">
                                {vehicles.map((vehicle, index) => (
                                    <div
                                        key={index}
                                        className={`carousel ${vehicle.id === selectedVehicleId ? 'selected' : ''}`}
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
                    onOptionChange={handleOptionChange}
                    onSelect={handleSelectClick}
                />
            )}

            {/*Modal para actualizar kilometraje*/}

            {isKmModalOpen && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal">
                        <h3 style={{ textAlign: "center" }}>Se recomienda actualizar el kilometraje al generar una nueva orden de trabajo</h3>
                        <div className="button-options">
                            <div className="half">
                                <button className="optionNo-button" onClick={handleNoUpdate}>
                                    No actualizar
                                </button>
                            </div>
                            <div className="half">
                                <button className="optionYes-button" onClick={handleYesUpdate}>
                                    Si actualizar
                                </button>

                            </div>
                        </div>

                    </div>
                </div>
            )}


        </div>
    );


};

export default NewWorkOrder;