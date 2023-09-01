import "../SearchBar.css";
import React, { useState, useRef } from 'react';
import Select from 'react-select';

const searchIcon = process.env.PUBLIC_URL + "/images/icons/searchIcon.png";

const SearchBar = ({ 
    onFilter, 
    placeholderText = "Buscar Productos", 
    customSelectStyles, 
    classNameSuffix = "",
    options = [
        { value: 'sku', label: 'Código de producto' },
        { value: 'supplier_name', label: 'Nombre de proveedor' },
        { value: 'title', label: 'Título' },
        { value: 'category', label: 'Categoría' },
        { value: 'branch', label: 'Marca' }
    ] }) => {

    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const isFirstRender = useRef(true);

    const handleOptionsChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        setSearchTerm(""); //Para resetear el valor del input de búsqueda

    };

    /*
        useEffect(() => {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            //Búsqueda de productos
            const delayTimer = setTimeout(() => {
                onFilter(selectedOption, searchTerm);
                //Lógica para realizar la búsqueda
                console.log("Select option", selectedOption);
                console.log("Search term", searchTerm);
            }, 500); //Espera 500ms después de la última pulsación de tecla
    
            return () => clearTimeout(delayTimer); //Limpia el temporizador al desmontarse el componente
        }, [selectedOption, searchTerm, onFilter]);
    */
    
    const customStyles = {
        control: (base, state) => ({
            ...base,
            width: '550px',  // Aquí estableces el ancho
            height: '40px',  // Y aquí la altura
            minHeight: '40px', // Establece la altura mínima igual a la altura para evitar que cambie
            border: '1px solid rgb(0 0 0 / 34%)',
            borderRadius: '4px',
            padding: '1px',
            boxSizing: 'border-box'  // Asegura que el borde y el relleno estén incluidos en el tamaño
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: '#999', // Color del texto del placeholder
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-select-option-product',
            // otros estilos personalizados si los necesitas
        }),
        menuPortal: base => ({ ...base, width: '41%', zIndex: 9999 }),

    };

    const combinedStyles = {
        ...customStyles,
        ...customSelectStyles
    };

    return (

        <div className="search-bar-container">
            <Select
                options={options}
                value={selectedOption}
                onChange={handleOptionsChange}
                styles={combinedStyles}
                placeholder="Seleccionar"
                menuPortalTarget={document.body}
            />

            <div className={`search-products-box ${classNameSuffix ? `search-products-box-${classNameSuffix}` : ""}`}>
                <img src={searchIcon} alt="Search Product Icon" className="search-products-icon" />
                <input
                    type="text"
                    className="input-search-products"
                    value={searchTerm}
                    onChange={e => {
                        setSearchTerm(e.target.value);
                        onFilter(selectedOption, e.target.value);
                    }}
                    placeholder={placeholderText}
                />
            </div>
        </div>
    )
};

export default SearchBar;
