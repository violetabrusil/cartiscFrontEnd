import "../../Service.css";
import "../../Modal.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTable, usePagination } from "react-table";
import { debounce } from 'lodash';
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import Modal from "../../modal/Modal";
import OperationRightSection from "../operations/OperationRightSection";
import apiClient from "../../services/apiClient";
import { CustomButtonContainer, CustomButton } from "../../customButton/CustomButton";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";

const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
const deleteIcon = process.env.PUBLIC_URL + "/images/icons/deleteIcon.png";
const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const searchIcon = process.env.PUBLIC_URL + "/images/icons/searchIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";

const Services = () => {

    //Variables para controlar el tab de servicios y operaciones
    const [activeTab, setActiveTab] = useState('servicios');
    const [currentSection, setCurrentSection] = useState(null);
    const showButtons = currentSection === null;
    const [lastActiveSection, setLastActiveSection] = useState({
        servicios: null,  // o 'default' si hay una sección predeterminada
        operaciones: null
    });

    //Variables para la búsqueda de servicios y operaciones
    const [selectedOption, setSelectedOption] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    //Variables para las operaciones y controlar el estado de sus secciones
    const [operations, setOperations] = useState([]);
    const [selectedOperation, setSelectedOperation] = useState(null);

    //Variables para los servicios y controlar el estado de sus secciones
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [isSearchOperationModalOpen, setIsSearchOperationModalOpen] = useState(false);
    const [searchOperationTerm, setSearchOperationTerm] = useState('');
    const isMounted = useRef(false);
    const source = axios.CancelToken.source();
    const [activeTabOperation, setActiveTabOperation] = useState('código');
    const [operation, setOperation] = useState([]);
    const [selectedOperations, setSelectedOperations] = useState([]);

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        const lastSectionForTab = lastActiveSection[tabName];
        console.log('Tab actual:', tabName);
        console.log('Última sección para el tab:', lastSectionForTab);

        if (lastSectionForTab) {
            setCurrentSection(lastSectionForTab);
        } else {
            setCurrentSection(null);
        }
        // Ya que showButtons se determina por el valor de currentSection, 
        // ya no necesitamos establecerlo aquí directamente
        console.log('Valor de showButtons tras el click:', showButtons);
    };

    const handleSearchServiceChange = (term, filter) => {
        console.log("term y filtro", term, filter)
        setSearchTerm(term);
        setSelectedOption(filter);
    };

    const handleSearchServiceWithDebounce = debounce(handleSearchServiceChange, 500);

    const handleSearchOperationChange = (term, filter) => {
        console.log("term filter operation", term, filter);
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
        console.log("id operation", operationId);
        const selectedOp = operations.find(op => op.id === operationId);
        setSelectedOperation(selectedOp);
        setCurrentSection('editOperation');
        setLastActiveSection(prevState => ({
            ...prevState,
            operaciones: 'editOperation'
        }));
        console.log("lastActiveSection después de update:", lastActiveSection);
        //setShowButtons(false);
    };

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const handleSelectClick = (option) => {
        // Aquí se puede manejar la opción seleccionada.
        setSelectedOption(option);
        console.log(selectedOption);

        // Cerrar el modal después de seleccionar.
        closeFilterModal();
    };

    const handleAddService = (event) => {
        event.stopPropagation();
        setActiveTab('servicios');
        setCurrentSection('addService');
        setLastActiveSection(prevState => ({ ...prevState, servicios: 'addService' }));
        console.log("lastActiveSection después de update:", lastActiveSection);
        // setShowButtons(false);
    };

    const handleShowServiceInformation = (serviceId, event) => {
        event.stopPropagation();
        console.log("id service", serviceId);
        const selectedServ = services.find(serv => serv.id === serviceId);
        setSelectedService(selectedServ);
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
            const searchTypeOperationCode = "operation_code";
            const searchTypeTitle = "title";
            let endpoint = '';
            if (activeTabOperation === 'código') {
                endpoint = `/operations/search?search_type=${searchTypeOperationCode}&criteria=${searchOperationTerm}`;
                console.log("Searching with endpoint:", endpoint);
            } else {
                endpoint = `/operations/search?search_type=${searchTypeTitle}&criteria=${searchOperationTerm}`
            }

            try {
                const response = await apiClient.get(endpoint, {
                    cancelToken: source.token
                });

                // Solo actualiza el estado si el componente sigue montado
                if (isMounted.current) {
                    setOperation(response.data);
                    console.log("operaciones modal", response.data)
                }
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log('Previous request cancelled', error.message);
                } else {
                    console.error("Error al buscar:", error);
                }
            }
        }, 500),
        [activeTab, searchOperationTerm]
    );

    const handleAddOperationModal = (operationToAdd) => {
        // Verifica si la operación ya está en la lista
        if (selectedOperations.some(op => op.id === operationToAdd.id)) {
            // Si ya fue agregada, termina la función
            return;
        }
        // Agrega la operación si no está en la lista
        setSelectedOperations(prev => [...prev, operationToAdd]);
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
                    // Agrega un signo de dólar antes del valor y lo transforma float
                )
            }
        ],
        []
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

    const handleDelete = (row) => {
        console.log("Eliminar fila: ", row);
        // Aquí puedes manejar la lógica para eliminar la fila
    };

    const handleAddOperation = (event) => {
        event.stopPropagation();
        setSelectedOperation(null);
        setActiveTab('operaciones');
        setCurrentSection('addOperation');
        setLastActiveSection(prevState => ({ ...prevState, operaciones: 'addOperation' }));
        console.log("lastActiveSection después de update:", lastActiveSection);
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
    };

    //Calcular el total del costo del servicio mediante el valor
    //de cada operación seleccionada
    const totalCost = selectedOperations.reduce((sum, operation) => {
        const cost = parseFloat(operation.cost);

        if (isNaN(cost)) {
            console.error('Valor inválido:', operation.cost);
            return sum;  // Retorna la suma acumulada hasta ahora sin cambiarla
        }

        return sum + cost;  // Retorna la suma acumulada más el nuevo costo
    }, 0);

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
            console.log("selectedoption", selectedOption)
            console.log("console", searchTerm)

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
                console.log("response", response.data);
                setOperations(response.data);


            } catch (error) {
                console.log("Error al obtener los datos de las operaciones");
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
            } catch (error) {
                console.log("Error al obtener los datos de los servicios");
            }
        }
        fetchData();
    }, [searchTerm, selectedOption]);

    //Para realizar la búsqueda de las operaciones en el modal
    useEffect(() => {
        // Al montar el componente
        isMounted.current = true;

        console.log("useEffect triggered with:", searchOperationTerm);
        if (searchOperationTerm) {
            handleSearchOperationsWithDebounce();
        } else {
            setOperation([]);
        }

        //Cleanup al desmontar el componente o al cambiar el término de búsqueda
        return () => {
            isMounted.current = false;  // Indica que el componente ha sido desmontado
            source.cancel('Search term changed or component unmounted'); // Cancela la solicitud
        };
    }, [searchOperationTerm, handleSearchOperationsWithDebounce]);

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu resetFunction={resetServiceState} />

            <div className="container-services">
                <div className="left-section-service">
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

                    {activeTab === 'servicios' &&
                        <div className="search-results-servicios">
                            {services.map(serviceData => (
                                <div key={`service-${serviceData.id}`} className="result-operations">
                                    <div className="operation-code-section">
                                        <label className="operation-code">{serviceData.service_code}</label>
                                    </div>

                                    <div className="operation-name-section">
                                        <label className="operation-name">{serviceData.title}</label>
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
                    {activeTab === 'operaciones' &&
                        <div className="search-results-operations">
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

                </div>

                <div className="right-section-service">
                    <ToastContainer />
                    {showButtons && (
                        <CustomButtonContainer>
                            <CustomButton title="AGREGAR SERVICIO" onClick={handleAddService} buttonClassName="button-add-service" />
                            <CustomButton title="AGREGAR OPERACIÓN" onClick={handleAddOperation} buttonClassName="button-add-operation" />
                        </CustomButtonContainer>
                    )}

                    {/*Contenedor para agregar servicio */}

                    {currentSection === 'addService' && (
                        <div className="container-general">

                            <CustomTitleSection
                                onBack={handleGoBackToButtons}
                                title="Agregar Servicio"
                            />

                            <div className="container-new-service">
                                <div className="row">
                                    <label>Título</label>
                                    <input
                                        className="title-service"
                                        style={{ marginLeft: "100px" }}
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
                                <button className="button-add-operation" style={{ marginRight: "10px" }} onClick={handleOpenModalSearchOperation} >
                                    <span className="text-button">
                                        {selectedOperations.length > 0 ? "Editar Operación" : "Agregar Operación"}
                                    </span>
                                </button>
                                <button className="button-add-operation" style={{ marginLeft: "10px" }}>
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

            {isFilterModalOpen && (
                <Modal
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    options={['Código', 'Título']}
                    onOptionChange={handleOptionChange}
                    onSelect={handleSelectClick}
                />
            )}

            {isSearchOperationModalOpen && (
                <div className="filter-modal-overlay">
                    <div className="modal-content">
                        <button className="button-close" onClick={handleCloseModalSearchOperation}  >
                            <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                        </button>
                        <div className="tabs">
                            <button className={`button-tab ${activeTabOperation === 'código' ? 'active' : ''}`}
                                onClick={() => handleTabChange('código')}>
                                Código
                                <div className="line"></div>
                            </button>
                            <button className={`button-tab ${activeTabOperation === 'título' ? 'active' : ''}`}
                                onClick={() => handleTabChange('título')}>
                                Título
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
                        {selectedOperations.length > 0 && (
                            <div className="selected-operations-scroll-container">
                                <h5>Operaciones seleccionadas</h5>
                                <table className="operation-table selected">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Título</th>
                                            <th style={{ textAlign: "center" }}>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOperations.map(selectOperation => (
                                            <tr key={selectOperation.id}>
                                                <td>{selectOperation.operation_code}</td>
                                                <td>{selectOperation.title}</td>
                                                <td style={{ textAlign: "center" }}>
                                                    <img
                                                        className="less-operation-icon"
                                                        src={deleteIcon}
                                                        alt="Remove operation"
                                                        onClick={() => handleRemoveOperation(selectOperation.id)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        )}

                        {operation.length > 0 && (
                            <div className="list-operations-scroll-container">
                                <h5>Lista de operaciones</h5>
                                <table className="operation-table list">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Título</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {operation.map(listOperation => (
                                            <tr key={listOperation.id} >
                                                <td>{listOperation.operation_code}</td>
                                                <td>{listOperation.title}</td>
                                                <td>
                                                    <img
                                                        className="add-operation-icon"
                                                        src={addIcon}
                                                        alt="Add operation"
                                                        onClick={() => handleAddOperationModal(listOperation)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>


                        )}

                    </div>

                </div>
            )}


        </div>
    )

};

export default Services;
