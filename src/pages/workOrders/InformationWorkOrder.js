import 'react-toastify/dist/ReactToastify.css';
import "../../NewWorkOrder.css";
import "../../InformationWorkOrder.css";
import "../../Modal.css";
import React, { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useParams } from "react-router-dom";
import Select from 'react-select';
import PuffLoader from "react-spinners/PuffLoader";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import VehiclePlans from "../../vehicle-plans/VehiclePlans";
import apiClient from '../../services/apiClient';
import { getVehicleCategory } from '../../constants/vehicleCategoryConstants';
import ModalHistoryWorkOrder from '../../modal/ModalHistoryWorkOrder';
import SearchProductsModal from '../../modal/SearchProductsModal';
import DataTable from '../../dataTable/DataTable';

const arrowIcon = process.env.PUBLIC_URL + "/images/icons/arrowIcon.png";
const fuelIcon = process.env.PUBLIC_URL + "/images/icons/fuelIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const carPlan = process.env.PUBLIC_URL + "/images/vehicle plans/Car.png";
const clockIcon = process.env.PUBLIC_URL + "/images/icons/clockIcon.png";
const productIcon = process.env.PUBLIC_URL + "/images/icons/productImageEmpty.png";

const InformationWorkOrder = () => {

    const [visibleSections, setVisibleSections] = useState({});
    const [iconRotated, setIconRotated] = useState(false);
    const { workOrderId } = useParams();
    const [workOrderDetail, setWorkOrderDetail] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState("");
    const [fuelLevel, setFuelLevel] = useState(0);
    const [symptoms, setSymptoms] = useState([]);
    const symptomsEndRef = useRef(null);
    const symptomsContainerRef = useRef(null);
    const [placeholder, setPlaceholder] = useState("Describa los síntomas");
    const [observations, setObservations] = useState("");
    const [pointsOfInterest, setPointsOfInterest] = useState([]);
    const [workOrderStatus, setWorkOrderStatus] = useState("");
    const [isOpenHistoryWorkOrderModal, setIsOpenHistoryWorkOrderModal] = useState(false);
    const [isModalOpenProducts, setIsModalOpenProducts] = useState(false);
    const [isModalOpenServices, setIsModalOpenServices] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [mainSelectedProducts, setMainSelectedProducts] = useState([]);

    const WorkOrderStatusOptions = [
        { value: 'to_start', label: 'Por iniciar' },
        { value: 'assigned', label: 'Asignada' },
        { value: 'in_development', label: 'En desarrollo' },
        { value: 'stand_by', label: 'En pausa' },
        { value: 'cancelled', label: 'Cancelada' },
        { value: 'completed', label: 'Completada' },
        { value: 'deleted', label: 'Eliminada' },
    ];

    const toggleComponentes = (sectionId) => {
        setVisibleSections(prevSections => ({
            ...prevSections,
            [sectionId]: !prevSections[sectionId]
        }));
    };

    const handleOpenModalProducts = () => {
        setIsModalOpenProducts(true);
    };

    const handleCloseModalProducts = () => {
        setIsModalOpenProducts(false);
    };

    const handleOpenModalServices = () => {
        setIsModalOpenServices(true);
    };

    const handleCloseModalServices = () => {
        setIsModalOpenServices(false);
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

    const handleCheckboxChange = (group, index) => {
        const newSelections = { ...selections };
        newSelections[group][index] = !newSelections[group][index];
        setSelections(newSelections);
    };

    const handleGasChange = (e) => {
        setFuelLevel(e.target.value);
    };

    const transformVehicleStatusToSelections = (vehicleStatus) => {
        return {
            group1: [
                vehicleStatus.antenna,
                vehicleStatus.radio,
                vehicleStatus.wipers,
                vehicleStatus.fire_extinguisher,
                vehicleStatus.door_lock
            ],
            group2: [
                vehicleStatus.cigarette_lighter,
                vehicleStatus.carpet,
                vehicleStatus.mirrors,
                vehicleStatus.warning_triangles
            ],
            group3: [
                vehicleStatus.tires,
                vehicleStatus.jack,
                vehicleStatus.tools,
                vehicleStatus.wheel_wrench,
                true,
            ]
        };
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

    function formatDate(isoDate) {
        const date = new Date(isoDate);
        const day = String(date.getUTCDate()).padStart(2, '0');  // Usamos getUTCDate en lugar de getDate
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Usamos getUTCMonth en lugar de getMonth
        const year = date.getUTCFullYear();  // Usamos getUTCFullYear en lugar de getFullYear

        return `${day}/${month}/${year}`;
    };

    const customStylesStatusWorkOrder = {
        control: (provided, state) => ({
            ...provided,
            width: '200%',
            height: '49px',
            minHeight: '49px',
            border: '1px solid rgb(0 0 0 / 34%)',

        }),
        menu: (provided, state) => ({
            ...provided,
            width: '250px', // puedes ajustar el ancho del menú aquí
        }),
    };

    const handleSelectChange = (statusWorkOrder) => {
        setWorkOrderStatus(statusWorkOrder.value);
    };

    const getWorkOrderDetailById = async () => {

        try {

            const response = await apiClient.get(`/work-orders/${workOrderId}`);
            // Formatear la placa del vehículo
            if (response.data.vehicle && response.data.vehicle.plate) {
                response.data.vehicle.plate = formatPlate(response.data.vehicle.plate);
            }
            // Transformar la categoría del vehículo
            if (response.data.vehicle && response.data.vehicle.category) {
                response.data.vehicle.category = getVehicleCategory(response.data.vehicle.category);
            }

            if (response.data && response.data.date_start) {
                response.data.date_start = formatDate(response.data.date_start);
            }

            if (response.data && response.data.date_finish) {
                response.data.date_finish = formatDate(response.data.date_finish);
            } else {
                response.data.date_finish = '-';
            }

            if (response.data.work_order_status) {
                // Encuentra el objeto correspondiente en el array WorkOrderStatusOptions
                const matchingStatus = WorkOrderStatusOptions.find(option => option.value === response.data.work_order_status);
                setWorkOrderStatus(matchingStatus);
            }

            setWorkOrderDetail(response.data);
            console.log("placa", response.data.vehicle.plate)
            const selectionFromApi = transformVehicleStatusToSelections(response.data.vehicle_status);
            setSelections(selectionFromApi);
            setFuelLevel(response.data.vehicle_status.fuel_level);

            const receivedSymptoms = response.data.vehicle_status.presented_symptoms;
            if (typeof receivedSymptoms === 'string') {
                const symptomsArray = receivedSymptoms.split(',').map(symptom => symptom.trim()).filter(Boolean);
                setSymptoms(symptomsArray);
            } else {
                console.error('Unexpected type for presented_symptoms:', typeof receivedSymptoms);
            }
            console.log("detalle de la orden de trabajo", response.data);
            setLoading(false);

        } catch (error) {
            console.log('Error al obtener el detalle de la orden de trabajo', error)
            setLoading(false);
        }
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

    const handleUpdateSymptom = (index, newText) => {
        // Crear una copia de "symptoms" para evitar la mutación directa
        const updatedSymptoms = [...symptoms];
        // Actualizar el síntoma específico con el nuevo texto
        updatedSymptoms[index] = newText;
        // Actualizar el estado con los nuevos valores
        setSymptoms(updatedSymptoms);
    };

    const openHistoryModal = () => {
        setIsOpenHistoryWorkOrderModal(true);
    };

    const closeHistoryModal = () => {
        setIsOpenHistoryWorkOrderModal(false);
    };

    const columnsProducts = React.useMemo(
        () => [
            { Header: "Número de serie", accessor: "sku" },
            {
                Header: "Imagen",
                accessor: "product_picture",
                Cell: ({ value }) => {
                    const imageUrl = value ? `data:image/jpeg;base64,${value}` : productIcon;

                    return (
                        <img
                            src={imageUrl}
                            alt="Product"
                            style={{
                                width: '13px',
                                height: '13px',
                                borderRadius: '10%',
                                border: '1px solid rgba(0, 0, 0, 0.2)',
                                padding: '4px'
                            }}
                        />
                    );
                }
            },
            { Header: "Título", accessor: "title" },
            { Header: "Categoría", accessor: "category" },
            {
                Header: "Precio",
                accessor: "price",
                Cell: ({ value }) =>
                    <div style={{ fontSize: "16px" }}>
                        $ {parseFloat(value).toFixed(2)}
                    </div>
            },
            {
                Header: "Cantidad",
                accessor: "quantity",
                Cell: ({ value }) =>
                    <div style={{ fontSize: "16px" }}>
                        {value}
                    </div>

            }
        ],
        []
    );

    const handleProductsUpdated = (updatedProducts) => {
        setSelectedProducts(updatedProducts);
    };

    useEffect(() => {
        getWorkOrderDetailById();
    }, []);

    useEffect(() => {
        if (workOrderDetail) {
            if (workOrderDetail?.comments) {
                setComments(workOrderDetail.comments);
            }
            if (workOrderDetail?.vehicle_status?.general_observations) {
                setObservations(workOrderDetail.vehicle_status.general_observations);
            }

        }
    }, [workOrderDetail]);


    return (
        <div>
            <ToastContainer />

            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <div className="spinner-container">

                {loading ? (
                    <div>
                        <PuffLoader color="#316EA8" loading={loading} size={60} />
                    </div>

                ) : (

                    <div>

                        <div className="new-work-order-general-container">
                            <div className="new-work-order-title-container">
                                <h2>Detalle Orden de Trabajo {workOrderDetail.work_order_code}</h2>
                                <img src={clockIcon} alt="Clock Icon" className="clock-icon" onClick={openHistoryModal} />
                                <div className="div-container-select">
                                    <Select
                                        isSearchable={false}
                                        styles={customStylesStatusWorkOrder}
                                        value={workOrderStatus}
                                        onChange={handleSelectChange}
                                        options={WorkOrderStatusOptions}
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <button className="confirm-button" >
                                    <span className="text-confirm-button ">Confirmar</span>
                                </button>
                            </div>

                            <div className="client-search-container">
                                <div className="left-div">
                                    <div style={{ marginLeft: '30px', marginRight: '30px', marginTop: '10px' }}>

                                        <h2>Cliente</h2>

                                        <div className="label-container">
                                            <label className="label-title">Nombre:</label>
                                            <label className="label-input">{workOrderDetail.client.name}</label>
                                        </div>
                                        <div className="label-container">
                                            <label className="label-title">Cédula:</label>
                                            <label className="label-input">{workOrderDetail.client.cedula}</label>
                                        </div>
                                        <div className="label-container">
                                            <label className="label-title">Dirección:</label>
                                            <label className="label-input">{workOrderDetail.client.address}</label>
                                        </div>
                                        <div className="label-container">
                                            <label className="label-title">Teléfono:</label>
                                            <label className="label-input">{workOrderDetail.client.phone}</label>
                                        </div>
                                        <div className="label-container">
                                            <label className="label-title">Correo:</label>
                                            <label className="label-input">{workOrderDetail.client.email}</label>
                                        </div>

                                    </div>
                                </div>

                                <div className="right-div-container">
                                    <div className="container-right-div-information-vehicle">
                                        <div className='div-information-vehicle'>

                                            <div className="div-information-vehicle-fields">
                                                <div className="vehicle-fields">
                                                    <label className="label-vehicle">Placa:</label>
                                                    <label>{workOrderDetail.vehicle.plate}</label>
                                                </div>
                                                <div className="vehicle-fields">
                                                    <label className="label-vehicle">Categoría:</label>
                                                    <label>{workOrderDetail.vehicle.category}</label>
                                                </div>
                                                <div className="vehicle-fields">
                                                    <label className="label-vehicle">Marca:</label>
                                                    <label style={{ marginLeft: '40px' }}>{workOrderDetail.vehicle.brand}</label>
                                                </div>

                                            </div>

                                            <div style={{ marginTop: '20px' }} className="div-information-vehicle-fields">
                                                <div className="vehicle-fields">
                                                    <label className="label-vehicle">Modelo:</label>
                                                    <label style={{ marginLeft: '-15px' }}>{workOrderDetail.vehicle.model}</label>
                                                </div>
                                                <div className="vehicle-fields">
                                                    <label className="label-vehicle">Año:</label>
                                                    <label style={{ marginLeft: '44px' }}>{workOrderDetail.vehicle.year}</label>
                                                </div>
                                                <div className="vehicle-fields">
                                                    <label className="label-vehicle">Kilometraje:</label>
                                                    <label>{workOrderDetail.vehicle.km}</label>
                                                </div>
                                            </div>


                                        </div>

                                    </div>

                                    <div className="container-right-div-information-vehicle">
                                        <div style={{ marginTop: '40px', marginLeft: '25px' }} className="container-fields-new-work-order">
                                            <div className="vehicle-fields">
                                                <label style={{ width: '151px' }} className="label-vehicle">Fecha de inicio:</label>
                                                <label style={{ marginLeft: '-54px' }}>{workOrderDetail.date_start}</label>
                                            </div>

                                            <div style={{ marginLeft: '38px' }} className="vehicle-fields">
                                                <label className="label-vehicle">Creada por:</label>
                                                <label style={{ marginLeft: '20px' }}>{workOrderDetail.created_by}</label>
                                            </div>

                                            <div className="vehicle-fields">
                                                <label style={{ marginLeft: '15px' }} className="label-vehicle">Asignada a:</label>
                                                <label>{workOrderDetail.assigned}</label>
                                            </div>

                                        </div>
                                        <div style={{ marginTop: '35px', marginLeft: '25px' }} className="container-div-comments" >
                                            <div className="vehicle-fields">
                                                <label style={{ width: '151px' }} className="label-vehicle">Fecha de fin:</label>
                                                <label style={{ marginLeft: '-54px' }}>{workOrderDetail.date_finish}</label>
                                            </div>

                                            <div style={{ marginLeft: '36px' }} className="vehicle-fields">
                                                <label className="label-vehicle">Entregada por:</label>
                                                <label>{workOrderDetail.delivered_by}</label>
                                            </div>

                                            <div className="vehicle-fields">
                                                <label style={{ marginLeft: '9px' }} className="label-vehicle">Total:</label>
                                                <label></label>
                                            </div>


                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="div-section-information">
                                <div className="title-second-section-container">
                                    <h3>Comentarios</h3>
                                    <button onClick={() => toggleComponentes('comments')} className="button-toggle">
                                        <img
                                            src={arrowIcon}
                                            alt="Icono"
                                            className={`icon ${iconRotated ? 'rotated' : ''}`}
                                        />
                                    </button>
                                </div>

                                {/* Renderización condicional para mostrar/ocultar la sección de comentarios */}
                                {visibleSections['comments'] && (
                                    <div className="comments-section">
                                        <textarea
                                            value={comments}
                                            onChange={(e) => setComments(e.target.value)}
                                        >
                                        </textarea>
                                    </div>
                                )}

                                <div className="title-second-section-container">
                                    <h3>Estado de Entrega</h3>
                                    <button className="button-toggle" onClick={() => toggleComponentes('state')}>
                                        <img
                                            src={arrowIcon}
                                            alt="Icono"
                                            className={`icon ${iconRotated ? 'rotated' : ''}`}
                                        />
                                    </button>
                                </div>

                                {visibleSections['state'] && (
                                    <>
                                        <div className="checkbox-container">
                                            {Object.keys(optionsCheckBox).map((group) => (
                                                <div key={group} className="checkbox-group">
                                                    {optionsCheckBox[group].map((labelName, index) => {
                                                        // Si es "Combustible", solo mostrar la etiqueta
                                                        if (labelName === 'Combustible') {
                                                            console.log("Aquí estamos en la condición de Combustible");
                                                            return <label key={index}>{labelName}</label>;
                                                        }
                                                        // Si es "Gas", mostrar el ícono (y el valor en porcentaje si es necesario)
                                                        else if (labelName === 'Gas') {
                                                            return (
                                                                <div key={index}>
                                                                    <img src={fuelIcon} alt="Fuel Icon" className="fuel-icon" />
                                                                    <input className="input-full-level"
                                                                        value={fuelLevel}
                                                                        onChange={handleGasChange}
                                                                    />
                                                                    {' %'}
                                                                </div>
                                                            );
                                                        }
                                                        // Para los demás casos, mostrar el checkbox
                                                        else if (selections[group] && selections[group][index] !== undefined) { // Asegurarse de que exista una selección correspondiente
                                                            return (
                                                                <label key={index}>
                                                                    {labelName}
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selections[group][index]}
                                                                        onChange={() => handleCheckboxChange(group, index)}
                                                                    />
                                                                </label>
                                                            );
                                                        }
                                                        return null;  // Si no hay condiciones que cumplan, simplemente no renderizar nada.
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
                                                        value={observations}
                                                        onChange={(e) => setObservations(e.target.value)}
                                                    >
                                                    </textarea>
                                                </div>
                                            </div>

                                        </div>

                                        <div className="title-second-section-container">
                                            <h3>Puntos de interés</h3>
                                        </div>

                                        <div>
                                            <VehiclePlans
                                                imgSrc={carPlan}
                                                updatePoints={(points) => setPointsOfInterest(points)}
                                                initialPoints={workOrderDetail.vehicle_status.points_of_interest}
                                            />

                                        </div>



                                    </>
                                )
                                }

                                <div className="title-second-section-container">
                                    <h3>Repuestos</h3>
                                    <button className="button-toggle" onClick={() => toggleComponentes('products')}>
                                        <img
                                            src={arrowIcon}
                                            alt="Icono"
                                            className={`icon ${iconRotated ? 'rotated' : ''}`}
                                        />
                                    </button>
                                </div>

                                {visibleSections['products'] && (
                                    <>
                                        <div className="div-products">
                                            <div className="container-div-products">
                                                <img
                                                    className="icon-container"
                                                    src={addIcon}
                                                    alt="Open Modal"
                                                    onClick={handleOpenModalProducts}
                                                />

                                                <div className="div-table-products">
                                                    {selectedProducts.length > 0 && (
                                                        <DataTable
                                                            data={selectedProducts}
                                                            columns={columnsProducts}
                                                            highlightRows={false}
                                                            initialPageSize={4}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>

                                )}
                                <div className="title-second-section-container">
                                    <h3>Servicios/Operaciones</h3>
                                    <button className="button-toggle" onClick={() => toggleComponentes('services')}>
                                        <img
                                            src={arrowIcon}
                                            alt="Icono"
                                            className={`icon ${iconRotated ? 'rotated' : ''}`}
                                        />
                                    </button>
                                </div>

                                {visibleSections['services'] && (
                                    <>
                                        <div className="div-services">

                                            <div className="container-div-services">
                                                <img
                                                    className="icon-container"
                                                    src={addIcon}
                                                    alt="Open Modal"
                                                    onClick={handleOpenModalServices}
                                                />
                                            </div>

                                        </div>
                                    </>

                                )}

                            </div>

                        </div >

                    </div >

                )}
            </div>

            {isModalOpenProducts && (
                <SearchProductsModal
                    onClose={handleCloseModalProducts}
                    onProductsSelected={setSelectedProducts}
                    selectedProducts={selectedProducts}
                    onProductsUpdated={handleProductsUpdated}
                />
            )}

            {isModalOpenServices && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal">
                        <button style={{ marginTop: '16px' }} className="button-close-modal" onClick={handleCloseModalServices}  >
                            <img src={closeIcon} alt="Close Icon" className="modal-close-icon"></img>
                        </button>

                    </div>
                </div>
            )}

            {isOpenHistoryWorkOrderModal && (
                <ModalHistoryWorkOrder
                    isOpen={openHistoryModal}
                    onClose={closeHistoryModal}
                    orderHistory={workOrderDetail.work_order_history}
                    workOrderCode={workOrderDetail.work_order_code}
                />
            )}
        </div>


    );

};

export default InformationWorkOrder;
