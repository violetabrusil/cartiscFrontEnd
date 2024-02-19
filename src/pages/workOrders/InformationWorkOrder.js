import 'react-toastify/dist/ReactToastify.css';
import "../../NewWorkOrder.css";
import "../../InformationWorkOrder.css";
import "../../Modal.css";
import "../../Loader.css";
import React, { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useParams } from "react-router-dom";
import Select from 'react-select';
import PuffLoader from "react-spinners/PuffLoader";
import { useNavigate } from "react-router-dom";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import VehiclePlans from "../../vehicle-plans/VehiclePlans";
import apiClient from '../../services/apiClient';
import { getVehicleCategory } from '../../constants/vehicleCategoryConstants';
import ModalHistoryWorkOrder from '../../modal/ModalHistoryWorkOrder';
import SearchProductsModal from '../../modal/SearchProductsModal';
import DataTable from '../../dataTable/DataTable';
import SearchServicesOperationsModal from '../../modal/SearchServicesOperationsModal';
import { AssignModal } from '../../modal/AssignModal';
import { ConfirmationModal } from '../../modal/ConfirmationModal';
import { WorkOrderInfoModal } from '../../modal/WorkOrderInfoModal';

const arrowIcon = process.env.PUBLIC_URL + "/images/icons/arrowIcon.png";
const fuelIcon = process.env.PUBLIC_URL + "/images/icons/fuelIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const carPlan = process.env.PUBLIC_URL + "/images/vehicle plans/Car.png";
const clockIcon = process.env.PUBLIC_URL + "/images/icons/clockIcon.png";
const editIcon = process.env.PUBLIC_URL + "/images/icons/editIcon.png";
const arrowLeftIcon = process.env.PUBLIC_URL + "/images/icons/arrowLeftIcon.png";
const receiptIcon = process.env.PUBLIC_URL + "/images/icons/receipt.png";

