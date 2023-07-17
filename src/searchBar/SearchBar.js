import "../SearchBar.css";
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import searchIcon from "../images/icons/searchIcon.png";

const SearchBar = ({ onFilter }) => {

    const [selectedOption, setSelectedOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const handleOptionsChange = (selectedOption) => {
        setSelectedOption(selectedOption);
    };

    const handleSearchInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    useEffect(() => {
        //Búsqueda de productos
        const delayTimer = setTimeout(() => {
            //Lógica para realizar la búsqueda
            console.log("Select option", selectedOption);
            console.log("Search term", searchTerm);
        }, 500); //Espera 500ms después de la última pulsación de tecla

        return () => clearTimeout(delayTimer); //Limpia el temporizador al desmontarse el componente
    }, [selectedOption, searchTerm]);

    const options = [
        { value: 'numero de serie', label: 'Número de serie' },
        { value: 'titulo', label: 'Título' },
        { value: 'categoria', label: 'Categoría' }
    ];

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

    return (

        <div className="search-bar-container">
            <Select
                options={options}
                value={selectedOption}
                onChange={handleOptionsChange}
                styles={customStyles}
                placeholder="Seleccionar"
                menuPortalTarget={document.body}
            />

            <div className="search-products-box">
                <img src={searchIcon} alt="Search Product Icon" className="search-products-icon" />
                <input
                    type="text"
                    className="input-search-products"
                    onChange={handleSearchInputChange}
                    placeholder="Buscar Productos"
                />
            </div>
        </div>
    )
};

export default SearchBar;
