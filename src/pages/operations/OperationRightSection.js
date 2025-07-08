
import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import { showToastOnce } from "../../utils/toastUtils";
import CustomModal from "../../modal/customModal/CustomModal";

const OperationRightSection = ({ selectedOperation, onOperationChange, goBack }) => {

    const [title, setTitleOperation] = useState('');
    const [cost, setCostOperation] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isAlertOperationSuspend, setIsAlertOperationSuspend] = useState(false);

    const mode = selectedOperation ? "edit" : "add";

    useEffect(() => {
        if (selectedOperation) {
            setTitleOperation(selectedOperation.title || '');
            setCostOperation(parseFloat(selectedOperation.cost).toFixed(2) || '$0.00');
            setIsEditing(false);
        } else {
            setTitleOperation('');
            setCostOperation('');
            setIsEditing(true);
        }
    }, [selectedOperation]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === "edit") {
            // update
            await updateOperation();
        } else {
            // add new
            await createOperation();
        }
    };

    const createOperation = async () => {

        try {
            const response = await apiClient.post('/operations/create', { title, cost });
            if (response.data) {
                onOperationChange(response.data, "ADD");
            }
            showToastOnce("success", "Operación registrada");
        } catch (error) {

            handleErrors(error, "Hubo un error al guardar la operación");
        }
    };

    const updateOperation = async () => {
        try {
            const response = await apiClient.put(`/operations/update/${selectedOperation.id}`, { title, cost });
            if (response.data) {
                onOperationChange(response.data, "UPDATE");
            }
            showToastOnce("success", "Operación actualizada con éxito");
        } catch (error) {
            handleErrors(error, "Hubo un error al actualizar la operación");
        }
    };

    const handleErrors = (error, fallbackMessage) => {
        let mensajesError = [];
        if (error.response?.data?.errors?.length > 0) {
            mensajesError = error.response.data.errors.map(err => err.message);
        }
        showToastOnce("error", mensajesError.join(" / ") || fallbackMessage);
    };

    const openAlertModalOperationSuspend = () => {
        setIsAlertOperationSuspend(true);
    };

    const closeAlertModalOperationSuspend = () => {
        setIsAlertOperationSuspend(false);
    };

    //Función para suspender una operación
    const handleUnavailableOperation = async (event) => {
        event.preventDefault();
        setIsAlertOperationSuspend(false);

        try {

            const response = await apiClient.put(`/operations/change-status/${selectedOperation.id}?status=suspended`)

            if (response.status === 200) {
                onOperationChange(selectedOperation, "SUSPEND");
                showToastOnce("success", "Operación suspendida");
            }

        } catch (error) {
            showToastOnce("error", "Error al suspender la operación. Por favor, inténtalo de nuevo..");
        }
    };

    // Cuando selectedOperation cambie, actualizamos title y cost
    useEffect(() => {
        setTitleOperation(selectedOperation ? selectedOperation.title : '');
        setCostOperation(selectedOperation ? parseFloat(selectedOperation.cost).toFixed(2) : "0.00");
    }, [selectedOperation]);


    return (
        <div className="container-general">

            <CustomTitleSection
                onBack={() => {
                    if (mode === "edit" && isEditing) {
                        setIsEditing(false); // salir modo edición
                    }
                    goBack?.();
                }}
                titlePrefix="Panel Operaciones"
                title={mode === "add" ? "Nueva Operación" : "Información de la Operación"}
                onCustomButtonClick={(mode === "add" || (mode === "edit" && isEditing)) ? handleSubmit : undefined}
                customButtonLabel={(mode === "add" || (mode === "edit" && isEditing)) ? "GUARDAR" : undefined}
                showCustomButton={(mode === "add" || (mode === "edit" && isEditing))}
                showDisableIcon={mode === "edit"}
                onDisable={mode === "edit" ? openAlertModalOperationSuspend : undefined}
                showEditIcon={mode === "edit" && !isEditing}
                onEdit={mode === "edit" ? () => setIsEditing(true) : undefined}
            />

            <div className="container-section-service">

                <div className="service-column-title">
                    <span className="section-title">Información General</span>

                    <div className="field-group">
                        <label>Título</label>
                        <input
                            className="title-service"
                            type="text"
                            value={title}
                            disabled={mode === "edit" && !isEditing}
                            onChange={(e) => setTitleOperation(e.target.value)}
                        />
                    </div>
                </div>

                <div className="service-column-price">
                    <span className="section-title">Información financiera</span>

                    <div className="field-group">
                        <label>Precio Total</label>
                        <input
                            type="text"
                            className="input-total-cost"
                            value={`$${cost}`}
                            disabled={mode === "edit" && !isEditing}
                            onChange={(e) => {
                                const cleanVal = e.target.value.replace(/[^0-9.]/g, '');
                                setCostOperation(cleanVal);
                            }}
                        />

                    </div>
                </div>

            </div>

            {isAlertOperationSuspend && (
                <CustomModal
                    isOpen={isAlertOperationSuspend}
                    type="confirm-suspend"
                    subTitle="¿Está seguro de suspender la operación?"
                    description="Al suspender la operación, se ocultará temporalmente del sistema.
                        Podrás volver a activarlo desde Configuración en cualquier momento."
                    onCancel={closeAlertModalOperationSuspend}
                    onConfirm={handleUnavailableOperation}
                    showCloseButton={false}
                />
            )}

        </div>
    );
};

export default OperationRightSection;