const InformationWorkOrder = () => {

    const [visibleSections, setVisibleSections] = useState({
        products: true,
        services: true
    });
    const [iconsRotation, setIconsRotation] = useState({
        comments: false,
        state: false,
        products: true,
        services: true,
    });
    const { workOrderId } = useParams();
    const [workOrderDetail, setWorkOrderDetail] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState("");
    const [fuelLevel, setFuelLevel] = useState(0);
    const [symptoms, setSymptoms] = useState([]);
    const [idVehicleStatus, setIdVehicleStatus] = useState("");
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
    const [productPrices, setProductPrices] = useState({});
    const [productQuantities, setProductQuantities] = useState({});
    const [selectedOperations, setSelectedOperations] = useState([]);
    const [operationCosts, setOperationCosts] = useState({});
    const [selectedServicesList, setSelectedServicesList] = useState([]);
    const [servicesWithOperations, setServicesWithOperations] = useState([]);
    const [operationServiceCosts, setOperationServiceCosts] = useState({});
    const allOperations = [...selectedOperations, ...servicesWithOperations];
    const [isTextareaEditable, setTextareaEditable] = useState(false);
    const [isEditState, setIsEditState] = useState(false);
    const [workOrderItems, setWorkOrderItems] = useState([]);
    const [workOrderOperations, setWorkOrderOperations] = useState({});
    const [workOrderServices, setWorkOrderServices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({});
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [totalValue, setTotalValue] = useState(0);
    const [oldTotalValue, setOldTotalValue] = useState(0);
    const [rawIntegerPart, rawDecimalPart] = totalValue ? totalValue.split('.') : [];
    const integerPart = rawIntegerPart || '0';
    const decimalPart = rawDecimalPart || '00';
    const [existProductsSaved, setExistProductsSaved] = useState(false);
    const [existServiceSaved, setExistServiceSaved] = useState(false);
    const [existOperationSaved, setExistOperationSaved] = useState(false);
    const [editingKm, setEditingKm] = useState(false);
    const [newKm, setNewKm] = useState("");
    const [isWorkOrderModalOpen, setWorkOrderModalOpen] = useState(false);
    const [lastAddedReceiptId, setLastAddedReceiptId] = useState(null);
    const [workOrderData, setWorkOrderData] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [total, setTotal] = useState(0);
    const [vat, setVat] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [fetchingData, setFetchingData] = useState(true);
    const [isEditingWorkOrder, setIsEditingWorkOrder] = useState(false);
    const [showButton, setShowButton] = useState(true);

    const [percentages, setPercentages] = useState({
        group3: [null, null, null, 0, null],
    });

    const navigate = useNavigate();

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

    const WorkOrderStatusOptions = [
        { value: 'to_start', label: 'Por iniciar' },
        { value: 'assigned', label: 'Asignada' },
        { value: 'in_development', label: 'En desarrollo' },
        { value: 'stand_by', label: 'En pausa' },
        { value: 'completed', label: 'Completada' },
        { value: 'cancelled', label: 'Cancelada' },
    ];

    const validTransitions = {
        'to_start': ['assigned', 'stand_by', 'cancelled'],
        'assigned': ['assigned', 'in_development', 'stand_by', 'cancelled'],
        'in_development': ['assigned', 'stand_by', 'cancelled', 'completed'],
        'stand_by': ['assigned'],
        'completed': ['in_development'],
        'cancelled': []
    };

    const toggleComponentes = (sectionId) => {
        setVisibleSections(prevSections => ({
            ...prevSections,
            [sectionId]: !prevSections[sectionId]
        }));

        setIconsRotation(prevRotation => ({
            ...prevRotation,
            [sectionId]: !prevRotation[sectionId]
        }));
    };

    const handleOpenModalProducts = () => {
        setIsModalOpenProducts(true);
    };

    const handleCloseModalProducts = () => {
        if (existProductsSaved) {
            setSelectedProducts(workOrderItems)
        } else {
            setSelectedProducts([]);
        }
        setIsModalOpenProducts(false);
    };

    const handleSaveAndCloseProducts = () => {
        setIsModalOpenProducts(false);
    };

    const handleOpenModalServices = () => {
        setIsModalOpenServices(true);
        getWorkOrderDetailById();
    };

    const handleCloseModalServices = () => {
        if (existServiceSaved || existOperationSaved) {
            setSelectedOperations(workOrderOperations);
            setServicesWithOperations(workOrderServices)
        } else {
            setSelectedOperations([]);
            setServicesWithOperations([]);
            setSelectedServicesList([])
        }
        setIsModalOpenServices(false);
    };

    const handleSaveAndCloseModalServices = () => {
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

        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();

        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const isTabletLandscape = window.matchMedia("(min-width: 800px) and (max-width: 1340px) and (orientation: landscape)").matches;

    const customStylesStatusWorkOrder = {
        control: (provided, state) => {
            
          let borderColor = '1px solid rgb(0 0 0 / 34%)'; // Color de borde predeterminado
          if (state.selectProps.value.value === 'to_start') {
            borderColor = '2px solid #316EA8'; 
          } if (state.selectProps.value.value === 'assigned') {
            borderColor = '2px solid #0C1F31'; 
          } if (state.selectProps.value.value === 'in_development') {
            borderColor = '2px solid #4caf50'; 
          } if (state.selectProps.value.value === 'stand_by') {
            borderColor = '2px solid #fbc02d'; 
          } if (state.selectProps.value.value === 'cancelled') {
            borderColor = '2px solid #e74c3c'; 
          } if (state.selectProps.value.value === 'completed') {
            borderColor = '2px solid #2e7d32'; 
          } 
          return {
            ...provided,
            width: isTabletLandscape ? '280%' : '200%',
            height: '49px',
            minHeight: '49px',
            border: borderColor, // Aplicar el color de borde determinado
          };
        },
        menu: (provided, state) => ({
          ...provided,
          width: isTabletLandscape ? '190px' : '185px',
        }),
      };
      

    //Función para manejar los cambios en los porcentajes
    const handlePorcentageChange = (event) => {
     
        // Actualiza el estado de fuelLevel con el nuevo valor
        setFuelLevel(event.target.value);
    };

    const handleSelectChange = (option) => {
        const currentStatus = workOrderStatus.value;
        const nextStatus = option.value;

        if (validTransitions[currentStatus].includes(nextStatus)) {

            if (nextStatus === 'assigned') {
                setShowAssignModal(true);
                setEditingKm(true);
            } else if (nextStatus === 'cancelled' || nextStatus === 'completed') {
                const action = nextStatus === 'cancelled' ? "cancelar" : "completar";
                setModalConfig({
                    title: "Confirmación",
                    message: `Desea ${action} la orden de trabajo.?`,
                    showNotes: nextStatus === 'completed', // Esta línea determina si se muestra el campo de notas.
                    onConfirm: (notes) => {  // Recibe las notas como un argumento.
                        changeOrderStatus(nextStatus, notes);  // Llama a `changeOrderStatus` con las notas.
                        setShowModal(false);
                    },
                    onCancel: () => {
                        setShowModal(false);
                    }
                });
                setShowModal(true);
            } else {
                changeOrderStatus(nextStatus);
            }

        } else {
            // Mostrar toast de advertencia si no es una transición válida
            toast.warn("El cambio de estado de la orden de trabajo no es válido");
            return; // Detener la ejecución aquí
        }
    };

    const changeOrderStatus = async (newStatus, notes) => {
        try {
            const baseEndpoint = `/work-orders/change-status/${workOrderId}`;
            let params = `?work_order_status=${newStatus}`;

            if (newStatus === 'completed' && notes) {
                params += `&notes=${encodeURIComponent(notes)}`; // Añade las notas a la petición solo si existen.
            }
            const url = `${baseEndpoint}${params}`;

            const response = await apiClient.put(url);

            if (response.status === 200 && response.data) {
                const lastHistory = response.data.work_order_history.slice(-1)[0];
                updateLocalStatusAndHistory({
                    newStatus: newStatus,
                    dateChanged: new Date().toISOString(),
                    created_by: lastHistory.created_by || 'Unknown',
                    notes: lastHistory.notes || '' // Esto garantiza que las notas no estén undefined.
                });

                toast.success("El cambio de estado de la orden de trabajo es válido");
                getWorkOrderDetailById();

                if (newStatus === 'completed') {
                    getWorkOrderDetailById();
                    navigate('/paymentReceipt', {
                        state: {
                            fromWorkOrder: true,
                            workOrderData: {
                                id: workOrderId,
                                workOrderCode: workOrderDetail.work_order_code,
                                clientName: workOrderDetail.client.name,
                                plate: workOrderDetail.vehicle.plate,
                                subtotal: parseFloat(totalValue).toFixed(2),
                                clientId: workOrderDetail.client.id
                            }
                        }
                    });

                }
            }
        } catch (error) {
            toast.error("Error al cambiar el estado de la orden de trabajo");
            console.error("Error al cambiar el estado de la orden de trabajo:", error);
        }
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

            console.log("datos de la orden de trabaho", response.data)

            setWorkOrderDetail(response.data);
            setNewKm(response.data.km)
            console.log("datos del km", newKm)
            const selectionFromApi = transformVehicleStatusToSelections(response.data.vehicle_status);
            setSelections(selectionFromApi);
            setFuelLevel(response.data.vehicle_status.fuel_level);
            setIdVehicleStatus(response.data.vehicle_status.id);
            setWorkOrderItems(response.data.work_order_items || []);
            setWorkOrderOperations(response.data.work_order_operations || []);
            setWorkOrderServices(response.data.work_order_services || []);
            if (Array.isArray(response.data.work_order_services)) {
                const allOperationsFromApiResponse = response.data.work_order_services.flatMap(item => item.operations);
                setServicesWithOperations(allOperationsFromApiResponse);
            } else {
                console.error('work_order_services is not an array:', response.data.work_order_services);
            }
            const receivedSymptoms = response.data.vehicle_status.presented_symptoms;
            if (typeof receivedSymptoms === 'string') {
                const symptomsArray = receivedSymptoms.split(',').map(symptom => symptom.trim()).filter(Boolean);
                setSymptoms(symptomsArray);
            } else {
                console.error('Unexpected type for presented_symptoms:', typeof receivedSymptoms);
            }
            setLoading(false);

        } catch (error) {
            toast.error('Error al obtener el detalle de la orden de trabajo', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    const updateLocalStatusAndHistory = (assignmentInfo) => {
        setWorkOrderStatus({
            value: assignmentInfo.newStatus,
            label: WorkOrderStatusOptions.find(option => option.value === assignmentInfo.newStatus).label
        });

        setWorkOrderDetail(prevState => ({
            ...prevState,
            work_order_history: [...prevState.work_order_history, {
                work_order_status: assignmentInfo.newStatus,
                date_changed: assignmentInfo.dateChanged,
                created_by: assignmentInfo.created_by,
                notes: assignmentInfo.notes
            }]
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
            { Header: "Título", accessor: "title" },
            {
                Header: "Precio (P.U.)",
                accessor: "price",
                Cell: ({ value }) => (
                    <div style={{ fontSize: "16px" }}>
                        $ {parseFloat(value).toFixed(2)}
                    </div>
                )
            },
            {
                Header: "Cantidad",
                accessor: "quantity",
                Cell: ({ value }) => (
                    <div style={{ fontSize: "16px" }}>
                        {value}
                    </div>
                )
            },
            {
                Header: "Total",
                accessor: "total",  // Usaremos esta clave para calcular el total en el accessor
                Cell: ({ row }) => {
                    const price = row.original.price || 0;
                    const quantity = row.original.quantity || 1;
                    const total = parseFloat(price) * parseInt(quantity, 10);

                    return (
                        <div style={{ fontSize: "16px" }} className='total-products'>
                            $ {total.toFixed(2)}
                        </div>
                    );
                }
            }
        ],
        []
    );

    const columnsOperations = React.useMemo(
        () => [
            { Header: "Código", accessor: "operation_code" },
            { Header: "Título", accessor: "title" },
            {
                Header: "Costo",
                accessor: "cost",
                Cell: ({ value }) =>
                    <div>
                        $ {parseFloat(value).toFixed(2)}
                    </div>
            },
        ],
        []
    );

    const handleProductsUpdated = (updatedProducts) => {
        setSelectedProducts(updatedProducts);
    };

    const handleOperationsUpdated = (selectedOptions) => {
        setSelectedOperations(selectedOptions);
    };

    const handleServiceOperationsUpdated = (serviceOps) => {
        setServicesWithOperations(serviceOps);
    };

    const handleServicesListUpdate = (updatedList) => {
        setSelectedServicesList(updatedList); // Asumiendo que selectedServicesList es un estado en el padre.
    };

    const selectAllCheckboxes = () => {
        let newSelections = { ...selections };

        Object.keys(optionsCheckBox).forEach(group => {
            newSelections[group] = newSelections[group].map(() => true);
        });

        setSelections(newSelections);
    };

    const toggleEditState = () => {
        setTextareaEditable(prevEditable => !prevEditable);
        setIsEditState(prevEditState => !prevEditState);
        setIsEditingWorkOrder(prevEditing => !prevEditing);
    };

    const handleButtonClick = () => {
        setShowButton(!showButton);
        if (isEditingWorkOrder) {
            saveEditWorkOrder();
        } else {
            toggleEditState();
        }
    };

    const saveEditWorkOrder = async () => {
        const vehicleStatus = {};

        vehicleStatus.id = idVehicleStatus;
        vehicleStatus.work_order_id = Number(workOrderId);

        // Verificar si se ha ingresado el fuel_level
        const fuelLevelEntered = fuelLevel > 0
    
        if (!fuelLevelEntered) {
            // Mostrar un toast de advertencia y salir de la función
            toast.warn('Por favor, ingrese el porcentaje de gas antes de modificar la orden de trabajo', {
                position: toast.POSITION.TOP_RIGHT
            });
            return;
        }

        Object.keys(optionsCheckBox).forEach(group => {
            optionsCheckBox[group].forEach((option, index) => {
                const key = keyMapping[option];
                if (key) {  // Si el mapeo existe
                    if (key !== 'fuel_level') {
                        vehicleStatus[key] = selections[group][index];
                    } else {
                        console.log("else fuel level", fuelLevel)
                        vehicleStatus[key] = parseInt(fuelLevel, 10);
                    }
                }
            });
        });

        vehicleStatus.points_of_interest = pointsOfInterest.map(point => {
            return {
                id: point.id,
                side: point.side,
                vehicle_status_id: idVehicleStatus,
                x: point.x,
                y: point.y
            }
        });
        vehicleStatus.presented_symptoms = symptoms.join(', ');
        vehicleStatus.general_observations = observations;

        const payload = {
            comments: comments,
            vehicle_status: vehicleStatus,
            km: parseInt(newKm, 10) || 0,
        };


        try {
            const response = await apiClient.put(`/work-orders/update/${workOrderId}`, payload);

            if (response.status === 200) {  // Suponiendo que tu API devuelve 200 para una edición exitosa
                toast.success('Orden de trabajo editada exitósamente', {
                    position: toast.POSITION.TOP_RIGHT
                });
                setIsEditingWorkOrder(false);
                setTextareaEditable(false);
                setIsEditState(false);

            } else {
           
                toast.error('Ha ocurrido un error al editar la orden de trabajo', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }

        } catch (error) {

            // Obtener el mensaje de error
            const errorMessage = error.message || 'Error al editar la orden de trabajo.';
            console.log("error", error)
            // Mostrar el mensaje de error en el toast
            toast.error(errorMessage, {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    const openAssignModal = () => {
        setShowAssignModal(true);
    };

    const closeAssignModal = () => {
        setShowAssignModal(false);
    };

    const onBack = () => {
        navigate("/workOrders");
    };

    const shouldShowButton = () => {
        return workOrderStatus.value === 'to_start' || workOrderStatus.value === 'assigned';
    };

    const shouldShowButtonDeveloped = () => {
        return workOrderStatus.value === 'in_development';
    };

    const handleProductsSelected = (updatedProducts) => {
        // Actualiza el estado o realiza acciones adicionales según sea necesario
        setSelectedProducts(updatedProducts);
    };

    const handleKmInputChange = (e) => {
        setNewKm(e.target.value);
    };

    const handleOpenModalPayment = async () => {
        setWorkOrderModalOpen(true);
        setFetchingData(true);
        console.log("entro al modal", fetchingData)
    };

    const closeModalPayment = () => {
        setWorkOrderModalOpen(false);
    };

    const handleWorkOrderConfirm = async () => {

        const selectedDateAdjusted = new Date(selectedDate);
        selectedDateAdjusted.setHours(selectedDate.getHours() - selectedDate.getTimezoneOffset() / 60);

        try {
            // Construir el payload
            const payload = {
                client_id: workOrderDetail.client.id,
                work_order_id: parseInt(workOrderDetail.id, 10),
                invoice_type: 'sales_note',
                subtotal: totalValue,
                discount: discount / 100,
                vat: 0,
                total: total,
                date: selectedDateAdjusted.toISOString()
            };

            console.log("datos a enviasr", payload)

            // Llamada a la API
            const response = await apiClient.post('/sales-receipts/create', payload);

            if (response.status === 201) {
                toast.success('Operación exitosa', {
                    position: toast.POSITION.TOP_RIGHT
                });
                setLastAddedReceiptId(response.data.id);
                navigate('/paymentReceipt');
            }

            setWorkOrderModalOpen(false);

        } catch (error) {
            console.log("error", error)
            toast.error('Error al procesar la orden de trabajo', {
                position: toast.POSITION.TOP_RIGHT
            });
            console.error('', error);
        }
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

    useEffect(() => {
        if (workOrderItems && workOrderItems.length > 0) {
            setExistProductsSaved(true)
            setSelectedProducts(workOrderItems);
        }
    }, [workOrderItems]);

    useEffect(() => {
        if (workOrderOperations && workOrderOperations.length > 0) {
            setExistServiceSaved(true);
            setSelectedOperations(workOrderOperations);
        }
    }, [workOrderOperations]);

    useEffect(() => {
        if (workOrderServices && workOrderServices.length > 0) {
            setExistOperationSaved(true);
            setSelectedServicesList(workOrderServices);
        }
    }, [workOrderServices]);

    useEffect(() => {
    }, [selectedServicesList]);

    useEffect(() => {
    }, [operationServiceCosts]);

    useEffect(() => {
    }, [servicesWithOperations]);

    useEffect(() => {
        if (!isModalOpenProducts && !isModalOpenServices) {
            const calculateTotal = (arr, field) => {
                return arr.reduce((acc, item) => {
                    const value = parseFloat(item[field]);
                    return acc + (isNaN(value) ? 0 : value);
                }, 0);
            };

            const calculateTotalProduct = (arr) => {
                return arr.reduce((acc, item) => {
                    const price = parseFloat(item['price']);
                    const quantity = parseFloat(item['quantity']);
                    const total = price * quantity;
                    return acc + (isNaN(total) ? 0 : total);
                }, 0);
            }


            const totalProductsValue = calculateTotalProduct(selectedProducts);
            const totalOperationsValue = calculateTotal(selectedOperations, 'cost');
            const totalServicesValue = calculateTotal(servicesWithOperations, 'cost');

            const total = totalProductsValue + totalOperationsValue + totalServicesValue;

            setTotalValue(total.toFixed(2));
            setOldTotalValue(totalValue);
        } else {
            setTotalValue(oldTotalValue);
        }
    }, [selectedProducts, selectedOperations, servicesWithOperations, isModalOpenProducts, oldTotalValue, totalValue]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await getWorkOrderDetailById();
                console.log("datos  orden de trabajo", workOrderDetail)
                const newWorkOrderData = {
                    id: workOrderId,
                    workOrderCode: workOrderDetail.work_order_code,
                    clientName: workOrderDetail.client.name,
                    plate: formatPlate(workOrderDetail.vehicle.plate),
                    subtotal: totalValue,
                    clientId: workOrderDetail.client.id
                };
                setWorkOrderData(newWorkOrderData);
                setFetchingData(false); // Se ha completado la obtención de datos
            } catch (error) {

            }
        };

        if (workOrderDetail !== null && fetchingData) {
            fetchData();
        }
    }, [workOrderDetail, fetchingData]);

    return (
        <div>
            {!showAssignModal && <ToastContainer />}

            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <div className="spinner-container">

                {loading ? (
                    <div className="loader-container">
                        <PuffLoader color="#316EA8" loading={loading} size={60} />
                    </div>

                ) : (

                    <div>

                        <div className="new-work-order-general-container">
                            <div className="new-work-order-title-container">
                                <button onClick={onBack} className="button-arrow-client">
                                    <img src={arrowLeftIcon} className="arrow-icon-client" alt="Arrow Icon" />
                                </button>

                                <div className='new-work-order-title-container-h2'>
                                    <h2 style={{ display: 'contents' }}>Detalle Orden de Trabajo {workOrderDetail.work_order_code}</h2>
                                </div>

                                <img src={clockIcon} alt="Clock Icon" className="clock-icon" onClick={openHistoryModal} />
                                <div className={`div-container-select ${['to_start', 'assigned'].includes(workOrderDetail.work_order_status) ? '' : 'div-container-hidden'}`}>
                             
                                        <Select
                                            isSearchable={false}
                                            styles={customStylesStatusWorkOrder}
                                            value={workOrderStatus}
                                            onChange={handleSelectChange}
                                            options={WorkOrderStatusOptions}
                                            classNamePrefix="react-select"
                                        />

                                </div>
                                {['to_start', 'assigned'].includes(workOrderDetail.work_order_status) && (
                                    <button className="confirm-button" onClick={handleButtonClick}>
                                        <span className="text-confirm-button">
                                            {isEditingWorkOrder ? 'Confirmar' : 'Editar'}
                                        </span>
                                    </button>
                                )}

                            </div>

                            <div className="client-search-container">
                                <div className="left-div-detail">
                                    <div className="container-data-client-information">

                                        <h2>Cliente</h2>

                                        <div className="label-container">
                                            <label className="label-title">Nombre:</label>
                                            <label className="label-input-detail">{workOrderDetail.client.name}</label>
                                        </div>
                                        <div className="label-container">
                                            <label className="label-title">Cédula:</label>
                                            <label className="label-input-detail">{workOrderDetail.client.cedula}</label>
                                        </div>
                                        <div className="label-container">
                                            <label className="label-title">Dirección:</label>
                                            <label className="label-input-detail">{workOrderDetail.client.address}</label>
                                        </div>
                                        <div className="label-container">
                                            <label className="label-title">Teléfono:</label>
                                            <label className="label-input-detail">{workOrderDetail.client.phone}</label>
                                        </div>
                                        <div className="label-container">
                                            <label className="label-title">Correo:</label>
                                            <label className="label-input-detail">{workOrderDetail.client.email}</label>
                                        </div>

                                    </div>
                                </div>

                                <div className="right-div-container">
                                    <div className='right-div-container-top'>
                                        <div className="container-right-div-information-vehicle-detail">
                                            <div className='div-information-vehicle'>

                                                <div style={{ marginTop: '-32px', display: 'flex' }}>
                                                    <h2>Vehículo</h2>
                                                    <div className="input-plate-container-work-order-detail">
                                                        <input
                                                            className="input-plate-vehicle-work-order-detail"
                                                            type="text"
                                                            value={workOrderDetail.vehicle.plate}
                                                            readOnly />
                                                    </div>
                                                </div>

                                                <div className="div-information-vehicle-fields">
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
                                                        <label style={{ marginLeft: '15px' }}>{workOrderDetail.vehicle.model}</label>
                                                    </div>
                                                    <div className="vehicle-fields">
                                                        <label className="label-vehicle">Año:</label>
                                                        <label style={{ marginLeft: '56px' }}>{workOrderDetail.vehicle.year}</label>
                                                    </div>
                                                </div>


                                            </div>
                                        </div>

                                        <div className="container-right-div-information-vehicle-km">
                                            <div className="vehicle-km-fields">
                                                <label className="label-vehicle-km">KM:</label>
                                                <div className='vehicle-km-container'>
                                                    {isEditingWorkOrder && (
                                                        <input
                                                            className="input-new-km"
                                                            type="text"
                                                            value={newKm}
                                                            onChange={handleKmInputChange}
                                                        />
                                                    )}
                                                    {!isEditingWorkOrder && (
                                                        <label>{newKm}</label>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="vehicle-total-fields">
                                                <label className="label-total">Total:</label>
                                                <div className="total-value-container">
                                                    <label className="total-value">
                                                        ${integerPart}.<span style={{ fontSize: '28px' }}>{decimalPart}</span>
                                                    </label>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="container-right-div-information-vehicle">
                                        <div className="container-fields-new-work-order-vehicle">
                                            <div className="work-order-detail-fields">
                                                <label className="label-work-order">Fecha de inicio:</label>
                                                <label className="label-start-date">{workOrderDetail.date_start}</label>
                                            </div>

                                            <div className="work-order-detail-fields">
                                                <label className="label-vehicle-created">Creada por:</label>
                                                <label className="label-created">{workOrderDetail.created_by}</label>
                                            </div>

                                            <div className="work-order-detail-fields">
                                                <label className="label-asigned">Asignada a:</label>
                                                <label>{workOrderDetail.assigned}</label>
                                            </div>

                                        </div>
                                        <div className="container-fields-new-work-order-vehicle-second">
                                            <div className="work-order-detail-fields">
                                                <label className="label-work-order">Fecha de fin:</label>
                                                <label className="label-start-date">{workOrderDetail.date_finish}</label>
                                            </div>

                                            <div className="work-order-detail-fields">
                                                <label className="label-vehicle-delivery">Entregada por:</label>
                                                <label>{workOrderDetail.delivered_by}</label>
                                            </div>

                                            <div className="work-order-detail-fields">
                                                <label className="label-billed">Comprobante:</label>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <label style={{ marginLeft: '-12px' }}>{workOrderDetail.is_billed ? 'Generado' : 'No Generado'}</label>
                                                    {!workOrderDetail.is_billed && workOrderDetail.work_order_status === 'completed' && (
                                                        <button
                                                            className="button-payment-receipt"
                                                            style={{
                                                                height: '40px',
                                                                marginTop: '-3px',
                                                                marginRight: '13px'
                                                            }}
                                                            onClick={handleOpenModalPayment}
                                                        >
                                                            <img src={receiptIcon} alt="Receipt Icon" className="payment-receipt-icon" style={{ width: '25px', height: '25px' }} />
                                                        </button>

                                                    )}


                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="div-section-information">
                                <div className="title-second-section-container">
                                    <div style={{ display: 'flex' }}>
                                        <h3>Comentarios</h3>
                                        {
                                            shouldShowButton()
                                        }

                                    </div>

                                    <button onClick={() => toggleComponentes('comments')} className="button-toggle">
                                        <img
                                            src={arrowIcon}
                                            alt="Icono"
                                            className={`icon ${iconsRotation.comments ? 'rotated' : ''}`}
                                        />
                                    </button>
                                </div>

                                {/* Renderización condicional para mostrar/ocultar la sección de comentarios */}
                                {visibleSections['comments'] && (
                                    <div className="comments-section">
                                        <textarea
                                            value={comments}
                                            onChange={(e) => setComments(e.target.value)}
                                            disabled={!isTextareaEditable}
                                        >
                                        </textarea>
                                    </div>
                                )}

                                <div className="title-second-section-container">
                                    <div style={{ display: 'flex' }}>
                                        <h3>Estado de Entrega</h3>
                                        {
                                            shouldShowButton()
                                        }

                                    </div>

                                    <button className="button-toggle" onClick={() => toggleComponentes('state')}>
                                        <img
                                            src={arrowIcon}
                                            alt="Icono"
                                            className={`icon ${iconsRotation.state ? 'rotated' : ''}`}
                                        />
                                    </button>
                                </div>

                                {visibleSections['state'] && (
                                    <>
                                        <div style={{ textAlign: "right", marginBottom: '10px' }}>
                                            <button
                                                className="btn-select-all"
                                                disabled={!isEditState}
                                                onClick={selectAllCheckboxes}>
                                                Seleccionar todos
                                            </button>
                                        </div>

                                        <div className="checkbox-container">
                                            {Object.keys(optionsCheckBox).map((group) => (
                                                <div key={group} className="checkbox-group">
                                                    {optionsCheckBox[group].map((labelName, index) => {
                                                        // Si es "Combustible", solo mostrar la etiqueta
                                                        if (labelName === 'Combustible') {
                                                            return <label key={index}>{labelName}</label>;
                                                        }
                                                        // Si es "Gas", mostrar el ícono (y el valor en porcentaje si es necesario)
                                                        else if (labelName === 'Gas') {
                                                            return (
                                                                <div key={index}>
                                                                    <img src={fuelIcon} alt="Fuel Icon" className="fuel-icon" />
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        value={fuelLevel || ''}
                                                                        onChange={(event) => handlePorcentageChange(event)}
                                                                        disabled={!isEditState}
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
                                                                        disabled={!isEditState}
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
                                                        contentEditable={isEditState}
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
                                                                    contentEditable={isEditState}
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
                                                        disabled={!isEditState}
                                                    >
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
                                            initialPoints={workOrderDetail.vehicle_status.points_of_interest}
                                            isEditable={isEditState}
                                        />

                                    </>
                                )
                                }

                                <div className="title-second-section-container">
                                    <h3>Repuestos</h3>
                                    <button className="button-toggle" onClick={() => toggleComponentes('products')}>
                                        <img
                                            src={arrowIcon}
                                            alt="Icono"
                                            className={`icon ${iconsRotation.products ? 'rotated' : ''}`}
                                        />
                                    </button>
                                </div>

                                {visibleSections['products'] && (
                                    <>
                                        <div className="div-products">
                                            <div className="container-div-products">

                                                {
                                                    shouldShowButtonDeveloped() &&
                                                    <img
                                                        className="icon-container"
                                                        src={addIcon}
                                                        alt="Open Modal"
                                                        onClick={handleOpenModalProducts}
                                                    />
                                                }

                                                {!isModalOpenProducts ? (
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
                                                ) : (
                                                    <></>
                                                )}


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
                                            className={`icon ${iconsRotation.services ? 'rotated' : ''}`}
                                        />
                                    </button>
                                </div>

                                {visibleSections['services'] && (
                                    <>
                                        <div className="div-services">

                                            <div className="container-div-services">

                                                {shouldShowButtonDeveloped() &&
                                                    <img
                                                        className="icon-container"
                                                        src={addIcon}
                                                        alt="Open Modal"
                                                        onClick={handleOpenModalServices}
                                                    />
                                                }

                                                {!isModalOpenServices ? (
                                                    <div className="div-table-products">
                                                        {allOperations.length > 0 && (
                                                            <DataTable
                                                                data={allOperations}
                                                                columns={columnsOperations}
                                                                highlightRows={false}
                                                                initialPageSize={4}
                                                            />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <></>
                                                )}

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
                    onCloseAndSave={handleSaveAndCloseProducts}
                    onProductsSelected={handleProductsSelected}
                    selectedProducts={selectedProducts}
                    onProductsUpdated={handleProductsUpdated}
                    initialProductPrices={productPrices}
                    initialProductQuantities={productQuantities}
                    onProductPricesUpdated={setProductPrices}
                    onProductQuantitiesUpdated={setProductQuantities}
                    workOrderId={workOrderId}
                />
            )}

            {isModalOpenServices && (
                <SearchServicesOperationsModal
                    onClose={handleCloseModalServices}
                    onCloseAndSave={handleSaveAndCloseModalServices}
                    onOperationsSelected={setSelectedOperations}
                    selectedOperations={selectedOperations}
                    onOperationUpdated={handleOperationsUpdated}
                    initialOperationCost={operationCosts}
                    onOperationCostUpdated={setOperationCosts}
                    selectedServicesList={selectedServicesList}
                    setSelectedServicesList={setSelectedServicesList}
                    servicesWithOperations={servicesWithOperations}
                    initialOperationServiceCost={operationServiceCosts}
                    onServiceOperationsUpdated={handleServiceOperationsUpdated}
                    onOperationServiceCostUpdated={setOperationServiceCosts}
                    onServicesListUpdate={handleServicesListUpdate}
                    workOrderId={workOrderId}
                    workOrderOperations={workOrderOperations}
                    workOrderServices={workOrderServices}
                />
            )}

            {isOpenHistoryWorkOrderModal && (
                <ModalHistoryWorkOrder
                    isOpen={openHistoryModal}
                    onClose={closeHistoryModal}
                    orderHistory={workOrderDetail.work_order_history}
                    workOrderCode={workOrderDetail.work_order_code}
                />
            )}

            {showModal && (
                <ConfirmationModal
                    isOpen={showModal}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    onConfirm={modalConfig.onConfirm}
                    onCancel={modalConfig.onCancel}
                    showNotes={modalConfig.showNotes}
                />
            )}

            {showAssignModal && (
                <AssignModal
                    isOpen={openAssignModal}
                    onClose={closeAssignModal}
                    onConfirm={(assignmentInfo) => {
                        updateLocalStatusAndHistory(assignmentInfo);
                        setShowAssignModal(false);
                    }}
                    workOrderId={workOrderId}
                    getWorkOrderDetail={getWorkOrderDetailById}
                />

            )}

            {isWorkOrderModalOpen && (
                <WorkOrderInfoModal
                    isOpen={isWorkOrderModalOpen}
                    onClose={closeModalPayment}
                    workOrderData={workOrderData}
                    onConfirm={handleWorkOrderConfirm}
                    discount={discount}
                    setDiscount={setDiscount}
                    total={total}
                    setTotal={setTotal}
                    vat={vat}
                    setVat={setVat}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                />

            )}

        </div>


    );

};

export default InformationWorkOrder;
