import "../Modal.css";
import "../NewClient.css";

import React, { useState } from "react";
import apiClient from "../services/apiClient";
import { showToastOnce } from "../utils/toastUtils";
import Icon from "../components/Icons";


const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";

export const AddNewClientModal = ({ isOpen, onClose, OnUpdate }) => {

    const [cedula, setCedula] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const handleSaveClick = async (event) => {

        event.preventDefault();

        try {
            await apiClient.post('/clients/register', { cedula, name, address, phone, email });

            showToastOnce("success", "Cliente registrad");

            OnUpdate();

        } catch (error) {

            if (error.response && error.response.status === 400 && error.response.data.errors) {

                error.response.data.errors.forEach(err => {
                    showToastOnce("error", `${err.field}: ${err.message} `);
                });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="filter-modal-overlay">

            <div className="filter-modal">
                <div style={{ display: 'flex' }}>
                    <h3 style={{ flex: '13', textAlign: 'center' }}>Información Cliente</h3>
                    <div style={{ flex: "1", marginTop: '13px' }}>
                        <button className="button-close-modal" onClick={onClose}  >
                            <Icon name="close" className="close-icon-modal"/>
                        </button>
                    </div>
                </div>

                <div className="form-container-modal">
                    <form className="new-client-form">
                        <div className="form-group">
                            <label className="form-label">Cédula</label>
                            <div className="form-input-wrapper">
                                <Icon name="id" className="form-icon"/>
                                <input
                                    className="input-control"
                                    type="text"
                                    value={cedula}
                                    onChange={(e) => setCedula(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nombre completo</label>
                            <div className="form-input-wrapper">
                                 <Icon name="text" className="form-icon"/>
                                <input
                                    className="input-control"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Dirección</label>
                            <div className="form-input-wrapper">
                                <Icon name="address" className="form-icon"/>
                                <input
                                    className="input-control"
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Correo Electrónico</label>
                            <div className="form-input-wrapper">
                                 <Icon name="email" className="form-icon"/>
                                <input
                                    className="input-control"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Teléfono</label>
                            <div className="form-input-wrapper">
                                <Icon name="phone" className="form-icon"/>
                                <input
                                    className="input-control"
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
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

