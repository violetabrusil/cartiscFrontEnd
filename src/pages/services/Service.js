import "../../Service.css";
import "../../Modal.css";
import "../../Loader.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTable, usePagination } from "react-table";
import { debounce } from 'lodash';
import { ToastContainer, toast } from 'react-toastify';
import PuffLoader from "react-spinners/PuffLoader";
import axios from "axios";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import Modal from "../../modal/Modal";
import OperationRightSection from "../operations/OperationRightSection";
import apiClient from "../../services/apiClient";
import { CustomButtonContainer, CustomButton } from "../../buttons/customButton/CustomButton";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import DataTable from "../../dataTable/DataTable";
import { usePageSizeForTabletLandscape } from "../../pagination/UsePageSize";
import useCSSVar from "../../hooks/UseCSSVar";

const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
const deleteIcon = process.env.PUBLIC_URL + "/images/icons/deleteIcon.png";
const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const searchIcon = process.env.PUBLIC_URL + "/images/icons/searchIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";

const Services = () => {
    
    const tertiaryColor = useCSSVar('--tertiary-color');

    //Variables para controlar el tab de servicios y operaciones
    const [activeTab, setActiveTab] = useState('servicios');
    const [loading, setLoading] = useState(true);
    const [currentSection, setCurrentSection] = useState(null);
    const showButtons = currentSection === null;
    const [lastActiveSection, setLastActiveSection] = useState({
        servicios: null,  // o 'default' si hay una sección predeterminada
        operaciones: null
    });

    //Variables para la búsqueda de servicios y operaciones
    const [selectedOption, setSelectedOption] = useState('Título');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    //Variables para las operaciones y controlar el estado de sus secciones
    const [operations, setOperations] = useState([]);
    const [selectedOperation, setSelectedOperation] = useState(null);

    //Variables para los servicios y controlar el estado de sus secciones
    const [services, setServices] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const [title, setTitle] = useState('');
    const [mode, setMode] = useState('add');
    const [isEditing, setIsEditing] = useState(false);
    const [isAlertServiceSuspend, setIsAlertServiceSuspend] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isSearchOperationModalOpen, setIsSearchOperationModalOpen] = useState(false);
    const [searchOperationTerm, setSearchOperationTerm] = useState('');
    const isMounted = useRef(false);
    const source = axios.CancelToken.source();
    const [activeTabOperation, setActiveTabOperation] = useState('título');
    const [operation, setOperation] = useState([]);
    const [selectedOperations, setSelectedOperations] = useState([]);

    {/* Decidir cuál arreglo de operaciones usar basado en el modo */ }
    const operationsToShow = mode === 'edit' ? selectedService.operations : selectedOperations;

    const responsivePageSizeOperationsSelected = usePageSizeForTabletLandscape(6, 3);
    const responsivePageSizeOperations = usePageSizeForTabletLandscape(6, 3);

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);

        if (tabName === 'operaciones') { // Asumiendo que el nombre del tab de operaciones es 'operaciones'
            setCurrentSection(null);  // Muestra la sección de botones
        } else {
            const lastSectionForTab = lastActiveSection[tabName];

            if (lastSectionForTab) {
                setCurrentSection(lastSectionForTab);
            } else {
                setCurrentSection(null);
            }
        }

    };

    const handleSearchServiceChange = (term, filter) => {
        setSearchTerm(term);
        setSelectedOption(filter);
    };

    const handleSearchServiceWithDebounce = debounce(handleSearchServiceChange, 500);

    const handleSearchOperationChange = (term, filter) => {
        setSearchTerm(term);
        setSelectedOption(filter);
    };

    const handleSearchOperationWithDebounce = debounce(handleSearchOperationChange, 500);

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const handleShowOperationInformation = (operationId, event) => {
        event.stopPropagation();
        const selectedOp = operations.find(op => op.id === operationId);
        setSelectedOperation(selectedOp);
        setCurrentSection('editOperation');
        setLastActiveSection(prevState => ({
            ...prevState,
            operaciones: 'editOperation'
        }));
        //setShowButtons(false);
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

    const handleAddService = (event) => {
        event.stopPropagation();
        setActiveTab('servicios');
        setCurrentSection('addService');
        setLastActiveSection(prevState => ({ ...prevState, servicios: 'addService' }));
        // setShowButtons(false);
    };

    const handleShowServiceInformation = async (serviceId, event) => {
        event.stopPropagation();
        const selectedServ = services.find(serv => serv.id === serviceId);
        try {
            // Hacer una petición al backend para obtener la información del servicio
            const response = await apiClient.get(`/services/${selectedServ.id}`);

            // Aquí 'response.data' es la respuesta del servidor que debería contener la información del servicio.
            setSelectedService(response.data);
            setTitle(response.data.service_title);
            setMode('edit');
            setCurrentSection('addService');
            setLastActiveSection(prevState => ({
                ...prevState,
                operaciones: 'addService'
            }));

        } catch (error) {
            console.error("Error fetching service information:", error);
            // Aquí puedes manejar los errores, por ejemplo mostrar un mensaje al usuario.
        }
    };

    const openAlertModalServiceSuspend = () => {
        setIsAlertServiceSuspend(true);
    };

    const closeAlertModalServiceSuspend = () => {
        setIsAlertServiceSuspend(false);
    };

    const handleOpenModalSearchOperation = () => {
        setIsSearchOperationModalOpen(true);
    };

    const handleCloseModalSearchOperation = () => {
        setIsSearchOperationModalOpen(false);
        setSearchOperationTerm('');
        setOperation([]);
        setActiveTabOperation('código');
    };

    const handleTabChange = (tabName) => {
        setActiveTabOperation(tabName);
        setSearchOperationTerm('');
        setOperation([]);
    };

    const handleSearchOperationsWithDebounce = useCallback(
        debounce(async () => {
            // Define los tipos de búsqueda
            const searchTypeOperationCode = "operation_code";
            const searchTypeTitle = "title";
            let endpoint = '';
    
            // Si hay un término de búsqueda, decide el endpoint basado en la pestaña activa
            if (searchOperationTerm) {
                if (activeTabOperation === 'código') {
                    endpoint = `/operations/search?search_type=${searchTypeOperationCode}&criteria=${searchOperationTerm}`;
                } else {
                    endpoint = `/operations/search?search_type=${searchTypeTitle}&criteria=${searchOperationTerm}`;
                }
            } else {
                // Si no hay término de búsqueda, carga todas las operaciones
                endpoint = `/operations/all`;
            }
    
            try {
                const response = await apiClient.get(endpoint, {
                    cancelToken: source.token
                });
    
                // Solo actualiza el estado si el componente sigue montado
                if (isMounted.current) {
                    setOperation(response.data);
                }
            } catch (error) {
                if (axios.isCancel(error)) {
                    // Maneja la cancelación aquí si es necesario
                } else {
                    // Maneja otros errores aquí si es necesario
                }
            }
        }, 500),
        [activeTabOperation, searchOperationTerm] // Actualiza esta dependencia
    );
    
    const handleAddOperationModal = (operationToAdd) => {
        // Decide a qué conjunto de operaciones agregar dependiendo del modo
        const operationsToModify = mode === 'edit' ? selectedService.operations : selectedOperations;

        // Verifica si la operación ya está en la lista
        if (operationsToModify.some(op => op.id === operationToAdd.id)) {
            // Si ya fue agregada, termina la función
            return;
        }

        // Si estás en modo edit, modifica las operaciones de selectedService
        if (mode === 'edit') {
            setSelectedService(prevState => ({
                ...prevState,
                operations: [...prevState.operations, operationToAdd]
            }));
        } else {
            // Si no, modifica las operaciones seleccionadas normales
            setSelectedOperations(prev => [...prev, operationToAdd]);
        }
    };

    const handleRemoveOperation = (operationIdToRemove) => {
        // Si estás en modo edit, elimina de selectedService.Operations
        if (mode === 'edit') {
            setSelectedService(prevState => ({
                ...prevState,
                operations: prevState.operations.filter(op => op.id !== operationIdToRemove)
            }));
        } else {
            // Si estás en modo add, elimina de selectedOperations
            setSelectedOperations(prevOperations => prevOperations.filter(op => op.id !== operationIdToRemove));
        }
    };

    const columns = React.useMemo(
        () => [
            { Header: "Código", accessor: "operation_code" },
            { Header: "Título", accessor: "title" },
            {
                Header: "Costo",
                accessor: "cost",
                Cell: ({ value }) => (
                    <span className="cost-cell">
                        $ {parseFloat(value).toFixed(2)}
                    </span>
                    // Agrega un signo de dólar antes del valor y lo transforma float
                )
            }
        ],
        []
    );

    const columnsForSelectedOperations = React.useMemo(
        () => [
            { Header: "Código", accessor: "operation_code" },
            { Header: "Título", accessor: "title" },
            {
                Header: "",
                accessor: "action",
                Cell: ({ row }) => (
                    <img
                        className="less-operation-icon"
                        src={deleteIcon}
                        alt="Delete operation"
                        onClick={() => handleRemoveOperation(row.original.id)}
                    />
                )
            }
        ],
        [deleteIcon, handleRemoveOperation]
    );

    const columnsForOperations = React.useMemo(
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
            {
                Header: "",
                accessor: "action",
                Cell: ({ row }) => (
                    <img
                        className="add-operation-icon"
                        src={addIcon}
                        alt="Add operation"
                        onClick={() => handleAddOperationModal(row.original.id)}
                    />
                )
            }
        ],
        [addIcon, handleAddOperationModal]
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        nextPage,
        previousPage,
    } = useTable({
        columns,
        data: mode === 'edit' ? selectedService.operations : selectedOperations,
        initialState: { pageSize: 5 }
    }, usePagination);

    const handleAddOperation = (event) => {
        event.stopPropagation();
        setSelectedOperation(null);
        setActiveTab('operaciones');
        setCurrentSection('addOperation');
        setLastActiveSection(prevState => ({ ...prevState, operaciones: 'addOperation' }));
        //setShowButtons(false);
    };

    const handleOperationChange = (updatedOperation, action) => {
        let newOperations;

        switch (action) {
            case "ADD":
            case "UPDATE":
                const operationIndex = operations.findIndex(op => op.id === updatedOperation.id);

                if (operationIndex !== -1) {
                    // Si la operación ya existe, reemplázala
                    newOperations = [...operations];
                    newOperations[operationIndex] = updatedOperation;
                } else {
                    // Si es una nueva operación, añádela a la lista
                    newOperations = [...operations, updatedOperation];
                }
                break;

            case "SUSPEND":
                newOperations = operations.filter(op => op.id !== updatedOperation.id);
                break;

            default:
                console.error("Acción no reconocida:", action);
                return;
        }
        setOperations(newOperations);
        setCurrentSection(null);
    };

    const resetServiceState = () => {
        setActiveTab('servicios');
        setCurrentSection(null);
        setLastActiveSection({
            servicios: null,
            operaciones: null
        });

    };

    const handleGoBackToButtons = () => {
        setCurrentSection(null);
        resetForm();
    };

    //Calcular el total del costo del servicio mediante el valor
    //de cada operación seleccionada
    let operationsData = mode === 'edit' ? selectedService.operations : selectedOperations;

    let totalCost = operationsData.reduce((sum, operation) => {
        const cost = parseFloat(operation.cost);

        if (isNaN(cost)) {
            console.error('Valor inválido:', operation.cost);
            return sum;  // Retorna la suma acumulada hasta ahora sin cambiarla
        }

        return sum + cost;  // Retorna la suma acumulada más el nuevo costo
    }, 0);


    //Función para crear un nuevo servicio 
    const handleSaveOrUpdateService = async (event) => {
        event.preventDefault();
        const id_operations = selectedOperations.map(operation => operation.id);
        if (mode === 'add') {
            try {
                const response = await apiClient.post('/services/create', { title, id_operations });
                setServices(response.data);
                toast.success('Servicio registrado', {
                    position: toast.POSITION.TOP_RIGHT
                });
                resetForm();
                setLastUpdated(Date.now());
                setCurrentSection(null);
            } catch (error) {
                const mensajesError = error.response && error.response.data && error.response.data.errors
                    ? error.response.data.errors.map(err => err.message).join(" / ")
                    : 'Error al guardar el servicio';
                toast.error(mensajesError, {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        } else {
            const id_operations = selectedService.operations.map(operation => operation.id);
            try {
                const response = await apiClient.put(`/services/update/${selectedService.id}`, { title, id_operations });
                setServices(response.data);
                toast.success('Servicio actualizado', {
                    position: toast.POSITION.TOP_RIGHT
                });
                setLastUpdated(Date.now());
                setIsEditing(false);
            } catch (error) {
                const mensajesError = error.response && error.response.data && error.response.data.errors
                    ? error.response.data.errors.map(err => err.message).join(" / ")
                    : 'Error al actualizar el servicio';
                toast.error(mensajesError, {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        }
    };

    //Función para eliminar un servicio
    const handleDeleteService = async (event) => {
        //Para evitar que el formulario recargue la página
        event.preventDefault();
        setIsAlertServiceSuspend(false);

        try {

            const response = await apiClient.delete(`/services/delete/${selectedService.id}`)

            if (response.status === 200) {
                toast.success('Servicio eliminado', {
                    position: toast.POSITION.TOP_RIGHT
                });
                setLastUpdated(Date.now());
                setCurrentSection(null);
            } else {
                toast.error('Ha ocurrido un error al eliminar el servicio', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }

        } catch (error) {
            toast.error('Antes de eliminar el servicio debe eliminar las operaciones asociadas al servicio', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    const resetForm = () => {
        setTitle('');
        totalCost = 0;
        setSelectedOperations([]);
    };

    useEffect(() => {
        //Función que permite obtener todas las operaciones
        //registrados cuando inicia la pantalla y las busca
        //por título o código

        const fetchData = async () => {

            //Endpoint por defecto
            let endpoint = '/operations/all';
            const searchTypeOperationCode = "operation_code";
            const searchTypeTitle = "title";
            //Si hay un filtro de búsqueda
            if (searchTerm) {
                switch (selectedOption) {
                    case 'Código':
                        endpoint = `/operations/search?search_type=${searchTypeOperationCode}&criteria=${searchTerm}`;
                        break;
                    case 'Título':
                        endpoint = `/operations/search?search_type=${searchTypeTitle}&criteria=${searchTerm}`;
                        break;
                    default:
                        break;
                }
            }
            try {
                const response = await apiClient.get(endpoint);
                setOperations(response.data);
                setLoading(false);

            } catch (error) {
                if (error.code === 'ECONNABORTED') {
                    toast.error('La solicitud ha superado el tiempo límite.', {
                        position: toast.POSITION.TOP_RIGHT
                    });
                } else {
                }
            }
        }
        fetchData();
    }, [searchTerm, selectedOption]);

    useEffect(() => {
        //Función que permite obtener todos los servicios
        //registrados cuando inicia la pantalla y las busca
        //por título o código

        const fetchData = async () => {

            //Endpoint por defecto
            let endpoint = '/services/all';
            const searchTypeServiceCode = "service_code";
            const searchTypeTitle = "title";

            if (searchTerm) {
                switch (selectedOption) {
                    case 'Código':
                        endpoint = `/services/search?search_type=${searchTypeServiceCode}&criteria=${searchTerm}`;
                        break;
                    case 'Título':
                        endpoint = `/services/search?search_type=${searchTypeTitle}&criteria=${searchTerm}`;
                        break;
                    default:
                        break;
                }
            }
            try {
                const response = await apiClient.get(endpoint);
                setServices(response.data);
                setLoading(false);
            } catch (error) {
                if (error.code === 'ECONNABORTED') {
                    console.error('La solicitud ha superado el tiempo límite.');
                } else {
                    console.error('Se superó el tiempo límite inténtelo nuevamente.', error.message);
                }
                setServices([]);
            }
        }
        fetchData();
    }, [searchTerm, selectedOption, lastUpdated]);

    //Para realizar la búsqueda de las operaciones en el modal
    useEffect(() => {
        // Al montar el componente
        isMounted.current = true;
    
        // Inicia la búsqueda o carga todas las operaciones según el término de búsqueda
        handleSearchOperationsWithDebounce();
    
        // Cleanup al desmontar el componente o al cambiar el término de búsqueda o la pestaña activa
        return () => {
            isMounted.current = false;  // Indica que el componente ha sido desmontado
            source.cancel('Search term changed or component unmounted'); // Cancela la solicitud pendiente
        };
    }, [searchOperationTerm, activeTabOperation, handleSearchOperationsWithDebounce]); // Asegúrate de incluir activeTabOperation aquí
    

    React.useEffect(() => {
        if (currentSection === 'addService' && mode === 'add') {
            setIsEditing(true);
        } else if (mode === 'edit') {
            setIsEditing(false);
        }
    }, [mode, currentSection]);

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu resetFunction={resetServiceState} />

            <div className="two-column-layout">
                <div className="left-panel">
                    {/*Título del contenedor con buscador */}
                    <div className="tabs-service-operation">
                        <button
                            className={`button-tab-service ${activeTab === 'servicios' ? 'active' : ''}`}
                            onClick={() => handleTabClick('servicios')}
                        >
                            <div className="line-tab"></div>
                            Servicios
                        </button>
                        <button
                            className={`button-tab-service ${activeTab === 'operaciones' ? 'active' : ''}`}
                            onClick={() => handleTabClick('operaciones')}
                        >
                            <div className="line-tab "></div>
                            Operaciones
                        </button>
                    </div>

                    <div style={{ marginTop: "-10px" }}>
                        <TitleAndSearchBox
                            selectedOption={selectedOption}
                            title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} // Convertir a mayúscula inicial
                            onSearchChange={activeTab === 'servicios' ? handleSearchServiceWithDebounce : handleSearchOperationWithDebounce}
                            onButtonClick={openFilterModal}
                        />
                    </div>

                    {loading ? (
                        <div className="loader-container" style={{ marginLeft: '-93px' }}>
                            <PuffLoader color={tertiaryColor} loading={loading} size={60} />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'servicios' &&
                                <div className="scrollable-list-container">
                                    {Array.isArray(services) && services.map(serviceData => (
                                        <div key={`service-${serviceData.id}`} className="result-operations">
                                            <div className="operation-code-section">
                                                <label className="operation-code">{serviceData.service_code}</label>
                                            </div>

                                            <div className="operation-name-section">
                                                <label className="operation-name">{serviceData.service_title}</label>
                                            </div>

                                            <div className="operation-eye-section">
                                                <button className="button-eye-operation" onClick={(event) => handleShowServiceInformation(serviceData.id, event)}>
                                                    <img src={eyeIcon} alt="Eye Icon" className="icon-eye-operation" />
                                                </button>
                                            </div>

                                        </div>

                                    ))}

                                </div>
                            }
                        </>

                    )}

                    {loading ? (
                        <div className="loader-container" style={{ marginLeft: '-93px' }}>
                            <PuffLoader color={tertiaryColor} loading={loading} size={60} />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'operaciones' &&
                                <div className="scrollable-list-container">
                                    {operations.map(operationData => (
                                        <div key={`operation-${operationData.id}`} className="result-operations">
                                            <div className="operation-code-section">
                                                <label className="operation-code">{operationData.operation_code}</label>
                                            </div>

                                            <div className="operation-name-section">
                                                <label className="operation-name">{operationData.title}</label>
                                            </div>

                                            <div className="operation-eye-section">
                                                <button className="button-eye-operation" onClick={(event) => handleShowOperationInformation(operationData.id, event)}>
                                                    <img src={eyeIcon} alt="Eye Icon" className="icon-eye-operation" />
                                                </button>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            }
                        </>
                    )}

                </div>

                <div className="right-panel">
                    <ToastContainer />
                    {showButtons && (
                        <CustomButtonContainer>
                            <CustomButton title="AGREGAR SERVICIO" onClick={handleAddService} buttonClassName="button-add-serv" />
                            <CustomButton title="AGREGAR OPERACIÓN" onClick={handleAddOperation} buttonClassName="button-add-op" />
                        </CustomButtonContainer>
                    )}

                    {/*Contenedor para agregar servicio */}

                    {currentSection === 'addService' && (
                        <div className="container-general">

                            <CustomTitleSection
                                onBack={handleGoBackToButtons}
                                title={mode === 'add' ? "Agregar Servicio" : "Información del servicio"}
                                showEditIcon={mode === 'edit' ? true : false}
                                onEdit={mode === 'edit' ? () => setIsEditing(true) : null}
                                showDisableIcon={mode === 'edit' ? true : false}
                                onDisable={openAlertModalServiceSuspend}
                            />

                            <div className="container-new-service">
                                <div className="row">
                                    <label>Título</label>
                                    <input
                                        value={title}
                                        className="title-service"
                                        style={{ marginLeft: "100px" }}
                                        onChange={(e) => setTitle(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="row">
                                    <label>Costo Total</label>
                                    <input
                                        type="text"
                                        value={`$ ${totalCost.toFixed(2)}`}
                                        className="input-total-cost"
                                        style={{ marginLeft: "50px" }}
                                        readOnly />
                                </div>

                            </div>

                            <div className="container-title-add-service">
                                <h3>Operaciones</h3>
                            </div>

                            <div className="table-container">
                                <table {...getTableProps()} className="operation-selected-table">
                                    <thead>
                                        {headerGroups.map((headerGroup) => (
                                            <tr {...headerGroup.getHeaderGroupProps()}>
                                                {headerGroup.headers.map((column) => (
                                                    <th {...column.getHeaderProps()}>
                                                        {column.render('Header')}
                                                    </th>
                                                ))}

                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody {...getTableBodyProps()}>
                                        {page.map((row) => {
                                            prepareRow(row);
                                            return (
                                                <tr {...row.getRowProps()}>
                                                    {row.cells.map((cell) => (
                                                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                                    ))}
                                                </tr>
                                            )
                                        })}

                                    </tbody>

                                </table>

                                <div className="container-table-buttons">
                                    <button style={{ marginRight: "10px", marginBottom: "10px" }} onClick={() => previousPage()} disabled={!canPreviousPage}>
                                        Anterior
                                    </button>
                                    <button style={{ marginLeft: "10px", marginBottom: "10px" }} onClick={() => nextPage()} disabled={!canNextPage}>
                                        Siguiente
                                    </button>

                                </div>

                            </div>

                            <div className="container-buttons">
                                <button
                                    className="button-add-operation"
                                    style={{ marginRight: "10px", backgroundColor: isEditing ? 'var(--second-color)' : 'var(--gray-dark)' }}
                                    onClick={handleOpenModalSearchOperation}
                                    disabled={!isEditing}  >
                                    <span className="text-button">
                                        {((mode === 'edit' ? selectedService.operations : selectedOperations).length > 0) ? "Editar Operación" : "Agregar Operación"}
                                    </span>
                                </button>
                                <button
                                    className="button-add-operation"
                                    style={{ marginLeft: "10px", backgroundColor: isEditing ? 'var(--second-color)' : 'var(--gray-dark)' }}
                                    onClick={handleSaveOrUpdateService}>
                                    <span className="text-button">Aceptar</span>
                                </button>

                            </div>

                        </div>

                    )}

                    {/*Contenedor para agregar operaciones */}

                    {currentSection === 'addOperation' && (
                        <OperationRightSection
                            onOperationChange={handleOperationChange}
                            localOperations={operations}
                            goBack={handleGoBackToButtons}
                        />
                    )}

                    {/*Contenedor para editar operaciones*/}

                    {currentSection === 'editOperation' && (
                        <OperationRightSection
                            onOperationChange={handleOperationChange}
                            selectedOperation={selectedOperation}
                            localOperations={operations}
                            goBack={handleGoBackToButtons}
                        />
                    )}


                </div>
            </div>

            {/*Modal del filtro de búsqueda*/}

            {
                isFilterModalOpen && (
                    <Modal
                        isOpen={isFilterModalOpen}
                        onClose={closeFilterModal}
                        options={['Título', 'Código']}
                        defaultOption="Título"
                        onOptionChange={handleOptionChange}
                        onSelect={handleSelectClick}
                    />
                )
            }

            {
                isSearchOperationModalOpen && (
                    <div className="filter-modal-overlay">
                        <div className="modal-content">
                            <button className="button-close" onClick={handleCloseModalSearchOperation}  >
                                <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                            </button>
                            <div className="tabs">
                                <button className={`button-tab ${activeTabOperation === 'título' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('título')}>
                                    Título
                                    <div className="line"></div>
                                </button>
                                <button className={`button-tab ${activeTabOperation === 'código' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('código')}>
                                    Código
                                    <div className="line"></div>
                                </button>
                            </div>
                            <div className="search-operation-box">
                                <img src={searchIcon} alt="Search Icon" className="search-operation-icon" />
                                <input
                                    className="input-search-operation"
                                    value={searchOperationTerm}
                                    onChange={e => {
                                        const value = e.target.value;
                                        if (activeTabOperation === 'código' && !/^[0-9]*$/.test(value)) return;
                                        if (activeTabOperation === 'título' && !/^[a-zA-Z\s]*$/.test(value)) return;
                                        setSearchOperationTerm(value);
                                    }}
                                    placeholder={`Buscar por ${activeTabOperation}`}
                                    pattern={activeTabOperation === 'código' ? "[0-9]*" : "[a-zA-Z ]*"}
                                />
                            </div>

                            {/* Tabla de operaciones seleccionadas */}
                            {operationsToShow.length > 0 && (
                                <div className="selected-operations-scroll-container">
                                    <h5>Operaciones seleccionadas</h5>
                                    <DataTable
                                        data={operationsToShow}
                                        columns={columnsForSelectedOperations}
                                        deleteIconSrc={deleteIcon}
                                        onRemoveOperation={handleRemoveOperation}
                                        initialPageSize={responsivePageSizeOperationsSelected}
                                    />
                                </div>
                            )}

                            {operation.length > 0 && (
                                <div className="list-operations-scroll-container">
                                    <h5>Lista de operaciones</h5>
                                    <DataTable
                                        data={operation}
                                        columns={columnsForOperations}
                                        addIconSrc={addIcon}
                                        onAddOperation={handleAddOperationModal}
                                        initialPageSize={responsivePageSizeOperations}
                                    />


                                </div>
                            )}

                        </div>

                    </div>
                )
            }

            {
                isAlertServiceSuspend && (
                    <div className="filter-modal-overlay">
                        <div className="filter-modal">
                            <h3 style={{ textAlign: "center" }}>¿Está seguro de eliminar el servicio?</h3>
                            <div className="button-options">
                                <div className="half">
                                    <button className="optionNo-button" onClick={closeAlertModalServiceSuspend}>
                                        No
                                    </button>
                                </div>
                                <div className="half">
                                    <button className="optionYes-button" onClick={handleDeleteService}  >
                                        Si
                                    </button>

                                </div>
                            </div>

                        </div>
                    </div>

                )
            }


        </div >
    )

};

export default Services;
