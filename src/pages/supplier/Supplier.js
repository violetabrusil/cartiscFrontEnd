import "../../Supplier.css";
import "../../Loader.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify'
import { debounce } from 'lodash';
import PuffLoader from "react-spinners/PuffLoader";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import Modal from "../../modal/Modal";
import apiClient from "../../services/apiClient";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import { CustomButtonContainer, CustomButton } from "../../customButton/CustomButton";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";

const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";

const Suppliers = () => {

    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState('Nombre');
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [mode, setMode] = useState('add');
    const [isEditing, setIsEditing] = useState(true);
    const [supplierSuspended, setSupplierSuspended] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isAlertSupplierSuspended, setIsAlertSupplierSuspended] = useState(false);
    const [showButtonAddSupplier, setShowButtonAddSupplier] = useState(true);
    const [showAddSupplier, setShowAddSupplier] = useState(false);
    const [showSupplierInformation, setShowSupplierInformation] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [contact_details, setContactDetails] = useState('');

    // Función para restablecer el formulario
    const resetForm = () => {
        setName("");
        setPhone("");
        setContactDetails("");
    };

    const resetSupplierState = () => {
        setShowSupplierInformation(false);
        setShowButtonAddSupplier(true);
        // resetea otros estados...
    };

    const handleSearchSupplierChange = (term, filter) => {
        setSearchTerm(term);
        setSelectedOption(filter);
    };

    const handleSearchWithDebounce = debounce(handleSearchSupplierChange, 500);

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
        // Cerrar el modal después de seleccionar.
        closeFilterModal();
    };

    const handleShowAddSupplier = (event) => {
        event.stopPropagation();
        setSelectedSupplier(null);
        setMode('add');
        setShowAddSupplier(true);
        setShowButtonAddSupplier(false);
    };

    const handleSupplierInformation = (supplierId, event) => {
        event.stopPropagation();
        const supplier = suppliers.find(supplier => supplier.id === supplierId);
        setSelectedSupplier(supplier);
        setName(supplier.name);
        setPhone(supplier.phone);
        setContactDetails(supplier.contact_details);
        setMode('edit');
        setShowSupplierInformation(true);
        setShowAddSupplier(true);
        setShowButtonAddSupplier(false);
        setIsEditing(false);
    };

    const handleGoBackToButtons = () => {
        setShowButtonAddSupplier(true);
        setShowAddSupplier(false);
        resetForm();
    };

    const openAlertModalSupplierSuspend = () => {
        setIsAlertSupplierSuspended(true);
    };

    const closeAlertModalSupplierSuspend = () => {
        setIsAlertSupplierSuspended(false);
    };

    //Función para suspender un proveedor
    const handleUnavailableSupplier = async (event) => {
        //Para evitar que el formulario recargue la página
        event.preventDefault();
        setIsAlertSupplierSuspended(false);
        const suspend = "suspended";
        try {

            const response = await apiClient.put(`/suppliers/change-status/${selectedSupplier.id}?supplier_status=${suspend}`)

            if (response.status === 200) {
                setSupplierSuspended(prevState => !prevState);
                const updatedSuppliers = suppliers.filter(supplier => supplier.id !== selectedSupplier.id);
                setSuppliers(updatedSuppliers);
                setShowAddSupplier(false);
                setShowButtonAddSupplier(true);
                toast.success('Proveedor suspendido', {
                    position: toast.POSITION.TOP_RIGHT
                });

            } else {
                toast.error('Ha ocurrido un error al suspender al proveedor.', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }

        } catch (error) {
            toast.error('Error al suspender al proveedor. Por favor, inténtalo de nuevo..', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveOrUpdateSupplier = async (event) => {
        // Para evitar que el formulario recargue la página
        event.preventDefault();

        if (mode === 'add') {
            try {
                const response = await apiClient.post('/suppliers/create', { name, phone, contact_details });
                setSuppliers(response.data);
                toast.success('Proveedor registrado', {
                    position: toast.POSITION.TOP_RIGHT
                });
                setLastUpdated(Date.now());
                setShowAddSupplier(false);
                setShowButtonAddSupplier(true);

            } catch (error) {
                if (error.response && error.response.status === 400 && error.response.data.errors) {
                    // Muestra los errores en toasts
                    error.response.data.errors.forEach(err => {
                        toast.error(`${err.field}: ${err.message}`, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    });
                }
            }
        } else {
            try {
                const response = await apiClient.put(`/suppliers/update/${selectedSupplier.id}`, { name, phone, contact_details });
                setSuppliers(response.data);
                toast.success('Proveedor actualizado', {
                    position: toast.POSITION.TOP_RIGHT
                });
                setLastUpdated(Date.now());
                setShowAddSupplier(false);
                setShowButtonAddSupplier(true);

            } catch (error) {
                toast.error('Error al actualizar el proveedor', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        }



    };

    const handleInputChange = (field, value) => {
        setSelectedSupplier(prevSupplier => ({
            ...prevSupplier,
            [field]: value,
        }));
    };


    useEffect(() => {
        //Función que permite obtener todos los proveedores
        //registrados cuando inicia la pantalla y los busca
        //por nombre o código

        const fetchData = async () => {

            //Endpoint por defecto
            let endpoint = '/suppliers/all';
            const searchPerSupplierCode = "supplier_code";
            const searchPerName = "name";
            //Si hay un filtro de búsqueda

            if (searchTerm) {
                switch (selectedOption) {
                    case 'Código':
                        endpoint = `/suppliers/search?search_type=${searchPerSupplierCode}&criteria=${searchTerm}`;
                        break;
                    case 'Nombre':
                        endpoint = `/suppliers/search?search_type=${searchPerName}&criteria=${searchTerm}`;
                        break;
                    default:
                        break;
                }
            }
            try {
                const response = await apiClient.get(endpoint);
                setSuppliers(response.data);
                setLoading(false);

            } catch (error) {
                if (error.code === 'ECONNABORTED') {
                    console.error('La solicitud ha superado el tiempo límite.');
                } else {
                    console.error('Otro error ocurrió:', error.message);
                }
            }
        }
        fetchData();
    }, [searchTerm, selectedOption, lastUpdated]);


    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu resetFunction={resetSupplierState} />

            <div className="container-suppliers">
                <div className="left-section-supplier">
                    {/*Título del contenedor con buscador */}
                    <TitleAndSearchBox
                        selectedOption={selectedOption}
                        title="Proveedores"// Convertir a mayúscula inicial
                        onSearchChange={handleSearchWithDebounce}
                        onButtonClick={openFilterModal}
                    />

                    {loading ? (
                        <div className="loader-container" style={{ marginLeft: '-93px' }}>
                            <PuffLoader color="#316EA8" loading={loading} size={60} />
                        </div>
                    ) : (
                        <>
                            <div className="search-results-suppliers">
                                {Array.isArray(suppliers) && suppliers.map(supplierData => (
                                    <div key={`suppliers-${supplierData.id}`} className="result-suppliers">
                                        <div className="supplier-code-section">
                                            <label className="supplier-code">{supplierData.supplier_code}</label>
                                        </div>

                                        <div className="supplier-name-section">
                                            <label className="supplier-name">{supplierData.name}</label>
                                        </div>

                                        <div className="supplier-eye-section">
                                            <button className="button-eye-supplier" onClick={(event) => handleSupplierInformation(supplierData.id, event)}>
                                                <img src={eyeIcon} alt="Eye Icon" className="icon-eye-operation" />
                                            </button>
                                        </div>

                                    </div>

                                ))}

                            </div>
                        </>
                    )}

                </div>
                <div className="right-section-supplier">
                    <ToastContainer />
                    {showButtonAddSupplier && !showAddSupplier && (
                        <CustomButtonContainer>
                            <CustomButton title="AGREGAR PROVEEDOR" onClick={handleShowAddSupplier} />
                        </CustomButtonContainer>
                    )}

                    {showAddSupplier && !showButtonAddSupplier && (
                        <div className="container-general-supplier">
                            <CustomTitleSection
                                onBack={handleGoBackToButtons}
                                title={mode === 'add' ? "Agregar Proveedor" : "Información del proveedor"}
                                showEditIcon={mode === 'edit' ? true : false}
                                onEdit={handleEditClick}
                                showDisableIcon={mode === 'edit' ? true : false}
                                onDisable={openAlertModalSupplierSuspend}
                            />

                            <div className="container-new-supplier">
                                <div className="row-supplier">
                                    <label>Nombre</label>
                                    <input
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="name-supplier"
                                        style={{ marginLeft: "140px" }}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="row-supplier">
                                    <label>Teléfono</label>
                                    <input
                                        type="number"
                                        className="phone-supplier"
                                        style={{ marginLeft: "136px" }}
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="row-supplier">
                                    <label style={{ marginBottom: "94px" }}>Detalle de contacto</label>
                                    <textarea
                                        className="text-area-supplier"
                                        style={{ marginLeft: "37px" }}
                                        value={contact_details}
                                        onChange={e => setContactDetails(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                            </div>

                            <div className="container-supplier-buttons">

                                <button
                                    className={`button-add-supplier ${isEditing ? "button-save-active" : ""}`}
                                    onClick={handleSaveOrUpdateSupplier}>
                                    <span className="text-button-supplier">Guardar</span>
                                </button>

                            </div>


                        </div>
                    )}


                </div>

            </div>

            {/*Modal del filtro de búsqueda*/}

            {isFilterModalOpen && (
                <Modal
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    options={['Código', 'Nombre']}
                    defaultOption="Nombre"
                    onOptionChange={handleOptionChange}
                    onSelect={handleSelectClick}
                />
            )}

            {isAlertSupplierSuspended && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal">
                        <h3 style={{ textAlign: "center" }}>¿Está seguro de suspender al proveedor?</h3>
                        <div className="button-options">
                            <div className="half">
                                <button className="optionNo-button" onClick={closeAlertModalSupplierSuspend}>
                                    No
                                </button>
                            </div>
                            <div className="half">
                                <button className="optionYes-button" onClick={handleUnavailableSupplier}>
                                    Si
                                </button>

                            </div>
                        </div>

                    </div>
                </div>

            )}


        </div>
    )



};

export default Suppliers;
