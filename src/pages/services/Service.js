import "../../Service.css";
import "../../Modal.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTable, usePagination } from "react-table";
import { debounce } from 'lodash';
import { ToastContainer, toast } from 'react-toastify';
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import Modal from "../../modal/Modal";
import OperationRightSection from "../operations/OperationRightSection";
import apiClient from "../../services/apiClient";

const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
const deleteIcon = process.env.PUBLIC_URL + "/images/icons/deleteIcon.png";

const Services = () => {

    //Variables para controlar el tab de servicios y operaciones
    const [activeTab, setActiveTab] = useState('servicios');

    //Variables para la búsqueda de servicios y operaciones
    const [selectedOption, setSelectedOption] = useState('');

    //Variables para controlar el estado de las secciones de operaciones
    const [operations, setOperations] = useState([]);
    const [showEditOperation, setShowEditOperation] = useState(false);
    const [showAddOperation, setShowAddOperation] = useState(false);
    const [addOperation] = useState(true);
    const [editOperation] = useState(true);
    const [selectedOperation, setSelectedOperation] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [showButtons, setShowButtons] = useState(true);
    const [showAddService, setShowAddService] = useState(false);
    const navigate = useNavigate();

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
        setShowAddOperation(false);
        setShowAddService(false);
        setShowButtons(false);
        setShowEditOperation(true);
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
        setShowAddService(true);
        setShowButtons(false);
        setShowAddOperation(false);
    };

    const data = React.useMemo(
        () => [
            {
                codigo: "1",
                titulo: "Encerar",
                costo: "20.00",
            },
            // ... otros datos
        ],
        []
    );

    const columns = React.useMemo(
        () => [
            { Header: "Código", accessor: "codigo" },
            { Header: "Título", accessor: "titulo" },
            {
                Header: "Costo",
                accessor: "costo",
                Cell: ({ value }) => `$${value}` // Agrega un signo de dólar antes del valor
            },
            {
                Header: "",
                Cell: ({ row }) => (
                    <button className="button-delete-operation" onClick={() => handleDelete(row.original)}>
                        <img src={deleteIcon} alt="Delete Operation Icon" className="delete-icon" />
                    </button>
                ),
                id: 'delete-button'
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
    } = useTable({ columns, data }, usePagination);

    const handleDelete = (row) => {
        console.log("Eliminar fila: ", row);
        // Aquí puedes manejar la lógica para eliminar la fila
    };

    const handleAddOperation = (event) => {
        event.stopPropagation();
        setShowAddOperation(true);
        setShowAddService(false);
        setShowButtons(false);
        setSelectedOperation(null);

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
        setShowButtons(true);
        setShowAddOperation(false);
        setShowEditOperation(false);
    };

    const resetServiceState = () => {
        setShowAddOperation(false);
        setShowAddService(false);
        setShowEditOperation(false);
        setShowButtons(true);
        // resetea otros estados...
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
                            onClick={() => setActiveTab('servicios')}
                        >
                            <div className="line-tab"></div>
                            Servicios
                        </button>
                        <button
                            className={`button-tab-service ${activeTab === 'operaciones' ? 'active' : ''}`}
                            onClick={() => setActiveTab('operaciones')}
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

                    {activeTab === 'servicios' && <div className="search-results-servicios">Resultados de Servicios...</div>}
                    {activeTab === 'operaciones' &&
                        <div className="search-results-operations">
                            {operations.map(operationData => (
                                <div key={operationData.id} className="result-operations">
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
                        <div className="container-add-service">
                            <button className="button-add" style={{ marginRight: "10px" }} onClick={handleAddService} >
                                <span className="text-button">AGREGAR SERVICIO</span>
                            </button>
                            <button className="button-add" style={{ marginLeft: "10px" }} onClick={handleAddOperation}>
                                <span className="text-button">AGREGAR OPERACIÓN</span>
                            </button>
                        </div>

                    )}

                    {/*Contenedor para agregar servicio */}

                    {showAddService && !showAddOperation && (
                        <div className="container-general">
                            <div className="container-title-add-service">
                                <h2>Agregar Servicio</h2>
                            </div>

                            <div className="container-new-service">
                                <div className="row">
                                    <label>Título</label>
                                    <input style={{ marginLeft: "100px" }}></input>
                                </div>

                                <div className="row">
                                    <label>Costo Total</label>
                                    <input style={{ marginLeft: "50px" }}></input>
                                </div>

                            </div>

                            <div className="container-title-add-service">
                                <h2>Operaciones</h2>
                            </div>

                            <div style={{ backgroundColor: 'white' }}>
                                <table {...getTableProps()}>
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
                                <button className="button-add-operation" style={{ marginRight: "10px" }} onClick={handleAddOperation} >
                                    <span className="text-button">Agregar Operación</span>
                                </button>
                                <button className="button-add-operation" style={{ marginLeft: "10px" }}>
                                    <span className="text-button">Aceptar</span>
                                </button>

                            </div>

                        </div>

                    )}

                    {/*Contenedor para agregar operaciones */}

                    {showAddOperation && !showAddService && (
                        <OperationRightSection
                            onOperationChange={handleOperationChange}
                            localOperations={operations}

                        />
                    )}

                    {/*Contenedor para editar operaciones*/}

                    {showEditOperation && !showAddOperation && !showAddService && (
                        <OperationRightSection
                            onOperationChange={handleOperationChange}
                            selectedOperation={selectedOperation}
                            localOperations={operations}

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


        </div>
    )

};

export default Services;
