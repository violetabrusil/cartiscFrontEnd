import "../../Clients.css";
import "../../Modal.css";
import "../../NewClient.css";
import 'react-toastify/dist/ReactToastify.css';
import "../../Loader.css";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify'
import { debounce } from 'lodash';
import PuffLoader from "react-spinners/PuffLoader";
import Select from 'react-select';
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import apiClient from "../../services/apiClient";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import Modal from "../../modal/Modal";
import { getVehicleCategory } from "../../constants/vehicleCategoryConstants";
import { CustomButtonContainer, CustomButton } from "../../customButton/CustomButton";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import { CustomPlaceholder } from "../../customPlaceholder/CustomPlaceholder";
import { useScrollRestoration } from "../../hooks/useScrollRestoration";

const clientIcon = process.env.PUBLIC_URL + "/images/icons/userIcon-gray.png";
const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";
const autoIcon = process.env.PUBLIC_URL + "/images/icons/autoIcon.png";
const suvIcon = process.env.PUBLIC_URL + "/images/icons/suvIcon.png";
const busetaIcon = process.env.PUBLIC_URL + "/images/icons/busIcon.png";
const camionetaIcon = process.env.PUBLIC_URL + "/images/icons/camionetaIcon.png";
const camionIcon = process.env.PUBLIC_URL + "/images/icons/camionIcon.png";
//const alertIcon = process.env.PUBLIC_URL + "/images/icons/alertIcon.png";
const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";
const cedulaIcon = process.env.PUBLIC_URL + "/images/icons/cedula.png";
const nameIcon = process.env.PUBLIC_URL + "/images/icons/name.png";
const addressIcon = process.env.PUBLIC_URL + "/images/icons/address.png";
const emailIcon = process.env.PUBLIC_URL + "/images/icons/email.png";
const phoneIcon = process.env.PUBLIC_URL + "/images/icons/phone.png";
const categoryIcon = process.env.PUBLIC_URL + "/images/icons/category.png";
const yearIcon = process.env.PUBLIC_URL + "/images/icons/year.png";
const kmIcon = process.env.PUBLIC_URL + "/images/icons/km.png";
const brandIcon = process.env.PUBLIC_URL + "/images/icons/brand.png";
const modelIcon = process.env.PUBLIC_URL + "/images/icons/model.png";
const motorIcon = process.env.PUBLIC_URL + "/images/icons/engine.png";

