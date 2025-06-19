import "../../NewClient.css";
import "../../Modal.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useContext } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import Select from 'react-select';
import apiClient from "../../services/apiClient";
import ModalNewClient from "../../modal/ModalNewClient";
import { CustomPlaceholder } from "../../customPlaceholder/CustomPlaceholder";
import ClientContext from "../../contexts/ClientContext";
import useCSSVar from "../../hooks/UseCSSVar";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";

const alertIcon = process.env.PUBLIC_URL + "/images/icons/alertIcon.png";
const checkedIcon = process.env.PUBLIC_URL + "/images/icons/checkedIcon.png";
const canceledIcon = process.env.PUBLIC_URL + "/images/icons/canceledIcon.png";
const cedulaIcon = process.env.PUBLIC_URL + "/images/icons/cedula.png";
const nameIcon = process.env.PUBLIC_URL + "/images/icons/name.png";
const addressIcon = process.env.PUBLIC_URL + "/images/icons/address.png";
const emailIcon = process.env.PUBLIC_URL + "/images/icons/email.png";
const phoneIcon = process.env.PUBLIC_URL + "/images/icons/phone.png";
const yearIcon = process.env.PUBLIC_URL + "/images/icons/year.png";
const kmIcon = process.env.PUBLIC_URL + "/images/icons/km.png";
const brandIcon = process.env.PUBLIC_URL + "/images/icons/brand.png";
const modelIcon = process.env.PUBLIC_URL + "/images/icons/model.png";
const motorIcon = process.env.PUBLIC_URL + "/images/icons/engine.png";
const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";
const arrowLeftIcon = process.env.PUBLIC_URL + "/images/icons/arrowLeftIcon.png";

const ClientFormPanel = ({
    mode = "add",
    cedula, setCedula,
    name, setName,
    address, setAddress,
    email, setEmail,
    phone, setPhone,
    isEditMode, setIsEditMode,
    onSubmit,
    onBack,
    onDisable,
}) => {

    const grayMediumDark = useCSSVar('--gray-medium-dark');
    const blackAlpha34 = useCSSVar('--black-alpha-34');

    const isReadOnly = mode === "edit" && !isEditMode;

    const handleAlertClick = () => {
        openAlertModal();
    };

    const handleAddWorkOrder = () => {
        //navigate("/workOrders/newWorkOrder")
    };

    const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    const openWorkOrderModal = () => {
        setIsWorkOrderModalOpen(true);
    };

    const closeWorkOrderModal = () => {
        setIsWorkOrderModalOpen(false);
        //navigate("/clients")
    };

    const openAlertModal = () => {
        setIsAlertModalOpen(true);
    };

    const closeAlertModal = () => {
        setIsAlertModalOpen(false);
    };

    return (
        <>
            <div className="panel-header-fixed">
                <CustomTitleSection
                    onBack={() => {
                        if (mode === "edit" && typeof setIsEditMode === "function") {
                            setIsEditMode(false);
                        }
                        onBack?.();
                    }}
                    titlePrefix="Panel Clientes"
                    title={mode === "add" ? "Nuevo Cliente" : "Información del cliente"}
                    onCustomButtonClick={(mode === "add" || (mode === "edit" && isEditMode)) ? onSubmit : undefined}
                    customButtonLabel={(mode === "add" || (mode === "edit" && isEditMode)) ? "GUARDAR" : undefined}
                    showCustomButton={(mode === "add" || (mode === "edit" && isEditMode))}
                    showDisableIcon={mode === "edit"}
                    onDisable={mode === "edit" ? onDisable : undefined}
                    showEditIcon={mode === "edit" && !isEditMode}
                    onEdit={mode === "edit" ? () => setIsEditMode(true) : undefined}
                />

            </div>

            <div className="panel-content-form">
                <div className="panel-scroll-container" style={{marginTop: '2rem'}}>

                    <label className="label-form">
                        Cédula
                        <div className="input-form-new">
                            <input
                                className="input-form-add"
                                type="text"
                                value={cedula}
                                onChange={(e) => setCedula(e.target.value)}
                                readOnly={isReadOnly}
                            />
                            <img src={cedulaIcon} alt="Id Icon" className="icon-new-value" />
                        </div>
                    </label>

                    <label className="label-form">
                        Nombre
                        <div className="input-form-new">
                            <input
                                className="input-form-add"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                readOnly={isReadOnly}
                            />
                            <img src={nameIcon} alt="Name Icon" className="icon-new-value" />
                        </div>
                    </label>


                    <label className="label-form">
                        Dirección
                        <div className="input-form-new">
                            <input
                                className="input-form-add"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                readOnly={isReadOnly}
                            />
                            <img src={addressIcon} alt="Addres Icon" className="icon-new-value" />
                        </div>
                    </label>


                    <label className="label-form">
                        Correo Electrónico
                        <div className="input-form-new">
                            <input
                                className="input-form-add"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                readOnly={isReadOnly}
                            />
                            <img src={emailIcon} alt="Email Icon" className="icon-new-value" />
                        </div>
                    </label>

                    <label className="label-form">
                        Teléfono
                        <div className="input-form-new">
                            <input
                                className="input-form-add"
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                readOnly={isReadOnly}
                            />
                            <img src={phoneIcon} alt="Phone Icon" className="icon-new-value" />
                        </div>
                    </label>

                </div>

            </div>

        </>
    );
};

export default ClientFormPanel;
