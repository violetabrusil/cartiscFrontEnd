import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import Icon from "../../components/Icons";

const SupplierForm = ({
    mode = "add",
    name, setName,
    phone, setPhone,
    detailContact, setDetailContact,
    onBack,
    isEditing, setIsEditing,
    onSubmit,
    onDisable,
}) => {

    const isReadOnly = mode === "edit" && !isEditing;

    return (
        <div className="container-general">
            <CustomTitleSection
                onBack={() => {
                    if (mode === "edit" && typeof setIsEditing === "function") {
                        setIsEditing(false);
                    }
                    onBack?.();
                }}
                titlePrefix="Panel Proveedores"
                title={mode === "add" ? "Nuevo Proveedor" : "Información del proveedor"}
                onCustomButtonClick={(mode === "add" || (mode === "edit" && isEditing)) ? onSubmit : undefined}
                customButtonLabel={(mode === "add" || (mode === "edit" && isEditing)) ? "GUARDAR" : undefined}
                showCustomButton={(mode === "add" || (mode === "edit" && isEditing))}
                showDisableIcon={mode === "edit"}
                onDisable={mode === "edit" ? onDisable : undefined}
                showEditIcon={mode === "edit" && !isEditing}
                onEdit={mode === "edit" ? () => setIsEditing(true) : undefined}
            />

            <div className="container-section-supplier">

                <div className="supplier-column-title">
                    <span className="section-title">Información General</span>

                    <div className="field-group">
                        <label>Nombre</label>
                        <input
                            value={name}
                            className="name-supplier"
                            onChange={(e) => setName(e.target.value)}
                            readOnly={isReadOnly}
                        />
                    </div>

                    <div className="field-group">
                        <label>Teléfono</label>
                        <input
                            type="number"
                            value={phone}
                            className="phone-supplier"
                            onChange={(e) => setPhone(e.target.value)}
                            readOnly={isReadOnly}
                        />
                    </div>

                    <div className="field-group">
                        <label>Detalle de contacto</label>
                        <textarea
                            value={detailContact}
                            className="detail-contact-supplier"
                            onChange={(e) => setDetailContact(e.target.value)}
                            readOnly={isReadOnly}
                        />
                    </div>

                </div>

                <div className="supplier-column-image">
                 
                    <div className="container-supplier-image">
                        <Icon name="supplier" className="supplier-image"/>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default SupplierForm;