const Clients = () => {

    const navigate = useNavigate();

    const PAGE_SIZE = 10;

    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState('Nombre');
    const [selectedClient, setSelectedClient] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [clientSuspended, setClientSuspended] = useState(false);
    const [isAlertClientSuspend, setIsAlertClientSuspend] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef();
    const isFirstFilterRun = useRef(true);

    const [cedula, setCedula] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const [clientVehicles, setClientVehicles] = useState([]);
    const [vehicleData, setVehicleData] = useState(null);
    const [selectedClientData, setSelectedClientData] = useState(null);
    const [isAlertVehicleSuspend, setIsAlertVehicleSuspend] = useState(false);
    const [showAddVehicle, setShowAddVehicle] = useState(false);

    const [category, setCategory] = useState('');
    const [plateCar, setPlateCar] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [motor, setMotor] = useState('');
    const [km, setKm] = useState('');

    const handleCarPlateChange = (e) => {
        const value = e.target.value.toUpperCase();
        const regex = /^([A-Z]{0,3})-?(\d{0,4})$/;

        if (regex.test(value)) {
            const formattedValue = value.replace(
                /^([A-Z]{0,3})-?(\d{0,4})$/,
                (match, p1, p2) => {
                    if (p1 && p2) {
                        return p1 + "-" + p2;
                    } else {
                        return value;
                    }
                }
            );
            setPlateCar(formattedValue);
        }
    };

    const transformPlateForSaving = (plateWithDash) => {
        return plateWithDash.replace(/-/g, '');
    };

    const handleTypeCarChange = (selectedOptionCategoryCar) => {
        setCategory(selectedOptionCategoryCar.value);
    };

    const [showClientInformation, setShowClientInformation] = useState(false);
    const [showClientCarInformation, setShowClientCarInformation] = useState(false);
    const [showTitle, setShowTitle] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    //const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [refreshClients, setRefreshClients] = useState(false);

    const handleSearchWithDebounce = useMemo(
        () => debounce((term) => {

            const trimmedTerm = term ? term.trim() : "";

            if (trimmedTerm.length === 0) {
                setSearchTerm("");
            } else if (trimmedTerm.length >= 3) {
                setSearchTerm(trimmedTerm);
            }
        }, 500),
        [setSearchTerm]
    );

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const handleSelectClick = (option) => {
        setSelectedOption(option);
        closeFilterModal();
    };

    const handleAddClient = () => {
        navigate("/clients/newClient");
    };

    const handleClientInformation = (clientId, event) => {
        event.stopPropagation();
        const client = clients.find(client => client.client.id === clientId);
        setSelectedClient(client);
        setShowClientInformation(true);
        setShowClientCarInformation(false);
        setShowTitle(false);
        setSelectedVehicle(null);
       
        const clientdata = clients.find(client => client.client.id === clientId);
        setSelectedClientData(clientdata);
        setShowClientInformation(true);
        setShowClientCarInformation(false);
        setShowAddVehicle(false);
    };

    const handleClientCarInformation = (clientId, event) => {
        const clientData = clients.find(client => client.client.id === clientId);
        event.stopPropagation();
        fetchVehicleInfoByClientId(clientId);
        setSelectedClientData(clientData);
        setShowClientInformation(false);
        setShowClientCarInformation(true);
        setShowTitle(true);
        setShowAddVehicle(false);
        setSelectedVehicle(false);
        resetForm();

    };

    const handleCarInformation = (vehicle, event) => {
        event.stopPropagation();
        setVehicleData(vehicle);
        setSelectedVehicle(true);
        setShowAddVehicle(false);
        setShowClientInformation(false);
        setShowClientCarInformation(true);
    };

    const handleShowAddVehicle = (event) => {
        event.stopPropagation();
        setSelectedVehicle(false);
        setShowAddVehicle(true);
        setShowClientCarInformation(false);
        setShowClientInformation(false);
    };

    const handleAddVehicle = async (event) => {
        const client_id = selectedClientData.client.id;
        const plate = transformPlateForSaving(plateCar);
        event.preventDefault();
        try {
            const response = await apiClient.post('/vehicles/register', { client_id, category, plate, brand, model, year, motor, km });

            const newVehicle = response.data;
            setClientVehicles(prevVehicles => [...prevVehicles, newVehicle]);
            setRefreshClients(prev => !prev);
            setShowClientCarInformation(true);
            setShowClientInformation(false);
            setShowAddVehicle(false);
            setSelectedVehicle(false);

            toast.success('Vehículo registrado', {
                position: toast.POSITION.TOP_RIGHT
            });
            setShowClientCarInformation(true);
            resetForm();

        } catch (error) {
            toast.error('Error al guardar un vehiculo', {
                position: toast.POSITION.TOP_RIGHT
            });
        }

    };

    const resetForm = () => {
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

    /*
    const openAlertModal = () => {
        setIsAlertModalOpen(true);
    };

    const closeAlertModal = () => {
        setIsAlertModalOpen(false);
    };
    */

    const openAlertModalClientSuspend = () => {
        setIsAlertClientSuspend(true);
    }

    const closeAlerModalClientSuspend = () => {
        setIsAlertClientSuspend(false);
    }

    const openAlertModalVehicleSuspend = () => {
        setIsAlertVehicleSuspend(true);
    }

    const closeAlerModalVehicleSuspend = () => {
        setIsAlertVehicleSuspend(false);
    }

    /*const handleAlertClick = () => {
        openAlertModal();
    };*/

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
        return plateInput; 
    };


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
                toast.success('Cliente suspendido', {
                    position: toast.POSITION.TOP_RIGHT
                });

            } else {
                toast.error('Ha ocurrido un error al suspender al cliente.', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }

        } catch (error) {
            toast.error('Error al suspender al cliente. Por favor, inténtalo de nuevo..', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

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
                toast.success('Información actualizada correctamente.', {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 5000 
                });
                setShowClientInformation(false);
            } else {
                toast.error('Ha ocurrido un error al actualizar la información.', {
                    position: toast.POSITION.TOP_RIGHT
                })
            }

        } catch (error) {
            toast.error('Error al guardar los cambios. Por favor, inténtalo de nuevo..', {
                position: toast.POSITION.TOP_RIGHT
            });
            let mensajesError = [];
            if (error.response && error.response.data && error.response.data.errors && error.response.data.errors.length > 0) {
                mensajesError = error.response.data.errors.map(err => err.message);
            }
            const mensajeFinal = mensajesError.join(" / ");

            toast.error(mensajeFinal || "Hubo un error desconocido", {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

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
        } catch (error) {
            console.error("Error al obtener los datos del vehículo:", error);
        }
    };

    
    const handleUnavailableVehicle = async (event) => {
        event.preventDefault();
        setIsAlertVehicleSuspend(false);

        try {

            const response = await apiClient.put(`/vehicles/change-status/${vehicleData.id}?status=suspended`)

            if (response.status === 200) {
                setShowClientCarInformation(false);
                setShowClientInformation(false);
                toast.success('Vehículo suspendido', {
                    position: toast.POSITION.TOP_RIGHT
                });

            } else {
                toast.error('Ha ocurrido un error al suspender el vehículo.', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }

        } catch (error) {
            toast.error('Error al suspender al vehículo. Por favor, inténtalo de nuevo..', {
                position: toast.POSITION.TOP_RIGHT
            });

            let mensajesError = [];
            if (error.response && error.response.data && error.response.data.errors && error.response.data.errors.length > 0) {
                mensajesError = error.response.data.errors.map(err => err.message);
            }

            const mensajeFinal = mensajesError.join(" / ");

            toast.error(mensajeFinal || "Hubo un error desconocido", {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    const handleGoBackToButtons = () => {
        setShowAddVehicle(false);
        setShowClientCarInformation(false);
        setShowClientInformation(false);
        setShowTitle(false);
        resetForm();
    };

    const handleGoBackFromAddVehicle = () => {
        const isTabletPortrait = window.matchMedia("(max-width: 1024px) and (orientation: portrait)").matches;

        if (isTabletPortrait) {
            setShowAddVehicle(false);
            setShowClientCarInformation(true);
            setShowClientInformation(false);
            setShowTitle(true);
            resetForm();
        } else {
            handleGoBackToButtons();
        }
    };

    const handleGoBack = () => {
        setShowClientCarInformation(true);
        setSelectedVehicle(false);
        setShowClientInformation(false);
        setShowAddVehicle(false);
    };

    useEffect(() => {
        if (isFirstFilterRun.current) {
            isFirstFilterRun.current = false;
            return;
        }
        setPage(1);
        setHasMore(true);
        if (clientListScrollRef.current) {
            clientListScrollRef.current.scrollTop = 0;
        }
    }, [searchTerm, selectedOption, refreshClients, clientSuspended]);

    useEffect(() => {

        const controller = new AbortController();

        const fetchData = async () => {
            if (isFetching && page !== 1) return;

            if (page === 1) setLoading(true);
            setIsFetching(true);

            let endpoint = `/clients/list/${page}/${PAGE_SIZE}`;

            if (searchTerm) {
                switch (selectedOption) {
                    case 'Cédula':
                        endpoint = `/clients/search/cedula/${searchTerm}/${page}/${PAGE_SIZE}`;
                        break;
                    case 'Nombre':
                        endpoint = `/clients/search/name/${searchTerm}/${page}/${PAGE_SIZE}`;
                        break;
                    default:
                        break;
                }
            }
            try {
                const response = await apiClient.get(endpoint, {
                    signal: controller.signal
                });
                console.log("clients data", response.data)

                if (!controller.signal.aborted) {
                    const rawData = response.data.values || [];
                    const totalPages = parseInt(response.data.total_pages) || 0;

                    setHasMore(page < totalPages && rawData.length > 0);
                    setClients(prev => (page === 1 ? rawData : [...prev, ...rawData]));
                }

            } catch (error) {
                if (error.name === 'AbortError' || error.name === 'CanceledError') {
                    return;
                }
                console.error('Error al cargar la información:', error.message);
                if (page === 1) setClients([]);
                setHasMore(false);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                    setIsFetching(false);
                }
            }
        };
        fetchData();
        return () => controller.abort();
    }, [page, searchTerm, selectedOption, refreshClients, clientSuspended]);

    const lastClientElementRef = useCallback(node => {
        if (loading || isFetching) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, isFetching, hasMore]);

    useEffect(() => {
        if (selectedClient) {
            setCedula(selectedClient.client.cedula);
            setName(selectedClient.client.name);
            setAddress(selectedClient.client.address);
            setEmail(selectedClient.client.email);
            setPhone(selectedClient.client.phone);
        }
    }, [selectedClient]);

    const options = [
        { value: 'car', label: 'Auto' },
        { value: 'suv', label: 'SUV' },
        { value: 'pickup_truck', label: 'Camioneta' },
        { value: 'van', label: 'Buseta' },
        { value: 'truck', label: 'Camión' },
    ];

    const resetClientState = () => {
        setShowClientCarInformation(false);
   
    };

  
    const isAddClientButtonHidden = showClientCarInformation || showClientInformation || showAddVehicle || selectedVehicle;
    const clientListScrollRef = useScrollRestoration('clients:list', !loading && !isAddClientButtonHidden);

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            className: 'custom-select-control',
            width: '100%', 
            height: '44px', 
            border: '1px solid rgb(0 0 0 / 34%)', 
            borderRadius: '4px', 
            padding: '8px',
            marginBottom: '20px',
            marginTop: '8px',
            boxSizing: 'border-box'
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: '#999', 
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-select-option',
        }),
        menu: (provided, state) => ({
            ...provided,
            width: '100%', 
            marginTop: '-17px'
        }),

    };

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu resetFunction={resetClientState} />

            <div className={`containerClients ${isAddClientButtonHidden ? "hide-list-mobile compact-header-mobile" : ""}`}>
                <div className="left-section">
                    <TitleAndSearchBox
                        selectedOption={selectedOption}
                        title="Clientes"
                        onSearchChange={handleSearchWithDebounce}
                        onButtonClick={openFilterModal}
                        wrapperClassName="title-search-wrapper"
                    />

                    {loading && page === 1 ? (
                        <div className="loader-container" style={{ marginLeft: '-93px' }}>
                            <PuffLoader color="#316EA8" loading={loading} size={60} />
                        </div>
                    ) : (
                        <>
                            <div className="container-list-client" ref={clientListScrollRef}>
                                {clients.map((clientData, index) => {
                                    const isLast = clients.length === index + 1;
                                    return (
                                    <div className="result-client" onClick={(event) => handleClientCarInformation(clientData.client.id, event)} key={`${clientData.client.id}-${index}`} ref={isLast ? lastClientElementRef : null}>
                                        <div className="first-result">
                                            <img src={clientIcon} alt="Client Icon" className="icon-client" />
                                            <div className="container-data">
                                                <label className="name-client">{clientData.client.name}</label>

                                                <div className="vehicle-count-container">

                                                    {
                                                        (!clientData.vehicles_count ||
                                                            Object.values(clientData.vehicles_count).every(val => val === 0)
                                                        ) ? (
                                                            <div className="no-vehicles">
                                                                Sin vehículos
                                                            </div>
                                                        ) : (
                                                            <>

                                                                {clientData.vehicles_count.car > 0 && (
                                                                    <div className="container-car-number">
                                                                        <label className="car-number">{clientData.vehicles_count.car}</label>
                                                                        <img src={autoIcon} alt="Car client" className="icon-car" />
                                                                    </div>
                                                                )}

                                                                {clientData.vehicles_count.suv > 0 && (
                                                                    <div className="container-car-number">
                                                                        <label className="car-number">{clientData.vehicles_count.suv}</label>
                                                                        <img src={suvIcon} alt="Suv client" className="icon-car" />
                                                                    </div>
                                                                )}

                                                                {clientData.vehicles_count.pickup_truck > 0 && (
                                                                    <div className="container-car-number">
                                                                        <label className="car-number"> {clientData.vehicles_count.pickup_truck}
                                                                        </label>
                                                                        <div className="van-container">
                                                                            <img src={camionetaIcon} alt="Van client" className="icon-van"></img>
                                                                        </div>

                                                                    </div>
                                                                )}

                                                                {clientData.vehicles_count.van > 0 && (
                                                                    <div className="container-car-number">
                                                                        <label className="car-number"> {clientData.vehicles_count.van}
                                                                        </label>
                                                                        <img src={busetaIcon} alt="Bus client" className="icon-bus"></img>
                                                                    </div>

                                                                )}

                                                                {clientData.vehicles_count.truck > 0 && (
                                                                    <div className="container-car-number">
                                                                        <label className="car-number"> {clientData.vehicles_count.truck}
                                                                        </label>
                                                                        <img src={camionIcon} alt="Truck client" className="icon-car"></img>
                                                                    </div>

                                                                )}
                                                            </>

                                                        )
                                                    }

                                                </div>



                                            </div>
                                        </div>

                                        <div className="second-result">
                                            <button className="button-eye" onClick={(event) => handleClientInformation(clientData.client.id, event)}>
                                                <img src={eyeIcon} alt="Eye Icon" className="icon-eye" />
                                            </button>
                                        </div>

                                    </div>
                                    );
                                })}

                                {isFetching && page > 1 && (
                                    <div className="infinite-scroll-loader">
                                        <PuffLoader color="#316EA8" size={40} />
                                    </div>
                                )}
                            </div>
                        </>
                    )
                    }


                </div>

                <div className="right-section">

                    {!selectedVehicle && showTitle && !showAddVehicle && (
                        <CustomTitleSection
                            title="Vehículos"
                            onBack={handleGoBackToButtons}
                            showAddIcon={true}
                            onAdd={handleShowAddVehicle}
                        />
                    )}

            
                    {!showClientCarInformation && !showClientInformation && !showAddVehicle && (
                        <CustomButtonContainer>
                            <CustomButton title="AGREGAR CLIENTE" onClick={handleAddClient} />
                        </CustomButtonContainer>
                    )}


                    {!selectedVehicle && showClientCarInformation && !showClientInformation && !showAddVehicle && (

                        <div className="vehicle-info">
                            {clientVehicles.map(vehicle => (
                                <div key={vehicle.id} className="vehicle" onClick={(event) => handleCarInformation(vehicle, event)}>
                                    <div className="vehicle-content">
                                        {vehicle.category === "car" && (
                                            <img src={autoIcon} alt="Auto Icon" className="auto-icon" />
                                        )}
                                         {vehicle.category === "suv" && (
                                            <img src={suvIcon} alt="Auto Icon" className="auto-icon" />
                                        )}
                                        {vehicle.category === "van" && (
                                            <img src={camionetaIcon} alt="Camioneta Icon" className="camioneta-icon" />
                                        )}
                                        {vehicle.category === "pickup_truck" && (
                                            <img src={busetaIcon} alt="Buseta Icon" className="buseta-icon" />
                                        )}
                                        {vehicle.category === "truck" && (
                                            <img src={camionIcon} alt="Camion Icon" className="camion-icon" />
                                        )}
                                        <label className="vehicle-plate"> {formatPlate(vehicle.plate)}</label>
                                    </div>
                                </div>
                            ))}
                        </div>

                    )}

                
                    <ToastContainer />
                    {showClientInformation && !showClientCarInformation && !showAddVehicle && (
                        <>
                            <CustomTitleSection
                                title="Información del cliente"
                                onBack={handleGoBackToButtons}
                                showDisableIcon={true}
                                onDisable={openAlertModalClientSuspend}
                                showEditIcon={true}
                                onEdit={() => setIsEditMode(true)}

                            />

                            <div className="container-data-client-form">
                                <form>
                                    <label className="label-form">
                                        Cédula
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                type="text"
                                                value={cedula}
                                                onChange={(e) => setCedula(e.target.value)}
                                                readOnly={!isEditMode}
                                            />

                                            <img
                                                src={cedulaIcon}
                                                alt="Id Icon"
                                                className="input-new-client-icon"
                                            />
                                        </div>
                                    </label>
                                    <label className="label-form">
                                        Nombre completo
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                readOnly={!isEditMode}
                                            />

                                            <img
                                                src={nameIcon}
                                                alt="Name Icon"
                                                className="input-new-client-icon"
                                            />
                                        </div>
                                    </label>
                                    <label className="label-form">
                                        Dirección
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                type="text"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                readOnly={!isEditMode}
                                            />

                                            <img
                                                src={addressIcon}
                                                alt="Address Icon"
                                                className="input-new-client-icon"
                                            />

                                        </div>
                                    </label>
                                    <label className="label-form">
                                        Email
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                type="text"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                readOnly={!isEditMode}
                                            />

                                            <img
                                                src={emailIcon}
                                                alt="Email Icon"
                                                className="input-new-client-icon"
                                            />
                                        </div>
                                    </label>
                                    <label className="label-form">
                                        Teléfono
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                type="text"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                readOnly={!isEditMode}
                                            />

                                            <img
                                                src={phoneIcon}
                                                alt="Phone Icon"
                                                className="input-new-client-icon"
                                            />
                                        </div>
                                    </label>

                                    {isEditMode &&

                                        <div className="container-button-edit-product">
                                            <button className="button-edit-data-client" onClick={handleEditClient}>
                                                GUARDAR
                                            </button>
                                        </div>
                                    }
                                    <ToastContainer />


                                </form>
                            </div>

                        </>
                    )}



                    {selectedVehicle && (
                        <CustomTitleSection
                            title={selectedClientData?.client?.name}
                            onBack={handleGoBack}
                            showDisableIcon={true}
                            onDisable={openAlertModalVehicleSuspend}
                        />
                    )}

                    {selectedVehicle && (
                        <div className="container-add-car-form">
                            <div className="form-scroll">
                                <form>
                                    <div className={`input-container ${isInputFocused ? "active" : ""}`}>
                                        <input
                                            className="input-plate"
                                            type="text"
                                            value={vehicleData ? vehicleData.plate : ""}
                                            onFocus={handleInputFocus}
                                            onBlur={handleInputBlur}
                                            readOnly />
                                        <img src={flagIcon} alt="Flag" className="flag-icon" />
                                        <label className="label-flag">ECUADOR</label>
                                        {/*<button className="button-alert" type="button" onClick={handleAlertClick}>
                                            <img src={alertIcon} className="alert" alt="Alert" />
                                            </button>*/}
                                    </div>

                                    <label className="label-form">
                                        Año
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                type="text"
                                                value={vehicleData ? vehicleData.year : ""}
                                                readOnly
                                            />

                                            <img
                                                src={yearIcon}
                                                alt="Year Icon"
                                                className="input-new-client-icon"
                                            />
                                        </div>
                                    </label>
                                    <label className="label-form">
                                        Categoría
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                type="text"
                                                value={vehicleData ? getVehicleCategory(vehicleData.category) : ""}
                                                readOnly
                                            />
                                            <img
                                                src={categoryIcon}
                                                alt="Category Icon"
                                                className="input-new-client-icon"
                                            />
                                        </div>
                                    </label>
                                    <label className="label-form">
                                        Kilometraje actual
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                value={vehicleData ? vehicleData.km : ""}
                                                readOnly
                                            />
                                            <img
                                                src={kmIcon}
                                                alt="Km Icon"
                                                className="input-new-client-icon"
                                                style={{ width: '30px' }}
                                            />
                                        </div>
                                    </label>
                                    <label className="label-form">
                                        Marca
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                type="text"
                                                value={vehicleData ? vehicleData.brand : ""}
                                                readOnly
                                            />
                                            <img
                                                src={brandIcon}
                                                alt="Brand Icon"
                                                className="input-new-client-icon"
                                            />
                                        </div>
                                    </label>
                                    <label className="label-form">
                                        Modelo
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                type="text"
                                                value={vehicleData ? vehicleData.model : ""}
                                                readOnly
                                            />
                                            <img
                                                src={modelIcon}
                                                alt="Model Icon"
                                                className="input-new-client-icon"
                                                style={{ top: '35%' }}
                                            />
                                        </div>

                                    </label>
                                    <label className="label-form">
                                        Motor
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form-detail"
                                                type="text"
                                                value={vehicleData ? vehicleData.motor : ""}
                                                readOnly
                                            />
                                            <img
                                                src={motorIcon}
                                                alt="Motor Icon"
                                                className="input-new-client-icon"
                                            />
                                        </div>

                                    </label>
                                </form>
                            </div>
                        </div>
                    )}

                    {showAddVehicle && (
                        <CustomTitleSection
                            title="Agregar vehículo"
                            onBack={handleGoBackFromAddVehicle}
                        />
                    )}

                    <ToastContainer />

                    {showAddVehicle && (
                        <div className="container-add-car-form">
                            <div className="form-scroll">
                                <form>
                                    <div className={`input-container ${isInputFocused ? "active" : ""}`}>
                                        <input className="input-plate" type="text" value={plateCar} onChange={handleCarPlateChange}
                                            onFocus={handleInputFocus} onBlur={handleInputBlur}
                                            autoComplete="off" autoCorrect="off" autoCapitalize="characters" spellCheck="false" />
                                        <img src={flagIcon} alt="Flag" className="flag-icon" />
                                        <label className="label-new-plate-vehicle">ECUADOR</label>
                                        {/*<button className="button-alert" type="button" onClick={handleAlertClick}>
                                            <img src={alertIcon} className="alert" alt="Alert" />
                                        </button>
                                        */}
                                    </div>

                                    <label className="label-form">
                                        Año
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form"
                                                type="number"
                                                value={year}
                                                onChange={(e) => setYear(parseInt(e.target.value))}
                                            />

                                            <img
                                                src={yearIcon}
                                                alt="Year Icon"
                                                className="input-new-client-icon"
                                            />

                                        </div>

                                    </label>
                                    <label className="label-form">
                                        Categoría
                                        <Select
                                            components={{ Placeholder: CustomPlaceholder }}
                                            isSearchable={false}
                                            options={options}
                                            value={options.find(option => option.value === category)}
                                            onChange={handleTypeCarChange}
                                            styles={customStyles}
                                            placeholder="Seleccionar" />
                                    </label>
                                    <label className="label-form">
                                        Kilometraje actual
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form"
                                                type="number"
                                                value={km}
                                                onChange={(e) => setKm(parseInt(e.target.value))}
                                            />
                                            <img
                                                src={kmIcon}
                                                alt="Km Icon"
                                                className="input-new-client-icon"
                                                style={{ width: '30px' }}
                                            />
                                        </div>
                                    </label>
                                    <label className="label-form">
                                        Marca
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form"
                                                type="text"
                                                value={brand}
                                                onChange={(e) => setBrand(e.target.value)}
                                            />
                                            <img
                                                src={brandIcon}
                                                alt="Brand Icon"
                                                className="input-new-client-icon"
                                            />
                                        </div>
                                    </label>
                                    <label className="label-form">
                                        Modelo
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form"
                                                type="text"
                                                value={model} onChange={(e) => setModel(e.target.value)}
                                            />
                                            <img
                                                src={modelIcon}
                                                alt="Model Icon"
                                                className="input-new-client-icon"
                                                style={{ top: '35%' }}
                                            />

                                        </div>

                                    </label>
                                    <label className="label-form">
                                        Motor
                                        <div className="input-form-new-client">
                                            <input
                                                className="input-form"
                                                type="text"
                                                value={motor}
                                                onChange={(e) => setMotor(e.target.value)}
                                            />
                                            <img
                                                src={motorIcon}
                                                alt="Motor Icon"
                                                className="input-new-client-icon"
                                            />

                                        </div>

                                    </label>
                                </form>
                            </div>
                        </div>
                    )}
                    {showAddVehicle && (
                        <div className="container-button-next">
                            <button className="button-next" onClick={handleAddVehicle}>
                                GUARDAR
                            </button>
                        </div>
                    )}

                    {/*Modal para alertas */}

                    {/* 

                    {isAlertModalOpen && (
                        <div className="filter-modal-overlay">
                            <div className="filter-modal">
                                <h3>Alertas</h3>
                                <div className="button-options">
                                    <div className="half">
                                        <button className="optionNo-button" onClick={closeAlertModal}>
                                            No
                                        </button>
                                    </div>
                                    <div className="half">
                                        <button className="optionYes-button" onClick={closeAlertModal}>
                                            Si
                                        </button>

                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                    */}

                </div>
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

            {isAlertClientSuspend && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal">
                        <h3 style={{ textAlign: "center" }}>¿Está seguro de suspender al cliente?</h3>
                        <div className="button-options">
                            <div className="half">
                                <button className="optionNo-button" onClick={closeAlerModalClientSuspend}>
                                    No
                                </button>
                            </div>
                            <div className="half">
                                <button className="optionYes-button" onClick={handleUnavailableClient}>
                                    Si
                                </button>

                            </div>
                        </div>

                    </div>
                </div>

            )}

            {isAlertVehicleSuspend && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal">
                        <h3 style={{ textAlign: "center" }}>¿Está seguro de suspender el vehículo?</h3>
                        <div className="button-options">
                            <div className="half">
                                <button className="optionNo-button" onClick={closeAlerModalVehicleSuspend}>
                                    No
                                </button>
                            </div>
                            <div className="half">
                                <button className="optionYes-button" onClick={handleUnavailableVehicle}>
                                    Si
                                </button>

                            </div>
                        </div>

                    </div>
                </div>

            )}



        </div>
    );
};

export default Clients;
