import "../Modal.css";
import "../NewClient.css";

import React, { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import { CustomPlaceholder } from "../customPlaceholder/CustomPlaceholder";
import apiClient from "../services/apiClient";

const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";
const flagIcon = process.env.PUBLIC_URL + "/images/icons/flagEcuador.png";
const yearIcon = process.env.PUBLIC_URL + "/images/icons/year.png";
const kmIcon = process.env.PUBLIC_URL + "/images/icons/km.png";
const brandIcon = process.env.PUBLIC_URL + "/images/icons/brand.png";
const modelIcon = process.env.PUBLIC_URL + "/images/icons/model.png";
const motorIcon = process.env.PUBLIC_URL + "/images/icons/engine.png";

export const AddNewVehicleModal = ({ isOpen, onClose, OnUpdate, selectedClientId }) => {

    const [isInputFocused, setIsInputFocused] = useState(false);
    const [category, setCategory] = useState('');
    const [plateCar, setPlateCar] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [motor, setMotor] = useState('');
    const [km, setKm] = useState('');

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            className: 'custom-select-control',
            width: '100%',
            height: '44px', // Estilo personalizado para la altura
            minHeight: '44px',
            boxSizing: 'border-box',
            border: '1px solid rgb(0 0 0 / 34%)', // Estilo personalizado para el borde con el color deseado
            borderRadius: '4px', // Estilo personalizado para el borde redondeado
            padding: '0 8px',
            marginBottom: '20px',
            marginTop: '8px'
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: '#999', // Color del texto del placeholder
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-select-option',
            // otros estilos personalizados si los necesitas
        }),
        menu: (provided, state) => ({
            ...provided,
            width: '60%', // puedes ajustar el ancho del menú aquí
        }),

    };

    const options = [
        { value: 'car', label: 'Auto' },
        { value: 'suv', label: 'SUV' },
        { value: 'pickup_truck', label: 'Camioneta' },
        { value: 'van', label: 'Buseta' },
        { value: 'truck', label: 'Camión' },
    ];

    const handleInputFocus = () => {
        setIsInputFocused(true);
    };

    const handleInputBlur = () => {
        setIsInputFocused(false);
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

    const handleTypeCarChange = (selectedOptionCategoryCar) => {
        setCategory(selectedOptionCategoryCar.value);
    };

    const transformPlateForSaving = (plateWithDash) => {
        return plateWithDash.replace(/-/g, '');
    };

    const handleAddVehicle = async (event) => {

        if (event) {
            event.preventDefault(); // Para evitar que el formulario recargue la página
        }

        const client_id = selectedClientId;
        const plate = transformPlateForSaving(plateCar);

        try {

            await apiClient.post('/vehicles/register', { client_id, category, plate, brand, model, year, motor, km });

            toast.success('Vehículo registrado', {
                position: toast.POSITION.TOP_RIGHT
            });

            console.log("Llamando a OnUpdate");
            OnUpdate();
            onClose();

        } catch (error) {
            toast.error('Error al guardar un vehiculo', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="filter-modal-overlay">
            <ToastContainer />
            <div className="filter-modal">
                <div className="title-modal-search title-centered">
                    <h3>Información Vehículo</h3>
                    <button className="button-close-modal" onClick={onClose}>
                        <img src={closeIcon} alt="Close Icon" className="modal-close-icon"></img>
                    </button>
                </div>

                <div className="container-add-car-modal">
                    <div className="form-scroll-vehicle-modal">
                        <form>
                            <div className={`input-container-modal ${isInputFocused ? "active" : ""}`}>
                                <input className="input-plate-modal" type="text" value={plateCar} onChange={handleCarPlateChange}
                                    onFocus={handleInputFocus} onBlur={handleInputBlur} />
                                <img src={flagIcon} alt="Flag" className="flag-icon" />
                                <label className="label-plate-vehicle-modal">ECUADOR</label>
                            </div>

                            <label className="label-form">
                                Año
                                <div className="input-form-new-client">
                                    <input
                                        className="input-form-add-vehicle-modal "
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(parseInt(e.target.value))}
                                    />

                                    <img
                                        src={yearIcon}
                                        alt="Year Icon"
                                        className="input-new-client-icon"
                                    />

                                </div>

                            </label>
                            <label className="label-form">
                                Categoría
                                <Select
                                    components={{ Placeholder: CustomPlaceholder }}
                                    isSearchable={false}
                                    options={options}
                                    value={options.find(option => option.value === category)}
                                    onChange={handleTypeCarChange}
                                    styles={customStyles}
                                    placeholder="Seleccionar" />
                            </label>
                            <label className="label-form">
                                Kilometraje actual
                                <div className="input-form-new-client">
                                    <input
                                        className="input-form-add-vehicle-modal "
                                        type="number"
                                        value={km}
                                        onChange={(e) => setKm(parseInt(e.target.value))}
                                    />
                                    <img
                                        src={kmIcon}
                                        alt="Km Icon"
                                        className="input-new-client-icon"
                                        style={{ width: '30px' }}
                                    />

                                </div>

                            </label>
                            <label className="label-form">
                                Marca
                                <div className="input-form-new-client">
                                    <input
                                        className="input-form-add-vehicle-modal "
                                        type="text"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                    />
                                    <img
                                        src={brandIcon}
                                        alt="Brand Icon"
                                        className="input-new-client-icon"
                                    />

                                </div>

                            </label>
                            <label className="label-form">
                                Modelo
                                <div className="input-form-new-client">
                                    <input
                                        className="input-form-add-vehicle-modal "
                                        type="text"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                    />
                                    <img
                                        src={modelIcon}
                                        alt="Model Icon"
                                        className="input-new-client-icon"
                                        style={{ top: '35%' }}
                                    />

                                </div>

                            </label>
                            <label className="label-form">
                                Motor
                                <div className="input-form-new-client">
                                    <input
                                        className="input-form-add-vehicle-modal "
                                        type="text"
                                        value={motor}
                                        onChange={(e) => setMotor(e.target.value)}
                                    />
                                    <img
                                        src={motorIcon}
                                        alt="Motor Icon"
                                        className="input-new-client-icon"

                                    />

                                </div>

                            </label>
                        </form>
                    </div>
                </div>

                <div className="container-button-next">
                    <button className="button-next" onClick={handleAddVehicle}>
                        GUARDAR
                    </button>
                </div>


            </div>

        </div>

    );

}