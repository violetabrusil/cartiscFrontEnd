import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';
import PuffLoader from "react-spinners/PuffLoader";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import apiClient from "../../services/apiClient";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import { getVehicleCategory } from "../../constants/vehicleCategoryConstants";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import useCSSVar from "../../hooks/UseCSSVar";
import ResultItem from "../../resultItem/ResultItem";
import SectionTitle from "../../components/SectionTitle";
import { ButtonCard } from "../../buttons/buttonCards/ButtonCard";
import ClientFormPanel from "./ClientFormPanel";
import CustomModal from "../../modal/customModal/CustomModal";
import VehicleFormPanel from "../vehicles/VehicleFormPanel";
import Icon from "../../components/Icons";
import { clientSearchOptions } from "../../constants/filterOptions";
import ScrollListWithIndicators from '../../components/ScrollListWithIndicators';
import { showToastOnce } from "../../utils/toastUtils";
import { formatPlate } from "../../utils/formatters";

const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";

const Client = () => {

    const tertiaryColor = useCSSVar('--tertiary-color');

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    //Variables para la sección de clientes
    const [clients, setClients] = useState([]);
    const [nameClient, setNameClient] = useState('');

    const [showButtonAddClient, setShowButtonAddClient] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState('Nombre Cliente');
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [clientSuspended, setClientSuspended] = useState(false);
    const [isAlertClientSuspend, setIsAlertClientSuspend] = useState(false);
    const [refreshClients, setRefreshClients] = useState(false);

    const [cedula, setCedula] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    //Variables para la sección de autos
    const [selectedClientData, setSelectedClientData] = useState(null);
    const [clientVehicles, setClientVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(false);
    const [vehicleData, setVehicleData] = useState(null);
    const [isAlertVehicleSuspend, setIsAlertVechicleSuspend] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [refreshVehicles, setRefreshVehicles] = useState(false);
    const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
    const [category, setCategory] = useState('');
    const [plateCar, setPlateCar] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [motor, setMotor] = useState('');
    const [km, setKm] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);

    const handleSearchClientChange = (term, filter) => {
        setSearchTerm(term);
        setSelectedOption(filter);
    };

    const handleSearchWithDebounce = debounce(handleSearchClientChange, 500);

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const handleSelectClick = (option) => {
        setSelectedOption(option);
        closeFilterModal();
    };

    //Estado para controlar la visibilidad del modal 
    const [showModal, setShowModal] = useState(false);

    // Estado para controlar la visibilidad de formularios
    const [showFormClient, setShowFormClient] = useState(false);
    const [showFormVehicle, setShowFormVehicle] = useState(false);
    const [showClientCarInformation, setShowClientCarInformation] = useState(false);
    const [showClientInformation, setShowClientInformation] = useState(false);
    const [showDetailCarInformation, setShowDetailCarInformation] = useState(false);

    const handleYes = () => {
        setShowModal(false);
        setShowButtonAddClient(false);
        setShowFormVehicle(true);
    };

    const handleNo = () => {
        setShowModal(false);
        setShowButtonAddClient(true);
        setShowFormClient(false);
    };

    const handleShowFormClient = () => {
        setShowFormClient(true);
        setShowClientInformation(false);
        setShowButtonAddClient(false);
    };

    const handleShowFormVehicle = () => {
        setShowFormVehicle(true);
        setShowClientCarInformation(false);
        setShowDetailCarInformation(false);
        setShowButtonAddClient(false);
        setShowFormClient(false);
    };

    // Función para restablecer el formulario
    const resetForm = () => {
        setCedula("");
        setName("");
        setAddress("");
        setEmail("");
        setPhone("");
        setPlateCar("");
        setYear("");
        setCategory("");
        setKm("");
        setBrand("");
        setModel("");
        setMotor("");
    };

    const handleInputFocus = () => {
        setIsInputFocused(true);
    };

    const handleInputBlur = () => {
        setIsInputFocused(false);
    };

    const openAlertModalClientSuspend = () => {
        setIsAlertClientSuspend(true);
    }

    const closeAlerModalClientSuspend = () => {
        setIsAlertClientSuspend(false);
    }

    //Función para agregar un cliente
    const handleAddClient = async (event) => {

        event.preventDefault();

        try {
            const response = await apiClient.post('/clients/register', { cedula, name, address, phone, email });

            const newClient = response.data;
            setClients(prevClients => [...prevClients, { client: newClient }]);
            setRefreshClients(prev => !prev);
            setShowFormClient(false);

            showToastOnce("success", "Cliente registrado");

            setTimeout(() => {
                setShowModal(true);
            }, 3000);
            setShowButtonAddClient(true);
            setSelectedClient({ client: newClient });
            setSelectedClientId(response.data.id)
            setNameClient(response.data.name);
            resetForm();

        } catch (error) {

            if (error.response && error.response.status === 400 && error.response.data.errors) {
                error.response.data.errors.forEach(err => {
                    showToastOnce("error", `${err.field}: ${err.message}`);
                });
            }
        }
    };

    //Función para obtener los vehículos de un cliente
    const fetchVehicleInfoByClientId = async (clientId) => {
        try {
            const response = await apiClient.get(`/vehicles/active/${clientId}`);
            if (response.data && response.data.length > 0) {
                const formattedVehicles = response.data.map(vehicle => {
                    if (vehicle.plate) {
                        vehicle.plate = formatPlate(vehicle.plate);
                    }
                    return vehicle;
                });

                setClientVehicles(formattedVehicles);
            } else {
                setClientVehicles([]);
            }
        } catch (error) { }
    };

    //Función para editar la información de un cliente
    const handleEditClient = async (event) => {

        event.preventDefault();

        try {
            const response = await apiClient.put(`/clients/update/${selectedClient.client.id}`, {
                cedula,
                name,
                address,
                email,
                phone
            });

            if (response.data && response.data.id) {
                setIsEditMode(false);
                const newClient = response.data;
                setClients(prevClients =>
                    prevClients.map(client =>
                        client.id === newClient.id ? newClient : client
                    )
                );
                setRefreshClients(prev => !prev);
                showToastOnce("success", "Información actualizada correctamente.");
                setShowClientInformation(false);
                setShowButtonAddClient(true);
            } else {
                showToastOnce("error", "Ha ocurrido un error al actualizar la información.");
            }

        } catch (error) {

            showToastOnce("error", "Error al guardar los cambios. Por favor, inténtalo de nuevo.");

            let mensajesError = [];
            if (error.response && error.response.data && error.response.data.errors && error.response.data.errors.length > 0) {
                mensajesError = error.response.data.errors.map(err => err.message);
            }

            const mensajeFinal = mensajesError.join(" / ");

            showToastOnce("error", mensajeFinal || "Hubo un error");

        }
    };

    //Función para suspender un cliente
    const handleUnavailableClient = async (event) => {

        event.preventDefault();
        setIsAlertClientSuspend(false);
        try {

            const response = await apiClient.put(`/clients/suspend/${selectedClient.client.id}`)

            if (response.status === 200) {
                setClientSuspended(prevState => !prevState);
                const updatedClients = clients.filter(client => client.id !== selectedClient.client.id);
                setClients(updatedClients);
                setShowClientCarInformation(false);
                setShowClientInformation(false);
                setShowButtonAddClient(true);
                setRefreshClients(prev => !prev);

                showToastOnce("success", "Cliente suspendido");

            }

        } catch (error) {
            showToastOnce("error", "Error al suspender al cliente. Por favor, inténtalo de nuevo.");
        }
    };

    const transformPlateForSaving = (plateWithDash) => {
        return plateWithDash.replace(/-/g, '');
    };

    //Función para agregar un vehículo
    const handleAddVehicle = async (event) => {

        const client_id = selectedClientId;
        const plate = transformPlateForSaving(plateCar);
        event.preventDefault();
        try {
            const response = await apiClient.post('/vehicles/register', { client_id, category, plate, brand, model, year, motor, km });

            const newVehicle = response.data;
            setVehicles(prevVehicles => [...prevVehicles, newVehicle]);
            setRefreshVehicles(prev => !prev);
            setRefreshClients(prev => !prev);

            showToastOnce("success", "Vehículo registrado");
            setTimeout(() => {
                openWorkOrderModal();
            }, 3000);
            setShowButtonAddClient(true);
            resetForm();

        } catch (error) {
            showToastOnce("error", "Error al guardar un vehiculo'");
        }

    };

    //Función para editar la información de un vehículo
    const handleEditVehicle = async (event) => {

        event.preventDefault();
        const plate = transformPlateForSaving(plateCar);

        try {
            const response = await apiClient.put(`/vehicles/update/${selectedVehicle.id}`, {
                plate,
                year,
                category,
                km,
                brand,
                model,
                motor
            });

            if (response.data && response.data.id) {
                setIsEditMode(false);
                const newVehicle = response.data;
                setVehicles(prevVehicles =>
                    prevVehicles.map(vehicle =>
                        vehicle.id === newVehicle.id ? newVehicle : vehicle
                    )
                );
                setRefreshVehicles(prev => !prev);
                showToastOnce("success", "Información actualizada correctamente.");
                setShowDetailCarInformation(false);
                setShowButtonAddClient(true);
            }

        } catch (error) {
            showToastOnce("error", "Error al guardar los cambios. Por favor, inténtalo de nuevo.");
        }
    };

    //Función para suspender un cliente
    const handleUnavailableVehicle = async (event) => {

        event.preventDefault();
        setIsAlertVechicleSuspend(false);

        try {

            const response = await apiClient.put(`/vehicles/change-status/${selectedVehicle.id}?status=suspended`)

            if (response.status === 200) {

                const updateVehicles = vehicles.filter(vehicle => vehicle.id !== selectedVehicle.id);
                setVehicles(updateVehicles);
                setShowDetailCarInformation(false);
                setShowButtonAddClient(true);
                showToastOnce("success", "Vehículo suspendido.");
            }

        } catch (error) {
            showToastOnce("error", "Error al suspender al vehículo. Por favor, inténtalo de nuevo.");
        }
    };

    const openWorkOrderModal = () => {
        setIsWorkOrderModalOpen(true);
    };

    const closeWorkOrderModal = () => {
        setIsWorkOrderModalOpen(false);
    };

    const handleAddWorkOrder = () => {
        navigate("/workOrders/newWorkOrder")
    };

    const handleClientCarInformation = (clientId, event) => {
        event.stopPropagation();

        const clientData = clients.find(client => client.client.id === clientId);

        if (!clientData) return;

        setSelectedClientData(clientData);
        setNameClient(clientData.client.name);
        fetchVehicleInfoByClientId(clientId);

        setShowClientInformation(false);
        setShowClientCarInformation(true);
        setSelectedVehicle(false);
        setShowButtonAddClient(false);
        setShowFormClient(false);
        resetForm();
    };


    const handleClientInformation = (clientId, event) => {
        event.stopPropagation();
        const client = clients.find(client => client.client.id === clientId);
        fetchVehicleInfoByClientId(client.client.id);
        setSelectedClient(client);
        setShowClientInformation(true);
        setShowClientCarInformation(false);
        setSelectedVehicle(null);
        setShowButtonAddClient(false);
        setShowFormClient(false);
        setShowFormVehicle(false);
        setShowDetailCarInformation(false);
        resetForm();
    };

    const handleDetailCarInformation = (vehicle, event) => {
        event.stopPropagation();

        if (!selectedClientData) return;

        fetchVehicleInfoByClientId(selectedClientData.client.id);
        setSelectedClient(selectedClientData);
        setNameClient(selectedClientData.client.name);
        setVehicleData(vehicle);

        setShowDetailCarInformation(true);
        setShowClientInformation(false);
        setShowClientCarInformation(false);

        setPlateCar(vehicle.plate || "");
        setYear(vehicle.year || "");
        setBrand(vehicle.brand || "");
        setModel(vehicle.model || "");
        setMotor(vehicle.motor || "");
        setCategory(vehicle.category || "");
        setKm(vehicle.km || "");
    };

    const handleGoBackToButtons = () => {
        setShowButtonAddClient(true);
        setShowFormClient(false);
        setShowClientCarInformation(false);
        setShowClientInformation(false);
        navigate('/clients');
        resetForm();
    };

    const handleGoBack = () => {
        setShowButtonAddClient(false);
        setShowFormClient(false);
        setShowClientCarInformation(true);
        setShowClientInformation(false);
        setShowDetailCarInformation(false);
        navigate('/clients');
        resetForm();
    };

    const openAlertModalVehicleSuspend = () => {
        setIsAlertVechicleSuspend(true);
    };

    const closeAlertModalVehicleSuspend = () => {
        setIsAlertVechicleSuspend(false);
    };

    //Función que permite obtener todos los clientes 
    //cuando recien se inicia la pantala y busca lo clientes
    //por cédula y nombre
    useEffect(() => {

        const fetchData = async () => {

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
                if (response.data && response.data.length > 0) {
                    setClients(response.data);
                    setLoading(false);
                } else {
                    setLoading(false);
                }
            } catch (error) { }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [searchTerm, selectedOption, refreshClients, refreshVehicles, clientSuspended]);

    //Obtención de la información del cliente para editarlo
    useEffect(() => {
        if (selectedClient) {
            setCedula(selectedClient.client.cedula);
            setName(selectedClient.client.name);
            setAddress(selectedClient.client.address);
            setEmail(selectedClient.client.email);
            setPhone(selectedClient.client.phone);
        }
    }, [selectedClient]);

    return (
        <div>
            <Header showIconCartics={true} showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <div className="two-column-layout">

                <div className="left-panel">
                    {/*Título del contenedor y cuadro de búsqueda */}
                    <TitleAndSearchBox
                        selectedOption={selectedOption}
                        title="Clientes"
                        onSearchChange={handleSearchWithDebounce}
                        onButtonClick={openFilterModal}
                    />

                    {/*Lista de clientes*/}
                    {loading ? (
                        <div className="loader-container" style={{ marginLeft: '-93px' }}>
                            <PuffLoader color={tertiaryColor} loading={loading} size={60} />
                        </div>
                    ) : (

                        <ScrollListWithIndicators
                            items={clients}
                            renderItem={(client) => (
                                <ResultItem
                                    key={client.id}
                                    type="client"
                                    data={client}
                                    onClickMain={e => handleClientCarInformation(client.client.id, e)}
                                    onClickEye={handleClientInformation}
                                />
                            )}
                        />

                    )
                    }

                </div>

                <div className="right-panel">

                    {/*Sección para mostrar el botón de agregar cliente */}
                    {showButtonAddClient && !showFormClient && !showClientCarInformation && !showClientCarInformation && !selectedVehicle && (

                        <>
                            <SectionTitle
                                title="Panel de Clientes"
                            />

                            <ButtonCard
                                icon="addClient"
                                title="Nuevo Cliente"
                                description="Agrega un nuevo cliente"
                                onClick={handleShowFormClient}

                            />
                        </>

                    )}

                    {showFormClient && !showButtonAddClient && !showClientCarInformation && !showClientCarInformation && !selectedVehicle && (
                        <>
                            <ClientFormPanel
                                mode="add"
                                cedula={cedula}
                                setCedula={setCedula}
                                name={name}
                                setName={setName}
                                address={address}
                                setAddress={setAddress}
                                email={email}
                                setEmail={setEmail}
                                phone={phone}
                                setPhone={setPhone}
                                onSubmit={handleAddClient}
                                onBack={handleGoBackToButtons}
                            />
                        </>

                    )}

                    {showClientCarInformation && !selectedVehicle && !showButtonAddClient && !showFormClient && !showClientInformation && (

                        <>
                            <CustomTitleSection
                                onBack={handleGoBackToButtons}
                                titlePrefix="Panel Clientes"
                                title="Panel Vehículos del Cliente"
                                showAddIcon={true}
                                showCustomButton={false}
                                showDisableIcon={false}
                                showEditIcon={false}
                                showFilterIcon={false}
                                onAdd={handleShowFormVehicle}
                            />

                            <div className="vehicle-info-header">
                                <div className="vehicle-info-header-left">
                                    <Icon name="client" className="icon-info-client" />
                                    <div className="client-info">
                                        <label className="client-info-name">{selectedClientData?.client?.name}</label>
                                        <label className="client-info-id">{selectedClientData?.client?.cedula}</label>
                                    </div>
                                </div>

                                <div className="vehicle-info-header-right">
                                    <span className="vehicle-label">Total vehículos:</span>
                                    <span className="vehicle-info-count">{clientVehicles.length}</span>
                                </div>
                            </div>


                            <div className="vehicle-info">
                                {clientVehicles.length === 0 ? (
                                    <div className="no-vehicles-message">
                                        <Icon name="alert" className="no-vehicles-icon" />
                                        <p>No hay vehículos registrados</p>
                                    </div>
                                ) : (
                                    clientVehicles.map(vehicle => (
                                        <div
                                            key={vehicle.id}
                                            className={`vehicle ${vehicle.category}`}
                                            onClick={(event) => handleDetailCarInformation(vehicle, event)}
                                        >
                                            <div className="vehicle-content">

                                                <div className="plate-display-client">
                                                    <div className="plate-client-ecuador-row">
                                                        <img src={flagIcon} alt="flag" className="ecuador-flag-client" />
                                                        <span className="ecuador-label-client">ECUADOR</span>
                                                    </div>
                                                    <div className="plate-value-client">{formatPlate(vehicle.plate)}</div>
                                                </div>


                                                <label className="vehicle-category">{getVehicleCategory(vehicle.category)}</label>

                                                <div className="icon-wrapper">
                                                    {vehicle.category === "car" && <Icon name="car" className="vehicles-icon" />}
                                                    {vehicle.category === "van" && <Icon name="van" className="vehicles-icon" />}
                                                    {vehicle.category === "bus" && <Icon name="bus" className="vehicles-icon" />}
                                                    {vehicle.category === "truck" && <Icon name="truck" className="vehicles-icon" />}
                                                    {vehicle.category === "suv" && <Icon name="suv" className="vehicles-icon" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>



                    )}

                    {showClientInformation && !showClientCarInformation && !selectedVehicle && !showButtonAddClient && !showFormClient && (

                        <ClientFormPanel
                            mode="edit"
                            cedula={cedula}
                            setCedula={setCedula}
                            name={name}
                            setName={setName}
                            address={address}
                            setAddress={setAddress}
                            email={email}
                            setEmail={setEmail}
                            phone={phone}
                            setPhone={setPhone}
                            isEditMode={isEditMode}
                            setIsEditMode={setIsEditMode}
                            onSubmit={handleEditClient}
                            onBack={handleGoBackToButtons}
                            onDisable={openAlertModalClientSuspend}
                            onEdit={() => setIsEditMode(true)}
                        />

                    )}

                    {isAlertClientSuspend && (

                        <CustomModal
                            isOpen={isAlertClientSuspend}
                            type="confirm-suspend"
                            subTitle="¿Está seguro de suspender el cliente?"
                            description="Al suspender el cliente, se ocultará temporalmente del sistema.
                            Podrá volver a activarlo desde Configuración en cualquier momento."
                            onCancel={closeAlerModalClientSuspend}
                            onConfirm={handleUnavailableClient}
                            showCloseButton={false}
                        />

                    )}

                    {showModal && (
                        <CustomModal
                            isOpen={showModal}
                            type="confirm-vehicle"
                            subTitle="Desea agregar un vehículo al cliente?"
                            description="Se va a agregar un vehículo para este cliente. 
                            Si lo prefiere, puede hacerlo más adelante desde el módulo Vehículos."
                            onCancel={handleNo}
                            onConfirm={handleYes}
                            showCloseButton={false}
                        />
                    )}

                    {showFormVehicle && !showButtonAddClient && !showClientCarInformation && !showClientCarInformation && !selectedVehicle && !showFormClient && (
                        <VehicleFormPanel
                            mode="add"
                            titlePrefix="Panel Vehículos del Cliente"
                            plateCar={plateCar}
                            setPlateCar={setPlateCar}
                            year={year}
                            setYear={setYear}
                            brand={brand}
                            setBrand={setBrand}
                            model={model}
                            setModel={setModel}
                            motor={motor}
                            setMotor={setMotor}
                            category={category}
                            setCategory={setCategory}
                            km={km}
                            setKm={setKm}
                            handleInputFocus={handleInputFocus}
                            handleInputBlur={handleInputBlur}
                            onSubmit={handleAddVehicle}
                            onBack={handleGoBackToButtons}
                            nameClient={nameClient}
                        />
                    )}

                    {isWorkOrderModalOpen && (

                        <CustomModal
                            isOpen={isWorkOrderModalOpen}
                            type="confirm-workorder"
                            subTitle="Desea generar una nueva orden de trabajo?"
                            description="Se va a registrar una nueva orden de trabajo para este vehículo.
                            Si lo prefiere, puede hacerlo más adelante desde el módulo Órdenes de Trabajo"
                            onCancel={closeWorkOrderModal}
                            onConfirm={handleAddWorkOrder}
                            showCloseButton={false}
                        />

                    )}

                    {showDetailCarInformation && !showFormVehicle && !showButtonAddClient && !showClientCarInformation && !showClientCarInformation && !selectedVehicle && !showFormClient && (
                        <VehicleFormPanel
                            mode="edit"
                            titlePrefix="Panel Vehículos del Cliente"
                            plateCar={plateCar}
                            setPlateCar={setPlateCar}
                            year={year}
                            setYear={setYear}
                            brand={brand}
                            setBrand={setBrand}
                            model={model}
                            setModel={setModel}
                            motor={motor}
                            setMotor={setMotor}
                            category={category}
                            setCategory={setCategory}
                            km={km}
                            setKm={setKm}
                            isEditMode={isEditMode}
                            setIsEditMode={setIsEditMode}
                            isInputFocused={isInputFocused}
                            handleInputFocus={handleInputFocus}
                            handleInputBlur={handleInputBlur}
                            onSubmit={handleEditVehicle}
                            onBack={handleGoBack}
                            onDisable={openAlertModalVehicleSuspend}
                            onEdit={() => setIsEditMode(true)}
                            nameClient={nameClient}
                        />
                    )}

                    {isAlertVehicleSuspend && (

                        <CustomModal
                            isOpen={isAlertVehicleSuspend}
                            type="confirm-suspend"
                            subTitle="¿Está seguro de suspender el vehículo?"
                            description="Al suspender el vehículo, se ocultará temporalmente del sistema.
                            Podrá volver a activarlo desde Configuración en cualquier momento."
                            onCancel={closeAlertModalVehicleSuspend}
                            onConfirm={handleUnavailableVehicle}
                            showCloseButton={false}
                        />

                    )}

                    {/*Modal del filtro de búsqueda*/}

                    {isFilterModalOpen && (

                        <CustomModal
                            isOpen={isFilterModalOpen}
                            onCancel={closeFilterModal}
                            type="filter-options"
                            subTitle="Seleccione el filtro de búsqueda"
                            onSelect={handleSelectClick}
                            defaultOption={selectedOption}
                            options={clientSearchOptions}
                            showCloseButton={false}
                        />

                    )}

                </div>

            </div>

        </div>
    )
};

export default Client;

