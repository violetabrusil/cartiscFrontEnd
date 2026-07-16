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
import { useNavigate, useLocation } from "react-router-dom";
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
import { useMediaQuery } from '../../useMediaQuery';

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
    const [existProductsSaved, setExistProductsSaved] = useState(false);
    const [existServiceSaved, setExistServiceSaved] = useState(false);
    const [existOperationSaved, setExistOperationSaved] = useState(false);
    const [editingKm, setEditingKm] = useState(false);
    const [newKm, setNewKm] = useState("");
    const [isWorkOrderModalOpen, setWorkOrderModalOpen] = useState(false);
    const [lastAddedReceiptId, setLastAddedReceiptId] = useState(null);
    const [workOrderData, setWorkOrderData] = useState(null);
    const [total, setTotal] = useState(0);
    const [vat, setVat] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isEditingWorkOrder, setIsEditingWorkOrder] = useState(false);
    const [showButton, setShowButton] = useState(true);

    const [isTaxFree, setIsTaxFree] = useState(false);

    const subtotalNum = Number(totalValue) || 0;
    const taxRate = 0.15;
    const currentIvaNum = isTaxFree ? 0 : (subtotalNum * taxRate);
    const finalTotalNum = subtotalNum + currentIvaNum;

    const [integerPart, decimalPart] = subtotalNum.toFixed(2).split('.');
    const [ivaInteger, ivaDecimal] = currentIvaNum.toFixed(2).split('.');
    const [finalInteger, finalDecimal] = finalTotalNum.toFixed(2).split('.');

    const [totalProductsValue, setTotalProductsValue] = useState(0);
    const [totalOperationsValue, setTotalOperationsValue] = useState(0);
    const [totalServicesValue, setTotalServicesValue] = useState(0);

    const [workOrderConfirmError, setWorkOrderConfirmError] = useState(null);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const [percentages, setPercentages] = useState({
        group3: [null, null, null, 0, null],
    });

    const navigate = useNavigate();
    const location = useLocation();
    const fromPage = location.state?.from;

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
        'stand_by': ['assigned', 'in_development', 'to_start', 'cancelled'],
        'completed': ['in_development', 'cancelled'],
        'cancelled': [''],
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

    const isTabletLandscape = useMediaQuery("(min-width: 800px) and (max-width: 1340px) and (orientation: landscape)");
    const isPortraitTablet = useMediaQuery("(max-width: 1024px) and (orientation: portrait)");

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
                width: isPortraitTablet ? '100%' : (isTabletLandscape ? '280%' : '200%'),
                height: isPortraitTablet ? '40px' : '49px',
                minHeight: isPortraitTablet ? '40px' : '49px',
                boxSizing: 'border-box',
                border: borderColor,
            };
        },
        menu: (provided, state) => ({
            ...provided,
            width: isPortraitTablet ? '140px' : (isTabletLandscape ? '190px' : '185px'),
        }),
    };

    const handlePorcentageChange = (event) => {
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
                const billingWarning = nextStatus === 'cancelled' && workOrderDetail.is_billed
                    ? "Esta orden ya tiene una venta generada. Al cancelar, la venta y sus pagos asociados serán cancelados."
                    : "";
                setModalConfig({
                    title: "Confirmación",
                    message: `${billingWarning} ¿Desea ${action} la orden de trabajo?`,
                    showNotes: nextStatus === 'completed',
                    onConfirm: (notes) => {
                        changeOrderStatus(nextStatus, notes);
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
            toast.warn("El cambio de estado de la orden de trabajo no es válido.");
            return;
        }
    };

    const changeOrderStatus = async (newStatus, notes) => {
        try {
            const baseEndpoint = `/work-orders/change-status/${workOrderId}`;
            let params = `?work_order_status=${newStatus}`;

            if (newStatus === 'completed' && notes) {
                params += `&notes=${encodeURIComponent(notes)}`;
            }
            const url = `${baseEndpoint}${params}`;

            const response = await apiClient.put(url);

            if (response.status === 200 && response.data) {
                const lastHistory = response.data.work_order_history.slice(-1)[0];
                updateLocalStatusAndHistory({
                    newStatus: newStatus,
                    dateChanged: new Date().toISOString(),
                    created_by: lastHistory.created_by || 'Unknown',
                    notes: lastHistory.notes || ''
                });

                toast.success("El cambio de estado de la orden de trabajo es válido.");
                getWorkOrderDetailById();

                if (newStatus === 'completed') {
                    getWorkOrderDetailById();
                    handleOpenModalPayment()

                }
            }
        } catch (error) {
            const rawMsg = error.response?.data?.message || error.response?.data?.error || null;
            const backendMsg = rawMsg?.includes('Reason:')
                ? rawMsg.split('Reason:')[1].trim()
                : rawMsg;

            toast.error(backendMsg);
            console.error("Error al cambiar el estado de la orden de trabajo:", error);
        }
    };

    const getWorkOrderDetailById = async () => {

        try {

            const response = await apiClient.get(`/work-orders/${workOrderId}`);
            if (response.data.vehicle && response.data.vehicle.plate) {
                response.data.vehicle.plate = formatPlate(response.data.vehicle.plate);
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
                const matchingStatus = WorkOrderStatusOptions.find(option => option.value === response.data.work_order_status);
                setWorkOrderStatus(matchingStatus);
            }

            console.log("datos de la orden de trabajo", response.data)

            setWorkOrderDetail(response.data);
            console.log("categoryvehicle", response.data.vehicle.category)
            setNewKm(response.data.km)
            console.log("response data de workorder detail", response.data)
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
            toast.error('Error al obtener el detalle de la orden de trabajo.', {
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
        const updatedSymptoms = [...symptoms];
        updatedSymptoms[index] = newText;
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
                accessor: "total",
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
        setSelectedServicesList(updatedList);
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

        const fuelLevelEntered = fuelLevel > 0

        if (!fuelLevelEntered) {
            toast.warn('Por favor, ingrese el porcentaje de gas antes de modificar la orden de trabajo.', {
                position: toast.POSITION.TOP_RIGHT
            });
            return;
        }

        Object.keys(optionsCheckBox).forEach(group => {
            optionsCheckBox[group].forEach((option, index) => {
                const key = keyMapping[option];
                if (key) {
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

            if (response.status === 200) {
                toast.success('Orden de trabajo editada exitósamente.', {
                    position: toast.POSITION.TOP_RIGHT
                });
                setIsEditingWorkOrder(false);
                setTextareaEditable(false);
                setIsEditState(false);

            } else {

                toast.error('Ha ocurrido un error al editar la orden de trabajo.', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }

        } catch (error) {

            const errorMessage = error.message || 'Error al editar la orden de trabajo.';
            console.log("error", error)
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
        if (fromPage) {
            navigate(fromPage);
        } else {
            navigate(-1);
        }
    };

    const shouldShowButton = () => {
        return workOrderStatus.value === 'to_start' || workOrderStatus.value === 'assigned';
    };

    const shouldShowButtonDeveloped = () => {
        return workOrderStatus.value === 'in_development';
    };

    const handleProductsSelected = (updatedProducts) => {
        setSelectedProducts(updatedProducts);
    };

    const handleKmInputChange = (e) => {
        setNewKm(e.target.value);
    };

    const handleGeneratePDF = async () => {
        try {
            setDownloadingPdf(true);
            const response = await apiClient.get(
                `/work-orders/generate-vehicle-delivery-status-pdf/${workOrderId}`,
                { responseType: 'blob' }
            );
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const disposition = response.headers['content-disposition'];
            const fileName = disposition
                ? disposition.split('filename=')[1]?.replace(/"/g, '')
                : `OT-${workOrderId}.pdf`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Estado de entrega de vehículo descargado.', { position: toast.POSITION.TOP_RIGHT });

        } catch (error) {
            toast.error('Error al generar el PDF.');
        }
        setDownloadingPdf(false);
    };

    const handleOpenModalPayment = async () => {
        try {
            const response = await apiClient.get(`/work-orders/${workOrderId}`);

            const newWorkOrderData = {
                id: workOrderId,
                workOrderCode: response.data.work_order_code,
                clientName: response.data.client.name,
                plate: formatPlate(response.data.vehicle.plate),
                subtotal: totalValue,
                clientId: response.data.client.id
            };

            setWorkOrderData(newWorkOrderData);
            setWorkOrderModalOpen(true);
        } catch (error) {
            toast.error('Error al cargar datos de la orden.');
        }
    };

    const closeModalPayment = () => {
        setWorkOrderModalOpen(false);
        setWorkOrderConfirmError(null);
    };

    const handleWorkOrderConfirm = async ({ note, registerPayment, vat, total }) => {

        setWorkOrderConfirmError(null);

        const selectedDateAdjusted = new Date(selectedDate);
        selectedDateAdjusted.setHours(selectedDate.getHours() - selectedDate.getTimezoneOffset() / 60);

        try {

            const payload = {
                client_id: workOrderDetail.client.id,
                work_order_id: parseInt(workOrderDetail.id, 10),
                sale_type: 'so',
                discount: 0,
                vat,
                date: selectedDateAdjusted.toISOString()
            };

            console.log("datos a enviasr", payload)

            const response = await apiClient.post('/sales/generate', payload);

            if (response.status === 201) {
                const saleData = response.data.data;

                setLastAddedReceiptId(saleData.id);
                setWorkOrderModalOpen(false);
                setWorkOrderConfirmError(null);

                if (registerPayment) {
                    navigate(`/payments/${saleData.payment_id}`, {
                        state: {
                            from: '/sales',
                            fromDetail: true,
                            openRegisterModal: true,
                            saleInfo: {
                                date: saleData.date?.slice(0, 10),
                                workOrderCode: workOrderData.workOrderCode,
                                client: workOrderData.clientName,
                            }
                        }
                    });
                } else {
                    toast.success('Venta generada existosamente.', {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1500,
                        onClose: () => navigate('/sales')
                    });
                }
            }

        } catch (error) {
            const rawMsg = error.response?.data?.message || error.response?.data?.error || null;
            const backendMsg = rawMsg?.includes('Reason:')
                ? rawMsg.split('Reason:')[1].trim()
                : rawMsg;

            const baseMsg = registerPayment
                ? "No se pudo generar la venta ni el registro de pago."
                : "No se pudo generar la venta.";

            setWorkOrderConfirmError(baseMsg);

            toast.error(backendMsg || baseMsg, {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
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

            const pValue = calculateTotalProduct(selectedProducts);
            const oValue = calculateTotal(selectedOperations, 'cost');
            const sValue = calculateTotal(servicesWithOperations, 'cost');

            setTotalProductsValue(pValue);
            setTotalOperationsValue(oValue);
            setTotalServicesValue(sValue);

            const subtotal = pValue + oValue + sValue;

            setTotalValue(subtotal.toFixed(2));
            setOldTotalValue(subtotal);
        } else {
            setTotalValue(oldTotalValue);
        }
    }, [selectedProducts, selectedOperations, servicesWithOperations, isModalOpenProducts]);

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
                            {(downloadingPdf) && (
                                <div className="absolute-loader-container">
                                    <PuffLoader color="#316EA8" loading={true} size={60} />
                                </div>
                            )}
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
                                    <div className="client-detail-card">
                                        <div>
                                            <h2>Cliente</h2>
                                        </div>

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
                                    <div className='right-div-container-top'>
                                        <div className="container-right-div-information-vehicle-detail">
                                            <div className="div-information-vehicle">
                                                <div className="vehicle-detail-title-row">
                                                    <h2>Vehículo</h2>
                                                    <div className="input-plate-container-work-order-detail">
                                                        <input
                                                            className="input-plate-vehicle-work-order-detail"
                                                            type="text"
                                                            value={workOrderDetail.vehicle.plate}
                                                            readOnly />
                                                    </div>
                                                </div>

                                                <div className="label-container">
                                                    <label className="label-title">Categoría:</label>
                                                    <label className="label-input">{getVehicleCategory(workOrderDetail.vehicle.category)}</label>
                                                </div>
                                                <div className="label-container">
                                                    <label className="label-title">Marca:</label>
                                                    <label className="label-input">{workOrderDetail.vehicle.brand}</label>
                                                </div>
                                                <div className="label-container">
                                                    <label className="label-title">Modelo:</label>
                                                    <label className="label-input">{workOrderDetail.vehicle.model}</label>
                                                </div>
                                                <div className="label-container">
                                                    <label className="label-title">Año:</label>
                                                    <label className="label-input">{workOrderDetail.vehicle.year}</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="container-right-div-information-vehicle-km">

                                            <div className="grid-cell highlight-km">
                                                <label className="label-style">KM:</label>
                                                <div className='vehicle-km-container'>
                                                    {isEditingWorkOrder ? (
                                                        <input className="input-new-km" value={newKm} onChange={handleKmInputChange} />
                                                    ) : (
                                                        <span>{newKm}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid-cell highlight-sub-total">
                                                <label className="label-style">TOTAL:</label>
                                                <div className="total-value-container">
                                                    <span className="subtotal-value">${integerPart}.<small>{decimalPart}</small></span>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="container-right-div-information-vehicle">
                                        <div className="client-detail-card date-detail-card">
                                            <div className="container-fields-date-detail">
                                                <div className="label-container">
                                                    <label className="label-title">Fecha de inicio:</label>
                                                    <label className="label-input">{workOrderDetail.date_start}</label>
                                                </div>

                                                <div className="label-container">
                                                    <label className="label-title">Creada por:</label>
                                                    <label className="label-input">{workOrderDetail.created_by}</label>
                                                </div>

                                                <div className="label-container">
                                                    <label className="label-title">Asignada a:</label>
                                                    <label className="label-input">{workOrderDetail.assigned}</label>
                                                </div>
                                            </div>

                                            <div className="container-fields-date-detail-second">
                                                <div className="label-container">
                                                    <label className="label-title">Fecha de fin:</label>
                                                    <label className="label-input">{workOrderDetail.date_finish}</label>
                                                </div>

                                                <div className="label-container">
                                                    <label className="label-title">Entregada por:</label>
                                                    <label className="label-input">{workOrderDetail.delivered_by}</label>
                                                </div>

                                                <div className="label-container">
                                                    <label className="label-title">Comprobante:</label>
                                                    <div className="label-input comprobante-value">
                                                        <span>{workOrderDetail.is_billed ? 'Generado' : 'No Generado'}</span>
                                                        {!workOrderDetail.is_billed && workOrderDetail.work_order_status === 'completed' && (
                                                            <button
                                                                className="button-payment-receipt"
                                                                onClick={handleOpenModalPayment}
                                                            >
                                                                <img src={receiptIcon} alt="Receipt Icon" className="payment-receipt-icon" />
                                                            </button>
                                                        )}
                                                    </div>
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
                                    <div className="section-badge">
                                        <button className="confirm-button" onClick={handleGeneratePDF}>
                                            <span className="text-confirm-button ">Generar PDF</span>
                                        </button>
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
                                            vehicleType={workOrderDetail.vehicle?.category || 'car'}
                                            updatePoints={(points) => setPointsOfInterest(points)}
                                            initialPoints={workOrderDetail.vehicle_status.points_of_interest}
                                            isEditable={isEditState}
                                        />

                                    </>
                                )
                                }

                                <div className="title-second-section-container" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <h3>Repuestos</h3>
                                    <div className="section-total-badge">
                                        <label className="section-total-label">Subtotal Repuestos:</label>
                                        <span className="section-total-value">
                                            ${totalProductsValue.toFixed(2)}
                                        </span>
                                    </div>
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
                                <div className="title-second-section-container" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <h3>Servicios/Operaciones</h3>
                                    <div className="section-total-badge">
                                        <label className="section-total-label">Subtotal Servicios/Operaciones:</label>
                                        <span className="section-total-value">
                                            ${(totalServicesValue + totalOperationsValue).toFixed(2)}
                                        </span>
                                    </div>
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
                    subtotalCalculated={subtotalNum}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    confirmError={workOrderConfirmError}
                />
            )}

        </div>


    );

};

export default InformationWorkOrder;
