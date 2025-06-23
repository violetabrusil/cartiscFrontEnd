import React from "react";
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import Icon from "../../components/Icons";

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

    const isReadOnly = mode === "edit" && !isEditMode;

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
                <div className="panel-scroll-container" style={{ marginTop: '2rem' }}>

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
                            <Icon name="id" className="icon-new-value" />
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
                            <Icon name="text" className="icon-new-value" />
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
                            <Icon name="address" className="icon-new-value" />
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
                            <Icon name="email" className="icon-new-value" />
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
                            <Icon name="phone" className="icon-new-value" />
                        </div>
                    </label>

                </div>

            </div>

        </>
    );
};

export default ClientFormPanel;
