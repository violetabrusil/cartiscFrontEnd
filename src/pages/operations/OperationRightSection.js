import "../../Operation.css";
import "../../Service.css";
import "../../Modal.css";
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import apiClient from "../../services/apiClient";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";

const OperationRightSection = ({ localOperations, selectedOperation, onOperationChange, goBack }) => {

    const [title, setTitleOperation] = useState('');
    const [cost, setCostOperation] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isAlertOperationSuspend, setIsAlertOperationSuspend] = useState(false);

    const handleInputChange = (e) => {
        setCostOperation(e.target.value);
    };

    const handleAddNewOperation = async (event) => {
        event.preventDefault();

        try {
            const response = await apiClient.post('/operations/create', { title, cost });
            console.log("datos a guardar sin error",title, cost )
            if (response.data) {
                onOperationChange(response.data, "ADD");
            }
            toast.success('Operación registrada', {
                position: toast.POSITION.TOP_RIGHT
            });
        } catch (error) {

            // Extrae todos los mensajes de error del objeto de respuesta
            let mensajesError = [];
            if (error.response && error.response.data && error.response.data.errors && error.response.data.errors.length > 0) {
                mensajesError = error.response.data.errors.map(err => err.message);
            }

            // Une todos los mensajes en uno solo
            const mensajeFinal = mensajesError.join(" / ");

            console.log("datos a guardar",title, cost )
            console.log("error", error)

            toast.error(mensajeFinal || "Hubo un error al guardar la operación", {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    const handleUpdateOperation = async () => {
        try {
            const response = await apiClient.put(`/operations/update/${selectedOperation.id}`, { title, cost });
            if (response.data) {
                onOperationChange(response.data, "UPDATE");
            }
            // Notifica al componente padre para actualizar la lista de operaciones

            toast.success('Operación actualizada con éxito', {
                position: toast.POSITION.TOP_RIGHT
            });

        } catch (error) {
            toast.error('Error al actualizar la operación', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    const openAlertModalOperationSuspend = () => {
        setIsAlertOperationSuspend(true);
    };

    const closeAlertModalOperationSuspend = () => {
        setIsAlertOperationSuspend(false);
    };

    //Función para suspender una operación
    const handleUnavailableOperation = async (event) => {
        //Para evitar que el formulario recargue la página
        event.preventDefault();
        setIsAlertOperationSuspend(false);

        try {

            const response = await apiClient.put(`/operations/change-status/${selectedOperation.id}?status=suspended`)

            if (response.status === 200) {
                onOperationChange(selectedOperation, "SUSPEND");
                toast.success('Operación suspendida', {
                    position: toast.POSITION.TOP_RIGHT
                });
            } else {
                toast.error('Ha ocurrido un error al suspender la operación', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }

        } catch (error) {
            toast.error('Error al suspender la operación. Por favor, inténtalo de nuevo..', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    // Cuando selectedOperation cambie, actualizamos title y cost
    useEffect(() => {
        setTitleOperation(selectedOperation ? selectedOperation.title : '');
        setCostOperation(selectedOperation ? parseFloat(selectedOperation.cost).toFixed(2) : "0.00");
    }, [selectedOperation]);


    return (
        <div>
            <ToastContainer />

            {selectedOperation ? (
                <div className="container-general-operation">

                    <CustomTitleSection
                        onBack={goBack}
                        title="Información de la Operación"
                        showDisableIcon={true}
                        onDisable={openAlertModalOperationSuspend}
                        showEditIcon={true}
                        onEdit={() => setIsEditing(true)}
                    />

                    <div className="container-new-operation">
                        <div className="row-operation">
                            <label>Título</label>
                            <input
                                className="input-title-operation"
                                type="text"
                                value={title}
                                disabled={!isEditing}
                                onChange={(e) => setTitleOperation(e.target.value)}
                            />
                        </div>

                        <div className="row-operation">
                            <label>Costo</label>
                            <div className="input-container">
                                <span className="dollar-sign">$</span>
                                <input
                                    style={{ width: '277px' }}
                                    className="input-cost-operation"
                                    type="number"
                                    value={isEditing ? cost : parseFloat(cost).toFixed(2)}
                                    disabled={!isEditing}
                                    onChange={handleInputChange}
                                />

                            </div>

                        </div>
                    </div>
                    {isEditing && (
                        <div className="container-operation-buttons">
                            <button className="accept-button" onClick={handleUpdateOperation}>
                                <span className="text-button-operation">Guardar</span>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="container-general-operation">

                    <CustomTitleSection
                        onBack={goBack}
                        title="Agregar Operación"
                    />

                    <div className="container-new-operation">

                        <div className="row-operation">
                            <label>Título</label>
                            <input
                                className="input-title-operation"
                                type="text"
                                value={title}
                                onChange={(e) => setTitleOperation(e.target.value)}
                            />
                        </div>

                        <div className="row-operation">
                            <label>Costo</label>
                            <div className="input-container">
                                <span className="dollar-sign">$</span>
                                <input
                                    style={{ width: '277px' }}
                                    className="input-cost-operation"
                                    type="text"
                                    value={cost}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                    </div>
                    <div className="container-operation-buttons">
                        <button className="accept-button" style={{ marginRight: "10px" }} onClick={handleAddNewOperation}>
                            <span className="text-button-operation">Guardar</span>
                        </button>

                    </div>
                </div>

            )}

            {isAlertOperationSuspend && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal">
                        <h3 style={{ textAlign: "center" }}>¿Está seguro de suspender la operación?</h3>
                        <div className="button-options">
                            <div className="half">
                                <button className="optionNo-button" onClick={closeAlertModalOperationSuspend}>
                                    No
                                </button>
                            </div>
                            <div className="half">
                                <button className="optionYes-button" onClick={handleUnavailableOperation}  >
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

export default OperationRightSection;
