import "../../NewProforma.css";
import "../../NewWorkOrder.css";
import "../../Modal.css"
import "react-multi-carousel/lib/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import React, { useState, useRef, useEffect, useMemo, useContext } from "react";
import Carousel from "react-multi-carousel";
import { debounce } from 'lodash';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import DataTable from '../../dataTable/DataTable';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import Modal from "../../modal/Modal";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import apiClient from "../../services/apiClient";
import ClientContext from "../../contexts/ClientContext";
import { AddNewClientModal } from "../../modal/AddClientModal";
import { AddNewVehicleModal } from "../../modal/AddVehicleModal";
import SearchProductsModal from '../../modal/SearchProductsModal';
import SearchServicesOperationsModal from '../../modal/SearchServicesOperationsModal';
import { showToastOnce } from "../../utils/toastUtils";
import { formatPlate } from "../../utils/formatters";

const clientIcon = process.env.PUBLIC_URL + "/images/icons/userIcon-gray.png";
const autoIcon = process.env.PUBLIC_URL + "/images/icons/autoIcon.png";
const busetaIcon = process.env.PUBLIC_URL + "/images/icons/busIcon.png";
const camionetaIcon = process.env.PUBLIC_URL + "/images/icons/camionetaIcon.png";
const camionIcon = process.env.PUBLIC_URL + "/images/icons/camionIcon.png";
const arrowLeftIcon = process.env.PUBLIC_URL + "/images/icons/arrowLeftIcon.png";
const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";
const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const arrowIcon = process.env.PUBLIC_URL + "/images/icons/arrowIcon.png";

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

const NewProforma = () => {

    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [selectedOption, setSelectedOption] = useState('Nombre');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [clients, setClients] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const { selectedClient, setSelectedClient } = useContext(ClientContext);
    const { selectedVehicle } = useContext(ClientContext);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [dateStart, setDateStart] = useState(new Date());
    const [createdBy, setCreatedBy] = useState(user?.username || "");
    const [isChecked, setIsChecked] = useState(false);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
    const [toastShown, setToastShown] = useState(false);
    const [shouldUpdateClients, setShouldUpdateClients] = useState(false);
    const [shouldUpdateVehicles, setShouldUpdateVehicles] = useState(false);
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
    const [existProductsSaved, setExistProductsSaved] = useState(false);
    const [existServiceSaved, setExistServiceSaved] = useState(false);
    const [existOperationSaved, setExistOperationSaved] = useState(false);
    const [proformaItems, setProformaItems] = useState([]);
    const [proformaOperations, setProformaOperations] = useState({});
    const [proformaServices, setProformaServices] = useState([]);
    const [totalValue, setTotalValue] = useState(0);
    const [oldTotalValue, setOldTotalValue] = useState(0);

    const iconsVehicles = useMemo(() => {
        return {
            car: process.env.PUBLIC_URL + "/images/icons/autoIcon.png",
            van: process.env.PUBLIC_URL + "/images/icons/camionetaIcon.png",
            bus: process.env.PUBLIC_URL + "/images/icons/busIcon.png",
            truck: process.env.PUBLIC_URL + "/images/icons/camionIcon.png"
        };
    }, []);

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

    const handleOptionChange = (option) => {
        setSelectedOption(option);
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

    const handleSelectClick = (option) => {
        setSelectedOption(option);
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

    const resetForm = () => {
        setSelectedClient(null);
        setSearchTerm("");
        setClients([]);
    };

    const onBack = () => {
        navigate("/proformas");
        resetForm();
    };

    const getClient = async () => {

        let endpoint = '/clients/all';

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
            showToastOnce("error", "Error al obtener los datos de los clientes");
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
            } else {
                setVehicles([]);
            }
        } catch (error) {
            showToastOnce("error", "Error al obtener los vehículos del cliente");
        }
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

    const handleOpenModalProducts = () => {
        setIsModalOpenProducts(true);
    };

    const handleCloseModalProducts = () => {
        if (existProductsSaved) {
            setSelectedProducts(proformaItems)
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
    };

    const handleCloseModalServices = () => {
        if (existServiceSaved || existOperationSaved) {
            setSelectedOperations(proformaOperations);
            setServicesWithOperations(proformaServices)
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

    const handleProductsSelected = (updatedProducts) => {
        setSelectedProducts(updatedProducts);
    };

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

    useEffect(() => {
        if (proformaItems && proformaItems.length > 0) {
            setExistProductsSaved(true)
            setSelectedProducts(proformaItems);
        }
    }, [proformaItems]);

    useEffect(() => {
        if (proformaOperations && proformaOperations.length > 0) {
            setExistServiceSaved(true);
            setSelectedOperations(proformaOperations);
        }
    }, [proformaOperations]);

    useEffect(() => {
        if (proformaServices && proformaServices.length > 0) {
            setExistOperationSaved(true);
            setSelectedServicesList(proformaServices);
        }
    }, [proformaServices]);

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


    return (
        <>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <div className="new-work-order-general-container">


                <div className="new-work-order-title-container">
                    <button onClick={onBack} className="button-arrow-client">
                        <img src={arrowLeftIcon} className="arrow-icon-client" alt="Arrow Icon" />
                    </button>
                    <h2 style={{ flex: 'auto' }}>Nueva Proforma</h2>
                    <button className="confirm-button">
                        <span className="text-confirm-button ">Confirmar</span>
                    </button>
                </div>

                <div className="client-search-container-proforma">
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

                                <div className="input-group-proforma ">
                                    <label>Creada por</label>
                                    <input
                                        type="text"
                                        className="input-field-right"
                                        value={createdBy}
                                        onChange={e => setCreatedBy(e.target.value)}
                                    />
                                </div>

                                <div className="input-group-proforma">
                                    <label>Fecha</label>
                                    <DatePicker
                                        className="input-field-right"
                                        selected={dateStart}
                                        onChange={date => setDateStart(date)}
                                    />
                                </div>

                            </div>

                        </div>

                    </div>



                </div>

                <>
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

                                    <img
                                        className="icon-container"
                                        src={addIcon}
                                        alt="Open Modal"
                                        onClick={handleOpenModalProducts}
                                    />

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
                </>

                <>
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


                                    <img
                                        className="icon-container"
                                        src={addIcon}
                                        alt="Open Modal"
                                        onClick={handleOpenModalServices}
                                    />


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
                </>


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

                />
            )}

        </>
    )

};

export default NewProforma;