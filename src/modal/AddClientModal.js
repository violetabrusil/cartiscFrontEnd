import "../Modal.css";
import "../NewClient.css";
import 'react-datepicker/dist/react-datepicker.css';

import React, { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import apiClient from "../services/apiClient";


const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const cedulaIcon = process.env.PUBLIC_URL + "/images/icons/cedula.png";
const nameIcon = process.env.PUBLIC_URL + "/images/icons/name.png";
const addressIcon = process.env.PUBLIC_URL + "/images/icons/address.png";
const emailIcon = process.env.PUBLIC_URL + "/images/icons/email.png";
const phoneIcon = process.env.PUBLIC_URL + "/images/icons/phone.png";

export const AddNewClientModal = ({ isOpen, onClose, OnUpdate }) => {

    const [cedula, setCedula] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const handleSaveClick = async (event) => {
        // Para evitar que el formulario recargue la página
        event.preventDefault();

        try {
            await apiClient.post('/clients/register', { cedula, name, address, phone, email });

            toast.success('Cliente registrado', {
                position: toast.POSITION.TOP_RIGHT
            });

            OnUpdate()


        } catch (error) {
            console.log("error registro cliente", error)

            if (error.response && error.response.status === 400 && error.response.data.errors) {
                // Muestra los errores en toasts
                error.response.data.errors.forEach(err => {
                    toast.error(`${err.field}: ${err.message}`, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="filter-modal-overlay">
            <ToastContainer />
            <div className="filter-modal">
                <div style={{ display: 'flex' }}>
                    <h3 style={{ flex: '13', textAlign: 'center' }}>Información Cliente</h3>
                    <div style={{ flex: "1", marginTop: '13px' }}>
                        <button className="button-close" onClick={onClose}  >
                            <img src={closeIcon} alt="Close Icon" className="close-icon"></img>
                        </button>
                    </div>
                </div>

                <div className="containerNewClient-form">
                    <form>
                        <label className="label-form">
                            Cédula
                            <div className="input-form-new-client">
                                <input
                                    className="input-form"
                                    type="text"
                                    value={cedula}
                                    onChange={(e) => setCedula(e.target.value)}
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
                                    className="input-form"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
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
                                    className="input-form"
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
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
                                    className="input-form"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    className="input-form"
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />

                                <img
                                    src={phoneIcon}
                                    alt="Phone Icon"
                                    className="input-new-client-icon"
                                />
                            </div>

                        </label>


                    </form>
                </div>

                <div className="container-button-next">
                    <button className="button-next" onClick={handleSaveClick}>
                        GUARDAR
                    </button>
                </div>
            </div>

        </div>
    );
};

