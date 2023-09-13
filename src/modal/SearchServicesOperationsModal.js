import "../Modal.css";
import React, { useState, useEffect, useCallback, useRef, } from "react";
import { ToastContainer, toast } from "react-toastify";
import Carousel from "react-multi-carousel";
import SearchBar from "../searchBar/SearchBar";
import DataTable from "../dataTable/DataTable";
import apiClient from "../services/apiClient";

const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const deleteIcon = process.env.PUBLIC_URL + "/images/icons/deleteIcon.png";

const SearchServicesOperationsModal = ({
    onClose,
    onOperationsSelected,
    selectedOperations = [],
    onOperationUpdated,
    operationCost: initialOperationCost,
    onOperationCostUpdated,
    selectedServicesList = [],
    setSelectedServicesList = () => { },
    servicesWithOperations,
    operationServiceCost: initialOperationServiceCost,
    onOperationServiceCostUpdated,
    onServiceOperationsUpdated,
    onServicesListUpdate
}) => {

    const [activeTab, setActiveTab] = useState('services');
    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [operations, setOperations] = useState([]);
    const [operationCost, setOperationCost] = useState(initialOperationCost || {});
    const [services, setServices] = useState([]);
    const [serviceOperations, setServiceOperations] = useState([]);
    const [operationServiceCost, setOperationServiceCost] = useState(initialOperationServiceCost || {});

    //Configuración para el carousel
    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 1,
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 1,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 1,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        },
    };    

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };

    const handleFilter = useCallback((option, term) => {
        setSelectedOption(option);
        setSearchTerm(term);
    }, []);

    const options_Services = [
        { value: 'service_code', label: 'Código' },
        { value: 'title', label: 'Título' }
    ];

    const options_Operations = [
        { value: 'operation_code', label: 'Código' },
        { value: 'title', label: 'Título' }
    ];

    //Función para manejar cambios en el costo de la operación
    const handleCostChange = (operationCode, newCost) => {
        if (isNaN(newCost)) {
            console.error(`Invalid price for operation code: ${operationCode}`);
            return;
        }
        console.log(`Changing cost for operation cod: ${operationCode} to ${newCost}`);
        setOperationCost(prevCost => ({
            ...prevCost,
            [operationCode]: newCost,
        }));
        setOperationServiceCost(prevCost => ({
            ...prevCost,
            [operationCode]: newCost,
        }));
    };

    const columns = React.useMemo(
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
                Cell: ({ row }) => {
                    const operation = row.original;
                    return (
                        <button className="button-add-product-modal" onClick={() => addOperation(operation)} >
                            <img src={addIcon} alt="Add Operation Icon" className="add-product-modal-icon " />
                        </button>
                    );
                },
                id: 'add-operation-button'
            },
        ],
        []
    );

    const columnsOperationSelected = React.useMemo(
        () => [
            { Header: "Código", accessor: "operation_code" },
            { Header: "Título", accessor: "title" },
            {
                Header: "Costo",
                accessor: "cost",
                Cell: ({ value, row }) => {
                    const operation_code = row.original.operation_code;
                    const currentCost = operationCost[operation_code] !== undefined ? operationCost[operation_code] : value;
                    const handleBlur = (e) => {
                        console.log("Actualizando precio para code", operation_code, "con valor", parseFloat(e.target.value).toFixed(2));
                        handleCostChange(operation_code, parseFloat(e.target.value));
                    }

                    return (
                        <div>
                            <span style={{ margin: '0 5px' }}>$</span>
                            <input
                                type="number"
                                step="0.01"
                                defaultValue={parseFloat(currentCost).toFixed(2)}
                                onBlur={handleBlur}
                                style={{ width: '60px', fontWeight: '600', textAlign: 'center' }}
                            />

                        </div>
                    )
                }

            },
            {
                Header: "",
                Cell: ({ row }) => {
                    const operation = row.original;
                    return (
                        <button className="button-add-product-modal" onClick={() => removeOperation(operation)}>
                            <img src={deleteIcon} alt="Add Product Icon" className="add-product-modal-icon " />
                        </button>
                    );
                },
                id: 'delete-operation-button'
            },
        ],
        [operationCost]
    );

    const columnServices = React.useMemo(
        () => [
            { Header: "Código", accessor: "service_code" },
            { Header: "Título", accessor: "title" },
            {
                Header: "",
                Cell: ({ row }) => {
                    return (
                        <button
                            className="button-add-product-modal"
                            onClick={() => handleServiceSelection(row.original)}
                        >
                            <img src={addIcon} alt="Add Service Icon" className="add-product-modal-icon " />
                        </button>
                    );
                },
                id: 'add-service-button'
            },
        ],
        []
    );

    const columnsServicesWithOperationsSelected = React.useMemo(
        () => [
            { Header: "Código", accessor: "operation_code" },
            { Header: "Título", accessor: "title" },
            {
                Header: "Costo",
                accessor: "cost",
                Cell: ({ value, row }) => {
                    const operation_code = row.original.operation_code;
                    const currentCost = operationServiceCost[operation_code] !== undefined ? operationServiceCost[operation_code] : value;
                    const handleBlur = (e) => {
                        console.log("Actualizando precio para code", operation_code, "con valor", parseFloat(e.target.value).toFixed(2));
                        handleCostChange(operation_code, parseFloat(e.target.value));

                        onOperationServiceCostUpdated({
                            ...operationServiceCost,
                            [operation_code]: parseFloat(e.target.value)
                        });
                    }


                    return (
                        <div>
                            <span style={{ margin: '0 5px' }}>$</span>
                            <input
                                type="number"
                                step="0.01"
                                defaultValue={parseFloat(currentCost).toFixed(2)}
                                onBlur={handleBlur}
                                style={{ width: '60px', fontWeight: '600', textAlign: 'center' }}
                            />

                        </div>
                    )
                }

            },
        ],
        [operationServiceCost]
    );

    const customSelectServicesModalStyles = {
        control: (base, state) => ({
            ...base,
            width: '400px',  // Aquí estableces el ancho
            height: '40px',  // Y aquí la altura
            minHeight: '40px', // Establece la altura mínima igual a la altura para evitar que cambie
            border: '1px solid rgb(0 0 0 / 34%)',
            borderRadius: '4px',
            padding: '1px',
            boxSizing: 'border-box',
            marginRight: '20px',
            marginLeft: '-20px',
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: '#999', // Color del texto del placeholder
        }),
        menu: (provided, state) => ({
            ...provided,
            width: '400px', // puedes ajustar el ancho del menú aquí
        }),

    };

    const customSelectOperationsModalStyles = {
        control: (base, state) => ({
            ...base,
            width: '400px',  // Aquí estableces el ancho
            height: '40px',  // Y aquí la altura
            minHeight: '40px', // Establece la altura mínima igual a la altura para evitar que cambie
            border: '1px solid rgb(0 0 0 / 34%)',
            borderRadius: '4px',
            padding: '1px',
            boxSizing: 'border-box',
            marginRight: '20px',
            marginLeft: '-20px',
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: '#999', // Color del texto del placeholder
        }),
        menu: (provided, state) => ({
            ...provided,
            width: '400px', // puedes ajustar el ancho del menú aquí
        }),

    };

    const selectedOperationsRef = useRef([]);

    const addOperation = (operationToAdd) => {

        let operationExistsInAnyService = selectedServicesListRef.current.some(service => {
            console.log("servicio", service)
            if (!service.Operations) {
                return false;
            }

            return service.Operations.some(op => op.operation_code === operationToAdd.operation_code);
        });


        if (operationExistsInAnyService) {
            toast.warn('La operación seleccionada ya se encuentra en Servicios.', {
                position: toast.POSITION.TOP_RIGHT
            });
            return;
        }

        onOperationsSelected(prevOperations => {
            if (prevOperations.some(op => op.operation_code === operationToAdd.operation_code)) {
                return prevOperations;
            }
            return [...prevOperations, operationToAdd];
        });
    };

    const removeOperation = (operationToRemove) => {
        onOperationsSelected(prevOperations => prevOperations.filter(op => op.operation_code !== operationToRemove.operation_code));
    };

    const selectedServicesListRef = useRef();

    const operationExistsInAddedOperations = (operation) => {
        return selectedOperationsRef.current.some(op => op.operation_code === operation.operation_code);
    };

    const handleServiceSelection = async (service) => {
        // Verificar si el servicio ya ha sido agregado anteriormente
        if (selectedServicesListRef.current.some(srv => srv.service_code === service.service_code)) {
            toast.warn('El servicio ya ha sido agregado.', {
                position: toast.POSITION.TOP_RIGHT
            });
            return;
        }

        try {
            const response = await apiClient.get(`/services/${service.id}`);
            if (response.data && response.data.Operations && response.data.Operations.length > 0) {

                // Aquí está la lógica clave:
                // Verificamos si alguna de las operaciones del servicio a agregar ya se encuentra en las operaciones seleccionadas.
                console.log("Operaciones en el servicio que se está intentando agregar:", response.data.Operations);
                console.log("Operaciones actualmente seleccionadas:", selectedOperationsRef.current);

                const operationAlreadyAdded = response.data.Operations.some(op => operationExistsInAddedOperations(op));

                if (operationAlreadyAdded) {
                    toast.warn("Una operación del Servicio seleccionado, ya se encuentra agregada", {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    return;
                }

                // Si no hay problemas, procedemos a agregar el servicio
                setSelectedServicesList(prevServices => [
                    ...prevServices,
                    {
                        ...response.data,
                        Operations: response.data.Operations
                    }
                ]);
                setServiceOperations(prevOperations => [...prevOperations, ...response.data.Operations]);
                onServiceOperationsUpdated(prevOperations => [...prevOperations, ...response.data.Operations]);
                console.log("operaciones de servicio", response.data.Operations);
            } else {
                toast.warn('El servicio seleccionado no tiene operaciones', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        } catch (error) {
            console.log("Error al obtener las operaciones del servicio", error);
        }
    };

    function mergeOperations(servicesWithOps, selectedServices) {
        console.log("servicesWithOps dentro de mergeOperations:", servicesWithOps);

        const allSelectedOps = selectedServices.flatMap(service => service.Operations || []);
        console.log("Operaciones seleccionadas (allSelectedOps):", allSelectedOps);

        const merged = servicesWithOps.map(op => {
            const selectedOp = allSelectedOps.find(selected => selected.operation_code === op.operation_code);
            const result = selectedOp ? { ...op, ...selectedOp } : op;
            console.log(`Mergiendo operación ${op.operation_code}:`, result);
            return result;
        });

        console.log("Resultado final después de la fusión:", merged);
        return merged;
    };

    const handleConfirmChangesOperations = () => {
        const updatedOperations = selectedOperations.map((operation) => {
            const operation_code = operation.operation_code;
            const cost = operationCost[operation_code] || operation.cost;
            return {
                ...operation,
                cost: cost,
            };
        });

        const updatedServicesList = selectedServicesList.map(service => {
            if (!service.Operations) return service;
            return {
                ...service,
                Operations: service.Operations.map(op => {
                    const cost = operationServiceCost[op.operation_code] || op.cost;
                    return {
                        ...op,
                        cost: cost,
                    };
                })
            };
        });

        // Usar mergeOperations para combinar y actualizar servicesWithOperations
        const updatedServicesWithOps = mergeOperations(servicesWithOperations, updatedServicesList);
        //setServicesWithOperations(updatedServicesWithOps);

        console.log("RESULTADO DESPUES DE LA AACT", updatedServicesWithOps)

        onOperationCostUpdated(operationCost);
        onOperationUpdated(updatedOperations);
        onOperationServiceCostUpdated(operationServiceCost);
        onServiceOperationsUpdated(updatedServicesWithOps);
        onServicesListUpdate(updatedServicesList);


        onClose();
    };

    const handleRemoveService = (serviceCodeToRemove) => {
        // Encuentra el servicio que va a ser eliminado
        const serviceToRemove = selectedServicesList.find(service => service.service_code === serviceCodeToRemove);

        // Obtener las operaciones asociadas con ese servicio
        const operationsToRemove = serviceToRemove ? serviceToRemove.Operations : [];

        // Elimina el servicio
        setSelectedServicesList(prevServices => prevServices.filter(service => service.service_code !== serviceCodeToRemove));

        // Elimina todas las operaciones asociadas a ese servicio en servicesWithOperations
        onServiceOperationsUpdated(prevOperations => {
            return prevOperations.filter(op => !operationsToRemove.some(remOp => remOp.id === op.id));
        });
    };

    const getServices = async () => {

        //Endpoint por defecto
        let endpoint = '/services/all';
        const searchTypeServiceCode = "service_code";
        const searchTypeTitle = "title";

        if (searchTerm) {
            switch (selectedOption.value) {
                case 'service_code':
                    endpoint = `/services/search?search_type=${searchTypeServiceCode}&criteria=${searchTerm}`;
                    break;
                case 'title':
                    endpoint = `/services/search?search_type=${searchTypeTitle}&criteria=${searchTerm}`;
                    break;
                default:
                    break;
            }
        }
        try {
            const response = await apiClient.get(endpoint);
            console.log("Respuesta del servidor:", response.data);
            setServices(response.data);
        } catch (error) {
            console.log("Error al obtener los datos de los servicios", error);
        }
    };

    const getOperations = async () => {

        //Endpoint por defecto
        let endpoint = '/operations/all';
        const searchTypeOperationCode = "operation_code";
        const searchTypeTitle = "title";
        //Si hay un filtro de búsqueda
        console.log("selectedoption", selectedOption)
        console.log("console", searchTerm)

        if (searchTerm) {
            switch (selectedOption.value) {
                case 'operation_code':
                    endpoint = `/operations/search?search_type=${searchTypeOperationCode}&criteria=${searchTerm}`;
                    break;
                case 'title':
                    endpoint = `/operations/search?search_type=${searchTypeTitle}&criteria=${searchTerm}`;
                    break;
                default:
                    break;
            }
        }
        try {
            const response = await apiClient.get(endpoint);
            console.log("endpoint operaciones", endpoint)
            console.log("response", response.data);

            setOperations(response.data);
            console.log("luego de ser guarada", response.data);
        } catch (error) {
            console.log("Error al obtener los datos de las operaciones", error);
        }
    };

    useEffect(() => {
        getOperations();
    }, [searchTerm, selectedOption]);

    useEffect(() => {
        selectedServicesListRef.current = selectedServicesList;
    }, [selectedServicesList]);

    useEffect(() => {
        console.log("selectedServicesList después de la actualización:", selectedServicesList);
    }, [selectedServicesList]);


    useEffect(() => {
        selectedOperationsRef.current = selectedOperations;
    }, [selectedOperations]);

    useEffect(() => {
        getServices();
    }, [searchTerm, selectedOption]);

    useEffect(() => {
        console.log("selectedOperations recibido en SearchServicesOperationsModal:", selectedOperations);
    }, [selectedOperations]);

    useEffect(() => {
        const initialCosts = {};
        selectedOperations.forEach(operation => {
            initialCosts[operation.operation_code] = operation.cost;
        });
        setOperationCost(initialCosts)
    }, [selectedOperations]);

    useEffect(() => {
        console.log("servicesWithOperations actualizado:", servicesWithOperations);
    }, [servicesWithOperations]);

    return (
        <div className="filter-modal-overlay">
            <ToastContainer />
            <div style={{ maxWidth: '850px' }} className="modal-payment">
                <div style={{ display: 'flex', marginLeft: '10px', marginBottom: '0px', marginTop: '0px' }}>
                    <div style={{ flex: '1' }}></div>
                    {(selectedServicesList && selectedServicesList.length > 0) || selectedOperations.length > 0 ? (
                        //Si hay operaciones seleccionadas, muestra el botón de "Guardar"
                        <button style={{ width: '100px', height: '33px', marginRight: '25px' }}
                            className="confirm-button" onClick={handleConfirmChangesOperations}>
                            <span className="text-confirm-button">
                                Guardar
                            </span>
                        </button>
                    ) : (
                        //Si no hay operaciones seleccionadas, muestra el botón "X" (cerrar)
                        <button className="button-close-modal" onClick={onClose}  >
                            <img src={closeIcon} alt="Close Icon" className="modal-close-icon"></img>
                        </button>
                    )}
                </div>

                <div className="tabs-modal">
                    <button className={`button-tab-modal ${activeTab === 'services' ? 'active' : ''}`}
                        onClick={() => handleTabChange('services')}>
                        Servicios
                        <div className="line"></div>
                    </button>
                    <button className={`button-tab-modal ${activeTab === 'operations' ? 'active' : ''}`}
                        onClick={() => handleTabChange('operations')}>
                        Operaciones
                        <div className="line"></div>
                    </button>
                </div>

                {activeTab === 'services' && (
                    <div>
                        {selectedServicesList && selectedServicesList.length > 0 && (
                            <Carousel responsive={responsive}>
                                {selectedServicesList.map((service) => (
                                    <div key={service.service_code} className="carousel-services">
                                        <div className="div-title-carousel">
                                            <h4 style={{marginLeft: '9px'}}>{service.title}</h4>
                                            <button className="button-add-product-modal" onClick={() => handleRemoveService(service.service_code)}>
                                                <img src={deleteIcon} alt="Add Product Icon" className="add-product-modal-icon " />
                                            </button>
                                        </div>
                                        <div style={{marginTop: '-10px'}}>
                                            <DataTable
                                                data={service.Operations}
                                                columns={columnsServicesWithOperationsSelected}
                                                highlightRows={false}
                                                initialPageSize={5}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </Carousel>
                        )}

                        <SearchBar onFilter={handleFilter} customSelectStyles={customSelectServicesModalStyles} customClasses="div-search-modal" options={options_Services} placeholderText="Buscar Servicios" />

                        {
                            <div className="products-modal-content">
                                <h4 style={{ marginLeft: '10px', marginBottom: '10px' }}>Lista de servicios</h4>
                                <DataTable
                                    data={services}
                                    columns={columnServices}
                                    highlightRows={false}
                                    initialPageSize={6} />
                            </div>
                        }

                    </div>
                )}

                {activeTab === 'operations' &&
                    <div>
                        {selectedOperations.length > 0 && (
                            <div className="products-modal-content">
                                <h4 style={{ marginLeft: '10px', marginBottom: '0px' }}>Operaciones seleccionadas</h4>
                                <DataTable
                                    data={selectedOperations}
                                    columns={columnsOperationSelected}
                                    highlightRows={false}
                                    initialPageSize={5} />
                            </div>
                        )}
                        <SearchBar onFilter={handleFilter} customSelectStyles={customSelectOperationsModalStyles} customClasses="div-search-modal" options={options_Operations} placeholderText="Buscar Operaciones" />
                        {

                            <div className="products-modal-content">
                                <h4 style={{ marginLeft: '10px', marginBottom: '10px' }}>Lista de operaciones</h4>
                                <DataTable
                                    data={operations}
                                    columns={columns}
                                    highlightRows={false}
                                    initialPageSize={6} />
                            </div>

                        }
                    </div>
                }
            </div>

        </div>
    );

};

export default SearchServicesOperationsModal;