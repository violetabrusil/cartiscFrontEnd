import "../Modal.css";
import "react-datepicker/dist/react-datepicker.css";
import React, { useState } from "react";
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import useCSSVar from "../hooks/UseCSSVar";

const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";

const SearchModalWorkOrder = ({ fields, onSearch, onClose }) => {

    const [formData, setFormData] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);

    const handleSelectChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        setFormData(prevData => ({
            ...prevData,
            WorkOrderStatus: selectedOption.value
        }));
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleDateChange = (name, date) => {
        setFormData(prev => ({
            ...prev,
            [name]: date
        }));
    };

    const handleSubmit = () => {
        onSearch(formData);
    };

    const WorkOrderStatusOptions = [
        { value: 'to_start', label: 'Por iniciar' },
        { value: 'assigned', label: 'Asignada' },
        { value: 'in_development', label: 'En desarrollo' },
        { value: 'stand_by', label: 'En pausa' },
        { value: 'cancelled', label: 'Cancelada' },
        { value: 'completed', label: 'Completada' },
        { value: 'deleted', label: 'Eliminada' },
    ];

    const blackAlpha34 = useCSSVar('--black-alpha-34');

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            height: '45px',
            minHeight: '45px',
            marginTop: '10px',
            marginBottom: '10px',
            border: `1px solid ${blackAlpha34}`
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: blackAlpha34,
            fontWeight: '600',
        }),
    };

    return (
        <div className="filter-modal-overlay">

            <div className="filter-modal">
                <div className="title-modal-search">
                    <h3>Filtros de búsqueda</h3>
                    <button className="button-close-modal" onClick={onClose}  >
                        <img src={closeIcon} alt="Close Icon" className="modal-close-icon"></img>
                    </button>
                </div>

                {fields.includes('WorkOrderCode') && (
                    <div className="container-fields-modal-search">
                        <label className="label-fields">Código de la orden de trabajo</label>
                        <input
                            className="input-fields"
                            name="WorkOrderCode"
                            onChange={handleInputChange}
                        />
                    </div>
                )}
                {fields.includes('VehiclePlate') && (
                    <div className="container-fields-modal-search">
                        <label className="label-fields">Placa del vehículo</label>
                        <input
                            className="input-fields"
                            name="VehiclePlate"
                            onChange={handleInputChange}
                        />
                    </div>
                )}
                {fields.includes('ClientName') && (
                    <div className="container-fields-modal-search">
                        <label className="label-fields">Nombre del cliente</label>
                        <input
                            className="input-fields"
                            name="ClientName"
                            onChange={handleInputChange}
                        />
                    </div>
                )}
                {fields.includes('ClientCedula') && (
                    <div className="container-fields-modal-search">
                        <label className="label-fields">Cédula del cliente</label>
                        <input
                            className="input-fields"
                            name="ClientCedula"
                            onChange={handleInputChange}
                        />
                    </div>
                )}
                {fields.includes('WorkOrderStatus') && (
                    <div className="container-fields-modal-search">
                        <label className="label-fields">Estado de la orden de trabajo</label>
                        <Select
                            isSearchable={false}
                            styles={customStyles}
                            value={selectedOption}
                            onChange={handleSelectChange}
                            options={WorkOrderStatusOptions}
                            placeholder="Seleccione"
                            classNamePrefix="react-select"
                        />
                    </div>
                )}
                {fields.includes('DateStartOfSearch') && fields.includes('DateFinishOfSearch') && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <label className="label-fields">Fecha Inicio</label>
                            <DatePicker
                                className="input-fields"
                                placeholderText="Seleccione una fecha"
                                selected={formData['DateStartOfSearch']}
                                onChange={date => handleDateChange('DateStartOfSearch', date)} />
                        </div>
                        <div>
                            <label className="label-fields">Fecha Fin</label>
                            <DatePicker
                                className="input-fields"
                                placeholderText="Seleccione una fecha"
                                selected={formData['DateFinishOfSearch']}
                                onChange={date => handleDateChange('DateFinishOfSearch', date)} />
                        </div>
                    </div>
                )}
                {fields.includes('Assigned') && (
                    <div className="container-fields-modal-search">
                        <label className="label-fields">Asignada a</label>
                        <input
                            className="input-fields"
                            name="Assigned"
                            onChange={handleInputChange}
                        />
                    </div>
                )}
                {fields.includes('DeliveredBy') && (
                    <div className="container-fields-modal-search">
                        <label className="label-fields">Entregada por</label>
                        <input
                            className="input-fields"
                            name="DeliveredBy"
                            onChange={handleInputChange}
                        />
                    </div>
                )}
                {fields.includes('CreatedBy') && (
                    <div className="container-fields-modal-search">
                        <label className="label-fields">Creada por</label>
                        <input
                            className="input-fields"
                            name="CreatedBy"
                            onChange={handleInputChange}
                        />
                    </div>
                )}

                <button onClick={handleSubmit} className="modal-button">Aplicar</button>
            </div>
        </div>
    )




};

export default SearchModalWorkOrder;