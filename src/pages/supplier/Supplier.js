import "../../Supplier.css";
import "../../Loader.css";
import React, { useState, useEffect } from "react";
import { debounce } from 'lodash';
import PuffLoader from "react-spinners/PuffLoader";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import Modal from "../../modal/Modal";
import apiClient from "../../services/apiClient";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import { CustomButtonContainer, CustomButton } from "../../buttons/customButton/CustomButton";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import useCSSVar from "../../hooks/UseCSSVar";
import { showToastOnce } from "../../utils/toastUtils";
import ScrollListWithIndicators from "../../components/ScrollListWithIndicators";
import ResultItem from "../../resultItem/ResultItem";
import SectionTitle from "../../components/SectionTitle";
import { ButtonCard } from "../../buttons/buttonCards/ButtonCard";
import SupplierForm from "./SupplierForm";
import CustomModal from "../../modal/customModal/CustomModal";
import { supplierSearch } from "../../constants/filterOptions";

const eyeIcon = process.env.PUBLIC_URL + "/images/icons/eyeIcon.png";

const Suppliers = () => {

    const tertiaryColor = useCSSVar('--tertiary-color');
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
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
                showToastOnce("success", "Proveedor suspendido");

            }

        } catch (error) {
            showToastOnce("error", "Error al suspender al proveedor. Por favor, inténtalo de nuevo.");
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveOrUpdateSupplier = async (event) => {

        event.preventDefault();

        if (mode === 'add') {
            try {
                const response = await apiClient.post('/suppliers/create', { name, phone, contact_details });
                setSuppliers(response.data);
                showToastOnce("success", "Proveedor registrado");
                setLastUpdated(Date.now());
                setShowAddSupplier(false);
                setShowButtonAddSupplier(true);

            } catch (error) {
                if (error.response && error.response.status === 400 && error.response.data.errors) {
                    error.response.data.errors.forEach(err => {
                        showToastOnce("error", `${err.field}: ${err.message}`);
                    });
                }
            }
        } else {
            try {
                const response = await apiClient.put(`/suppliers/update/${selectedSupplier.id}`, { name, phone, contact_details });
                setSuppliers(response.data);
                showToastOnce("success", "Proveedor actualizado");
                setLastUpdated(Date.now());
                setShowAddSupplier(false);
                setShowButtonAddSupplier(true);

            } catch (error) {
                showToastOnce("error", "Error al actualizar los datos del proveedor");
            }
        }
    };

    const handleInputChange = (field, value) => {
        setSelectedSupplier(prevSupplier => ({
            ...prevSupplier,
            [field]: value,
        }));
    };

    //Función que permite obtener todos los proveedores
    //registrados cuando inicia la pantalla y los busca
    //por nombre o código
    useEffect(() => {

        const fetchData = async () => {

            let endpoint = '/suppliers/all';
            const searchPerSupplierCode = "supplier_code";
            const searchPerName = "supplier_name";

            if (searchTerm && searchTerm.length > 0) {
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
                console.log("valor de busqueda", searchTerm)
                setSuppliers(response.data);
                setLoading(false);

            } catch (error) {
                if (error.code === 'ECONNABORTED') {
                    showToastOnce("error", "La solicitud ha superado el tiempo límite.");
                }
            }
        }
        fetchData();
    }, [searchTerm, selectedOption, lastUpdated]);


    return (
        <div>
            <Header showIconCartics={true} showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu resetFunction={resetSupplierState} />

            <div className="two-column-layout">
                <div className="left-panel">
                    {/*Título del contenedor con buscador */}
                    <TitleAndSearchBox
                        selectedOption={selectedOption}
                        title="Proveedores"// Convertir a mayúscula inicial
                        onSearchChange={handleSearchWithDebounce}
                        onButtonClick={openFilterModal}
                    />

                    {loading ? (
                        <div className="loader-container" style={{ marginLeft: '-93px' }}>
                            <PuffLoader color={tertiaryColor} loading={loading} size={60} />
                        </div>
                    ) : (
                        <ScrollListWithIndicators
                            items={suppliers}
                            renderItem={(supplierData) => (
                                <ResultItem
                                    key={supplierData.id}
                                    type="supplier"
                                    data={supplierData}
                                    onClickEye={(e) => handleSupplierInformation(supplierData.id, e)}
                                />
                            )}
                        />

                    )}

                </div>
                <div className="right-panel">

                    {showButtonAddSupplier && !showAddSupplier && (
                        <>
                            <SectionTitle title="Panel de Proveedores" />
                            <ButtonCard
                                icon="addSupplier"
                                title="Nuevo Proveedor"
                                description="Agrega un proveedor que abastece los productos de tu inventario"
                                onClick={handleShowAddSupplier}
                            />

                        </>
                    )}

                    {showAddSupplier && !showButtonAddSupplier && (
                        <SupplierForm
                            mode={mode}
                            isEditing={isEditing}
                            setIsEditing={setIsEditing}
                            name={name}
                            setName={setName}
                            phone={phone}
                            setPhone={setPhone}
                            detailContact={contact_details}
                            setDetailContact={setContactDetails}
                            onSubmit={handleSaveOrUpdateSupplier}
                            onBack={handleGoBackToButtons}
                            openAlertModalSupplierSuspend={openAlertModalSupplierSuspend}
                            onDisable={openAlertModalSupplierSuspend}
                        />
                    )}


                </div>

            </div>

            {/*Modal del filtro de búsqueda*/}

            {isFilterModalOpen && (
                <CustomModal
                    isOpen={isFilterModalOpen}
                    onCancel={closeFilterModal}
                    type="filter-options"
                    subTitle="Seleccione el filtro de búsqueda"
                    onSelect={handleSelectClick}
                    defaultOption={selectedOption}
                    options={supplierSearch}
                    showCloseButton={false}
                />
            )}

            {isAlertSupplierSuspended && (

                <CustomModal
                    isOpen={isAlertSupplierSuspended}
                    type="confirm-suspend"
                    subTitle="¿Está seguro de suspender al proveedor?"
                    description="Al suspender el proveedor, se ocultará temporalmente del sistema.
                    Podrá volver a activarlo desde Configuración en cualquier momento."
                    onCancel={closeAlertModalSupplierSuspend}
                    onConfirm={handleUnavailableSupplier}
                    showCloseButton={false}
                />
            )}

        </div>
    )

};

export default Suppliers;
