import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTable, usePagination } from "react-table";
import { debounce } from 'lodash';
import PuffLoader from "react-spinners/PuffLoader";
import axios from "axios";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import OperationRightSection from "../operations/OperationRightSection";
import apiClient from "../../services/apiClient";
import { usePageSizeForTabletLandscape } from "../../pagination/UsePageSize";
import useCSSVar from "../../hooks/UseCSSVar";
import ResultItem from '../../resultItem/ResultItem';
import Icon from '../../components/Icons';
import ScrollListWithIndicators from '../../components/ScrollListWithIndicators';
import SectionTitle from '../../components/SectionTitle';
import { ButtonCard } from '../../buttons/buttonCards/ButtonCard';
import ServiceForm from './ServiceForm';
import CustomModal from '../../modal/customModal/CustomModal';
import { showToastOnce } from '../../utils/toastUtils';
import { searchOptions } from '../../constants/filterOptions';

const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";

const Services = () => {

    const tertiaryColor = useCSSVar('--tertiary-color');

    //Variables para controlar el tab de servicios y operaciones
    const [activeTab, setActiveTab] = useState('servicios');
    const [loading, setLoading] = useState(true);
    const [currentSection, setCurrentSection] = useState(null);
    const [showButtonAddService, setShowButtonAddService] = useState(true);
    const [showButtonAddOperation, setShowButtonAddOperation] = useState(true);
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


    const responsivePageSizeOperations = usePageSizeForTabletLandscape(6, 3);

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);

        if (tabName === 'operaciones') {
            setCurrentSection(null);
        } else if (tabName === 'servicios') {
            setCurrentSection(null);
        } else {
            const lastSectionForTab = lastActiveSection[tabName];
            setCurrentSection(lastSectionForTab || null);
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
        setShowButtonAddOperation(false);
        setShowButtonAddService(false);
    };

    const handleSelectClick = (option) => {
        setSelectedOption(option);
        closeFilterModal();
    };

    const handleAddService = (event) => {
        event.stopPropagation();
        resetForm();
        setActiveTab('servicios');
        setCurrentSection('addService');
        setLastActiveSection(prevState => ({ ...prevState, servicios: 'addService' }));
        setShowButtonAddOperation(false);
        setShowButtonAddService(false);
    };


    const handleShowServiceInformation = async (serviceId, event) => {
        event.stopPropagation();
        const selectedServ = services.find(serv => serv.id === serviceId);
        try {
            const response = await apiClient.get(`/services/${selectedServ.id}`);
            setSelectedService(response.data);
            setTitle(response.data.service_title);
            setMode('edit');
            setIsEditing(false);
            setCurrentSection('addService');
            setActiveTab('servicios');
            setShowButtonAddService(false);
            setShowButtonAddOperation(false);
            setLastActiveSection(prevState => ({ ...prevState, servicios: 'addService' }));
        } catch (error) {
            console.error("Error fetching service information:", error);
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
    };

    const handleTabChange = (tabName) => {
        setActiveTabOperation(tabName);
        setSearchOperationTerm('');
    };

    const handleSearchOperationsWithDebounce = useCallback(
        debounce(async () => {

            const searchTypeOperationCode = "operation_code";
            const searchTypeTitle = "title";
            let endpoint = '';

            if (searchOperationTerm) {
                if (activeTabOperation === 'código') {
                    endpoint = `/operations/search?search_type=${searchTypeOperationCode}&criteria=${searchOperationTerm}`;
                } else {
                    endpoint = `/operations/search?search_type=${searchTypeTitle}&criteria=${searchOperationTerm}`;
                }
            } else {

                endpoint = `/operations/all`;
            }

            try {
                const response = await apiClient.get(endpoint, {
                    cancelToken: source.token
                });

                if (isMounted.current) {
                    setOperation(response.data);
                }
            } catch (error) {
                if (axios.isCancel(error)) {
                }
            }
        }, 500),
        [activeTabOperation, searchOperationTerm]
    );

    const handleAddOperationModal = (operationToAdd) => {
        setSelectedOperations(prev => {
            if (prev.some(op => op.id === operationToAdd.id)) {
                showToastOnce("warn", "Esta operación ya ha sido agregada");
                return prev;
            }
            return [...prev, operationToAdd];
        });
    };

    const handleRemoveOperation = (operationIdToRemove) => {
        setSelectedOperations(prevOperations => prevOperations.filter(op => op.id !== operationIdToRemove));
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
                )
            },
            {
                Header: "",
                accessor: "action",
                Cell: ({ row }) => (
                    <button className="custom-button-delete" onClick={() => handleRemoveOperation(row.original.id)}>
                        <Icon name="delete" className="delete-icon-table" />
                    </button>
                )
            }
        ],
        []
    );

    const columnsForOperations = React.useMemo(
        () => [
            { Header: "Código", accessor: "operation_code" },
            { Header: "Título", accessor: "title" },
            {
                Header: "Precio",
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
        data: selectedOperations,
        initialState: { pageSize: 5 }
    }, usePagination);

    const handleAddOperation = (event) => {
        event.stopPropagation();
        setSelectedOperation(null);
        setActiveTab('operaciones');
        setCurrentSection('addOperation');
        setLastActiveSection(prevState => ({ ...prevState, operaciones: 'addOperation' }));
        setShowButtonAddOperation(false);
        setShowButtonAddService(false);
    };

    const handleOperationChange = (updatedOperation, action) => {
        let newOperations;

        switch (action) {
            case "ADD":
            case "UPDATE":
                const operationIndex = operations.findIndex(op => op.id === updatedOperation.id);

                if (operationIndex !== -1) {
                    newOperations = [...operations];
                    newOperations[operationIndex] = updatedOperation;
                } else {
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
        setShowButtonAddOperation(true);
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
        setActiveTab('servicios');
        setShowButtonAddService(true);
        setShowButtonAddOperation(false);
    };

    const handleGoBack = () => {
        setCurrentSection(null);
        resetForm();
        setActiveTab('operaciones');
        setShowButtonAddService(false);
        setShowButtonAddOperation(true);
    };

    //Calcular el total del costo del servicio mediante el valor
    //de cada operación seleccionada
    let operationsData = mode === 'edit' ? selectedService.operations : selectedOperations;

    let totalCost = operationsData.reduce((sum, operation) => {
        const cost = parseFloat(operation.cost);

        if (isNaN(cost)) {
            console.error('Valor inválido:', operation.cost);
            return sum;
        }

        return sum + cost;
    }, 0);


    //Función para crear un nuevo servicio 
    const handleSaveOrUpdateService = async (event) => {
        event.preventDefault();
        const id_operations = selectedOperations.map(op => op.id);

        try {
            if (mode === 'add') {
                const response = await apiClient.post('/services/create', { title, id_operations });
                setServices(response.data);
                showToastOnce("success", "Servicio registrado");
                resetForm();
                setLastUpdated(Date.now());
                setCurrentSection(null);
            } else {
                const response = await apiClient.put(`/services/update/${selectedService.id}`, { title, id_operations });
                setServices(response.data);
                showToastOnce("success", "Servicio actualizado");
                setLastUpdated(Date.now());
                setIsEditing(false);
            }
        } catch (error) {
            const mensajesError = error.response?.data?.errors?.map(err => err.message).join(" / ")
                || 'Error al guardar el servicio';
            showToastOnce("error", mensajesError);
        }
    };


    //Función para eliminar un servicio
    const handleDeleteService = async (event) => {

        event.preventDefault();
        setIsAlertServiceSuspend(false);

        try {

            const response = await apiClient.delete(`/services/delete/${selectedService.id}`)

            if (response.status === 200) {
                showToastOnce("success", "Servicio eliminado");
                setLastUpdated(Date.now());
                setCurrentSection(null);
            } else {
                showToastOnce("error", "Error al eliminar el servicio");
            }

        } catch (error) {
            showToastOnce("error", "Antes de eliminar el servicio debe eliminar las operaciones asociadas al servicio");
        }
    };

    const resetForm = () => {
        setSelectedService({});
        setSelectedOperations([]);
        setTitle('');

        setMode('add');
        setIsEditing(true);
    };

    //Función que permite obtener todas las operaciones
    //registrados cuando inicia la pantalla y las busca
    //por título o código
    useEffect(() => {

        const fetchData = async () => {

            let endpoint = '/operations/all';
            const searchTypeOperationCode = "operation_code";
            const searchTypeTitle = "title";

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
                    showToastOnce("error", "La solicitud ha superado el tiempo límite");
                } else {
                }
            }
        }
        fetchData();
    }, [searchTerm, selectedOption]);

    //Función que permite obtener todos los servicios
    //registrados cuando inicia la pantalla y las busca
    //por título o código
    useEffect(() => {

        const fetchData = async () => {

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


    useEffect(() => {

        isMounted.current = true;

        handleSearchOperationsWithDebounce();

        return () => {
            isMounted.current = false;
            source.cancel('Search term changed or component unmounted');
        };
    }, [searchOperationTerm, activeTabOperation, handleSearchOperationsWithDebounce]);


    React.useEffect(() => {
        if (currentSection === 'addService' && mode === 'add') {
            setIsEditing(true);
        } else if (mode === 'edit') {
            setIsEditing(false);
        }
    }, [mode, currentSection]);

    React.useEffect(() => {
        if (mode === 'edit' && selectedService) {
            setSelectedOperations(selectedService.operations || []);
        }
    }, [mode, selectedService]);

    React.useEffect(() => {
        if (activeTab === 'servicios') {
            setShowButtonAddService(true);
        } else if (activeTab === 'operaciones') {
            setShowButtonAddOperation(true);
        }
    }, [activeTab]);

    return (
        <div>
            <Header showIconCartics={true} showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu resetFunction={resetServiceState} />

            <div className="two-column-layout">
                <div className="left-panel">
                    {/*Título del contenedor con buscador */}
                    <div className="tabs-service-operation">
                        <div className={`tab-slider ${activeTab}`}></div>
                        <button
                            className={`button-tab-service ${activeTab === 'servicios' ? 'active' : ''}`}
                            onClick={() => handleTabClick('servicios')}
                        >
                            Servicios
                        </button>
                        <button
                            className={`button-tab-service ${activeTab === 'operaciones' ? 'active' : ''}`}
                            onClick={() => handleTabClick('operaciones')}
                        >
                            Operaciones
                        </button>
                    </div>

                    <TitleAndSearchBox
                        selectedOption={selectedOption}
                        title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} // Convertir a mayúscula inicial
                        onSearchChange={activeTab === 'servicios' ? handleSearchServiceWithDebounce : handleSearchOperationWithDebounce}
                        onButtonClick={openFilterModal}
                    />

                    {loading ? (
                        <div className="loader-container" style={{ marginLeft: '-93px' }}>
                            <PuffLoader color={tertiaryColor} loading={loading} size={60} />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'servicios' && (
                                <ScrollListWithIndicators
                                    items={services}
                                    renderItem={(serviceData) => (
                                        <ResultItem
                                            key={serviceData.id}
                                            type="service"
                                            data={serviceData}
                                            onClickEye={(e) => handleShowServiceInformation(serviceData.id, e)}
                                        />
                                    )}
                                />
                            )}

                            {activeTab === 'operaciones' && (
                                <ScrollListWithIndicators
                                    items={operations}
                                    renderItem={(operationData) => (
                                        <ResultItem
                                            key={operationData.id}
                                            type="operation"
                                            data={operationData}
                                            onClickEye={(e) => handleShowOperationInformation(operationData.id, e)}
                                        />
                                    )}
                                />
                            )}
                        </>
                    )}

                </div>

                <div className="right-panel">

                    {activeTab === 'servicios' && showButtonAddService && (
                        <>
                            <SectionTitle title="Panel de Servicios" />
                            <ButtonCard
                                icon="addService"
                                title="Nuevo Servicio"
                                description="Agrega un nuevo servicio que incluye múltiples operaciones agrupadas"
                                onClick={handleAddService}
                            />
                        </>
                    )}

                    {activeTab === 'operaciones' && showButtonAddOperation && (
                        <>
                            <SectionTitle title="Panel de Operaciones" />
                            <ButtonCard
                                icon="addOperation"
                                title="Nueva Operación"
                                description="Agrega una nueva operación"
                                onClick={handleAddOperation}
                            />
                        </>
                    )}

                    {/*Contenedor para agregar/ editar un servicio */}

                    {currentSection === 'addService' && (
                        <ServiceForm
                            mode={mode}
                            isEditing={isEditing}
                            setIsEditing={setIsEditing}
                            title={title}
                            setTitle={setTitle}
                            totalCost={totalCost}
                            handleOpenModalSearchOperation={handleOpenModalSearchOperation}
                            onSubmit={handleSaveOrUpdateService}
                            onBack={handleGoBackToButtons}
                            openAlertModalServiceSuspend={openAlertModalServiceSuspend}
                            tableInstance={{
                                getTableProps,
                                getTableBodyProps,
                                headerGroups,
                                prepareRow,
                                page,
                                canPreviousPage,
                                canNextPage,
                                previousPage,
                                nextPage,
                            }}
                            onDelete={openAlertModalServiceSuspend}
                        />

                    )}

                    {/*Contenedor para agregar operaciones */}

                    {currentSection === 'addOperation' && (
                        <OperationRightSection
                            onOperationChange={handleOperationChange}
                            localOperations={operations}
                            goBack={handleGoBack}
                        />
                    )}

                    {/*Contenedor para editar operaciones*/}

                    {currentSection === 'editOperation' && (
                        <OperationRightSection
                            onOperationChange={handleOperationChange}
                            selectedOperation={selectedOperation}
                            localOperations={operations}
                            goBack={handleGoBack}
                        />
                    )}


                </div>
            </div>

            {/*Modal del filtro de búsqueda*/}

            {
                isFilterModalOpen && (
                    <CustomModal
                        isOpen={isFilterModalOpen}
                        onCancel={closeFilterModal}
                        type="filter-options"
                        subTitle="Seleccione el filtro de búsqueda"
                        onSelect={handleSelectClick}
                        defaultOption={selectedOption}
                        options={searchOptions}
                        showCloseButton={false}

                    />
                )
            }

            {
                isSearchOperationModalOpen && (

                    <CustomModal
                        isOpen={isSearchOperationModalOpen}
                        onClose={handleCloseModalSearchOperation}
                        type="search-operation"
                        title="Buscar operaciones"
                        handleTabChange={handleTabChange}
                        onSearchChange={(e) => {
                            const value = e.target.value;
                            if (activeTabOperation === 'código' && !/^[0-9]*$/.test(value)) return;
                            if (activeTabOperation === 'título' && !/^[a-zA-Z\s]*$/.test(value)) return;
                            setSearchOperationTerm(value);
                        }}
                        searchOperationTerm={searchOperationTerm}
                        activeTab={activeTabOperation}
                        operation={operation}
                        columnsForOperations={columnsForOperations}
                        onAddOperation={handleAddOperationModal}
                        addIcon={addIcon}
                        responsivePageSizeOperations={responsivePageSizeOperations}
                    />
                )
            }

            {
                isAlertServiceSuspend && (

                    <CustomModal
                        isOpen={isAlertServiceSuspend}
                        type="confirm-delete"
                        subTitle="¿Está seguro de eliminar el servicio?"
                        description="Al eliminarlo, el servicio se perderá definitivamente y no podrá recuperarse. 
                        ¿Desea continuar?"
                        onCancel={closeAlertModalServiceSuspend}
                        onConfirm={handleDeleteService}
                        showCloseButton={false}
                    />

                )
            }


        </div >
    )

};

export default Services;
