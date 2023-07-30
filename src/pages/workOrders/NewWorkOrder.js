import "../../NewWorkOrder.css";
import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import Select from 'react-select';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import searchIcon from "../../images/icons/searchIcon.png";
import clientIcon from "../../images/icons/userIcon-gray.png";
import carIcon from "../../images/icons/carIcon-gray.png";
import calendarIcon from "../../images/icons/calendarIcon.png";
import autoIcon from "../../images/icons/autoIcon.png";
import busetaIcon from "../../images/icons/busIcon.png";
import camionetaIcon from "../../images/icons/camionetaIcon.png";
import camionIcon from "../../images/icons/camionIcon.png";
import arrowIcon from "../../images/icons/arrowIcon.png";
import fuelIcon from "../../images/icons/fuelIcon.png";
import "react-datepicker/dist/react-datepicker.css";


const NewWorkOrder = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [typeWorkOrder, setTypeWorkOrder] = useState(null);
    const [stateWorkOrder, setStateWorkOrder] = useState(null);
    const [showSpareParts, setShowSpareParts] = useState(false);
    const [iconRotated, setIconRotated] = useState(false);
    const [symptoms, setSymptoms] = useState([]);
    const symptomsEndRef = useRef(null);
    const [placeholder, setPlaceholder] = useState("Describa los síntomas");


    const handleSearchClientChange = (newSearchTerm) => {
        setSearchTerm(newSearchTerm);
        // Aquí puedes hacer cualquier otra lógica que necesites cuando cambie el término de búsqueda
    };

    const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
        <button
            className="custom-date-picker"
            onClick={onClick}
            ref={ref}
        >
            <div className="date-picker-text">{value}</div>
            <div className="date-picker-icon" style={{ background: `url(${calendarIcon}) center/contain no-repeat` }}></div>
        </button>
    ));

    const options = [
        { value: 'proforma', label: 'Proforma' },
        { value: 'notaVenta', label: 'Nota de venta' },
    ];

    const stateOptions = [
        { value: 'iniciar', label: 'Por iniciar' },
        { value: 'ejecucion', label: 'En ejecución' },
        { value: 'finalizar', label: 'Finalizado' },
    ];

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            className: 'custom-select-control-work-order',
            width: '139%', // Estilo personalizado para el ancho
            height: '32px',
            border: '1px solid rgb(0 0 0 / 34%)', // Estilo personalizado para el borde con el color deseado
            borderRadius: '4px', // Estilo personalizado para el borde redondeado
            marginTop: '8px',
            boxSizing: 'border-box'  // Asegura que el borde y el relleno estén incluidos en el tamaño
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: '#999', // Color del texto del placeholder
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-select-option-work-order',
            // otros estilos personalizados si los necesitas
        }),
        menuPortal: base => ({
            ...base,
            width: '15%',
            zIndex: 9999,
            minWidth: '15%',  // Aquí se establece un ancho mínimo para el menú
        }),
    };

    const handleTypeWorkOrder = (typeWorkOrder) => {
        setTypeWorkOrder(typeWorkOrder);
    };

    const handleStateWorkOrder = (stateWorkOrder) => {
        setStateWorkOrder(stateWorkOrder);
    };

    const [vehicles, setVehicles] = useState([
        { src: autoIcon, plate: 'ABC123', className: 'auto' },
        { src: busetaIcon, plate: 'XYZ789', className: 'buseta' },
        { src: busetaIcon, plate: 'TYZ567', className: 'camioneta' },
        { src: camionIcon, plate: 'PDT456', className: 'camion' },
    ]);

    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 5,
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 3,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        },
    };

    const toggleComponentes = () => {
        setShowSpareParts(!showSpareParts);
        setIconRotated(!iconRotated);
    };

    //Opciones para el estado de entrega del vehículo
    const optionsCheckBox = {
        group1: ['Antena', 'Radio', 'Plumas', 'Extintor', 'Control puerta'],
        group2: ['Encendedor', 'Maqueta', 'Espejos', 'Combustible', 'Triángulos'],
        group3: ['Llantas', 'Gata', 'Herramientas', 'Gas', 'Llave rueda']
    };

    //Estado de las selecciones y porcentajes
    const [selections, setSelections] = useState({
        group1: Array(optionsCheckBox.group1.length).fill(false),
        group2: Array(optionsCheckBox.group2.length).fill(false),
        group3: Array(optionsCheckBox.group3.length).fill(false),
    });

    const [percentages, setPercentages] = useState({
        group3: [null, null, null, 0, null],
    });

    //Función para manjenar los cambios en los checkbox
    const handleCheckboxChange = (group, index) => {
        setSelections((prev) => ({
            ...prev,
            [group]: [
                ...prev[group].slice(0, index),
                !prev[group][index],
                ...prev[group].slice(index + 1),
            ],
        }));
    };

    //Función para manejar los cambios en los porcentajes
    const handlePorcentageChange = (group, index, event) => {
        setPercentages((prev) => ({
            ...prev,
            [group]: [
                ...prev[group].slice(0, index),
                event.target.value,
                ...prev[group].slice(index + 1),
            ],
        }));
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const text = event.target.innerText.trim();
            if (text !== '') {
                setSymptoms(prev => [...prev, text]);
                event.target.innerText = '';
            }
        }
    };

    const handleUpdateSymptom = (index, newSymptom) => {
        const newSymptoms = [...symptoms];
        newSymptoms[index] = newSymptom;
        setSymptoms(newSymptoms);
        // Si la lista no está vacía después de la actualización,
        // oculta el texto del marcador de posición.
        if (newSymptoms.some(item => item)) {
            setPlaceholder("");
        }
    };

    useEffect(() => {
        symptomsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [symptoms]);

    return (
        <div>

            <Header showIcon={true} showPhoto={true} showUser="Name User" showRol="Rol" />
            <Menu />

            <div className="new-work-order-general-container">

                <div className="new-work-order-title-container">
                    <h2>Orden de Trabajo</h2>
                    <button className="confirm-button">
                        <span className="text-confirm-button ">Confirmar</span>
                    </button>
                </div>

                <div className="client-search-container">
                    <div className="left-div">

                        <div className="search-box-work-order-client ">
                            <img src={searchIcon} alt="Search Icon" className="search-work-order-client-icon" />
                            <input
                                type="text"
                                className="input-search-work-order-client"
                                onChange={handleSearchClientChange}
                            />
                        </div>

                        {/*Lista de clientes*/}
                        <div className="result-client-container" >
                            <div className="first-result-work-order">
                                <img src={clientIcon} alt="Client Icon Work Order" className="icon-client" />
                                <div className="container-data-client">
                                    <label className="label-name-client">Daniel Taco</label>
                                    <div className="container-car-number-client">
                                        <label className="label-car-number-client">1</label>
                                        <img src={carIcon} alt="Car client work order" className="icon-client-work-order"></img>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="right-div-container">

                        <div className="right-div">
                            {/* Contenido del segundo div derecho */}
                            <Carousel responsive={responsive}>
                                {vehicles.map((vehicle, index) => (
                                    <div
                                        key={index}
                                        className={`carousel`}
                                    >
                                        <img src={vehicle.src} alt={`Vehicle ${index + 1}`} className={`vehicle-carousel ${vehicle.className}`} />
                                        <p className="label-carousel">{vehicle.plate}</p>
                                    </div>
                                ))}
                            </Carousel>
                        </div>

                        <div className="right-div">
                            {/*
                            <div className="left-half">
                                <div className="label-input-work-order-container">
                                    <label>Fecha</label>
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={date => setSelectedDate(date)}
                                        customInput={<CustomInput />}
                                        dateFormat='dd/MM/yyyy'
                                    />

                                </div>
                                <div className="label-input-work-order-container">
                                    <label>Tipo</label>
                                    <Select
                                        options={options}
                                        value={typeWorkOrder}
                                        onChange={handleTypeWorkOrder}
                                        styles={customStyles}
                                        placeholder="Seleccionar"
                                        menuPortalTarget={document.body}
                                        menuPlacement="auto" />
                                </div>
                                <div className="label-input-work-order-container">
                                    <label>Estado</label>
                                    <Select
                                        options={stateOptions}
                                        value={stateWorkOrder}
                                        onChange={handleStateWorkOrder}
                                        styles={customStyles}
                                        placeholder="Seleccionar"
                                        menuPortalTarget={document.body}
                                        menuPlacement="auto" />
                                </div>
                            </div>

                            
                            <div className="right-half">

                                <div className="label-input-work-order-container">
                                    <label>Subtotal</label>
                                    <input type="text" />
                                </div>
                                <div className="label-input-work-order-container">
                                    <label>Descuento</label>
                                    <input type="text" />
                                </div>
                                <div className="label-input-work-order-container">
                                    <label>IVA</label>
                                    <input type="text" />
                                </div>
                                <div className="label-input-work-order-container">
                                    <label>Total</label>
                                    <input type="text" />
                                </div>
                            </div> 
                            */ }



                        </div>

                    </div>

                </div>

                {/*
                 <div className="title-second-section-container">
                    <h3>Repuestos</h3>
                    <button onClick={toggleComponentes} className="button-toggle">
                        <img
                            src={arrowIcon}
                            alt="Icono"
                            className={`icon ${iconRotated ? 'rotated' : ''}`}
                        />
                    </button>
                </div>

                <div className="title-second-section-container">
                    <h3>Servicios / Operaciones</h3>
                    <button className="button-toggle">
                        <img
                            src={arrowIcon}
                            alt="Icono"
                            className={`icon ${iconRotated ? 'rotated' : ''}`}
                        />
                    </button>
                </div> */}

                <div className="title-second-section-container">
                    <h3>Estado entrega de vehículo</h3>
                </div>

                <div className="checkbox-container">
                    {Object.keys(selections).map((group) => (
                        <div key={group} className="checkbox-group">
                            {selections[group].map((isChecked, index) => (
                                optionsCheckBox[group][index] !== 'Gas' ? (
                                    <label key={index}>
                                        {optionsCheckBox[group][index]}
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleCheckboxChange(group, index)}
                                        />
                                    </label>
                                ) : (
                                    <div key={index}>
                                        <img src={fuelIcon} alt="Fuel Icon" className="fuel-icon" />
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={percentages[group][index] || ''}
                                            onChange={(event) => handlePorcentageChange(group, index, event)}
                                        />
                                        {' %'}
                                    </div>
                                )
                            ))}

                        </div>
                    ))}
                </div>

                <div className="second-container">

                    <div className="half-second-container">
                        <h3>Síntomas presentados</h3>
                        <div className="content">
                            <div
                                contentEditable
                                suppressContentEditableWarning
                                onKeyDown={handleKeyPress}
                                className={`editable-container ${symptoms.length ? '' : 'placeholder'}`}
                                onFocus={() => setPlaceholder("")}
                              
                            >
                                {placeholder}
                            </div>

                            <div className="list-sypmtoms-container">
                                <ul>
                                    {symptoms.map((item, index) => (
                                        <li key={index}
                                            ref={index === symptoms.length - 1 ? symptomsEndRef : null}
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleUpdateSymptom(index, e.currentTarget.textContent)}
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="half-second-container">
                        <h3>Observaciones generales</h3>
                        <div className="content">
                           <textarea className="textarea-class" placeholder="Describa las observaciones"></textarea>
                        </div>
                    </div>

                </div>

                <div className="title-second-section-container">
                    <h3>Puntos de interés</h3>
                </div>

            </div>


        </div>
    );


};

export default NewWorkOrder;