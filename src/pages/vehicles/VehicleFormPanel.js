import React from "react";
import Select from 'react-select';
import CustomTitleSection from "../../customTitleSection/CustomTitleSection";
import { CustomPlaceholder } from "../../customPlaceholder/CustomPlaceholder";
import { CustomSingleValue } from "../../customSingleValue/CustomSingleValue";
import useCSSVar from "../../hooks/UseCSSVar";
import { useEffect, useState } from 'react';

const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";
const yearIcon = process.env.PUBLIC_URL + "/images/icons/year.png";
const kmIcon = process.env.PUBLIC_URL + "/images/icons/km.png";
const brandIcon = process.env.PUBLIC_URL + "/images/icons/brand.png";
const modelIcon = process.env.PUBLIC_URL + "/images/icons/model.png";
const motorIcon = process.env.PUBLIC_URL + "/images/icons/engine.png";

const VehicleFormPanel = ({
    mode = "add",
    plateCar, setPlateCar,
    year, setYear,
    brand, setBrand,
    model, setModel,
    category, setCategory,
    motor, setMotor,
    km, setKm,
    isEditMode, setIsEditMode,
    onSubmit,
    onBack,
    onDisable,
    nameClient,
    isInputFocused,
    handleInputFocus,
    handleInputBlur,
    titlePrefix = "Panel Vehículos"
}) => {

    const [localNameClient, setLocalNameClient] = useState(nameClient);

    const options = [
        { value: 'car', label: 'Auto' },
        { value: 'van', label: 'Camioneta' },
        { value: 'bus', label: 'Buseta' },
        { value: 'truck', label: 'Camión' }
    ];

    const grayMediumDark = useCSSVar('--gray-medium-dark');
    const blackAlpha34 = useCSSVar('--black-alpha-34');

    const isReadOnly = mode === "edit" && !isEditMode;

    const isTabletLandscape = window.matchMedia("(min-width: 800px) and (max-width: 1340px) and (orientation: landscape)").matches;

    const customComponents = {};
    if (mode === "add") customComponents.Placeholder = CustomPlaceholder;
    if (mode === "edit") customComponents.SingleValue = CustomSingleValue;


    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            className: 'custom-select-control',
            width: isTabletLandscape ? '95%' : '100%',
            height: '50px', // Estilo personalizado para la altura
            border: `1px solid ${blackAlpha34}`, // Estilo personalizado para el borde con el color deseado
            borderRadius: '4px',
            padding: '0 8px 0 5px', // similar a input
            marginTop: '8px',
            marginBottom: '12px',
            boxSizing: 'border-box',

        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: grayMediumDark,
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-select-option',

        }),
        menu: (provided, state) => ({
            ...provided,
            width: '100%',
        }),
        menuPortal: base => ({
            ...base,
            zIndex: 9999
        }),
    };

    const handleTypeCarChange = (selectedOptionCategoryCar) => {
        setCategory(selectedOptionCategoryCar.value);
    };

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

    useEffect(() => {
        setLocalNameClient(nameClient);
        console.log("nombre", nameClient)
    }, [nameClient]);


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
                    titlePrefix={titlePrefix}
                    title={mode === "add" ? "Nuevo Vehículo" : "Información del vehículo"}
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
                <div className="panel-scroll-container">
                    {/* Placa */}
                    <label className="label-plate-form">Placa</label>
                    <div className="header-container">
                        <div className={`input-container ${isInputFocused ? "active" : ""}`}>
                            <div className="label-container">
                                <img src={flagIcon} alt="Flag" className="flag-icon" />
                                <label className="label-plate-vehicle">ECUADOR</label>
                            </div>
                            <input
                                className="input-plate"
                                type="text"
                                value={plateCar}
                                onChange={handleCarPlateChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                readOnly={isReadOnly}
                            />
                        </div>

                        {(mode === "add" || mode === "edit") && (
                            <div className="client-container">
                                <span className="client-label">CLIENTE:</span>
                                <span className="client-name">{localNameClient}</span>
                            </div>
                        )}

                    </div>

                    {/* Año */}
                    <label className="label-form">
                        Año
                        <div className="input-form-new">
                            <input
                                className="input-form-add"
                                type="number"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                readOnly={isReadOnly}
                            />
                            <img src={yearIcon} alt="Year Icon" className="icon-new-value" />
                        </div>
                    </label>

                    {/* Categoría */}
                    <label className="label-form">
                        Categoría
                        <div className="input-form-new">
                            <Select
                                components={customComponents}
                                isSearchable={false}
                                options={options}
                                value={options.find((opt) => opt.value === category)}
                                onChange={handleTypeCarChange}
                                styles={customStyles}
                                placeholder="Seleccionar"
                                menuPortalTarget={document.body}
                                onMenuOpen={() => { }}
                            />
                        </div>
                    </label>

                    {/* Kilometraje */}
                    <label className="label-form">
                        Kilometraje actual
                        <div className="input-form-new">
                            <input
                                className="input-form-add"
                                type="number"
                                value={km}
                                onChange={(e) => setKm(parseInt(e.target.value))}
                                readOnly={isReadOnly}
                            />
                            <img src={kmIcon} alt="Km Icon" className="icon-new-value" />
                        </div>
                    </label>

                    {/* Marca */}
                    <label className="label-form">
                        Marca
                        <div className="input-form-new">
                            <input
                                className="input-form-add"
                                type="text"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                readOnly={isReadOnly}
                            />
                            <img src={brandIcon} alt="Brand Icon" className="icon-new-value" />
                        </div>
                    </label>

                    {/* Modelo */}
                    <label className="label-form">
                        Modelo
                        <div className="input-form-new">
                            <input
                                className="input-form-add"
                                type="text"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                readOnly={isReadOnly}
                            />
                            <img src={modelIcon} alt="Model Icon" className="icon-new-value" style={{ top: '44%' }} />
                        </div>
                    </label>

                    {/* Motor */}
                    <label className="label-form">
                        Motor
                        <div className="input-form-new">
                            <input
                                className="input-form-add"
                                type="text"
                                value={motor}
                                onChange={(e) => setMotor(e.target.value)}
                                readOnly={isReadOnly}
                            />
                            <img src={motorIcon} alt="Motor Icon" className="icon-new-value" />
                        </div>
                    </label>

                </div>
            </div>
        </>
    );
};

export default VehicleFormPanel;