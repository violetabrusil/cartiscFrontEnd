import "../SearchBar.css";
import React, { useState } from 'react';
import Select from 'react-select';
import useCSSVar from "../hooks/UseCSSVar";
import Icon from "../components/Icons";

const searchIcon = process.env.PUBLIC_URL + "/images/icons/searchIcon.png";

const SearchBar = ({
    onFilter,
    placeholderText = "Buscar Productos",
    customSelectStyles,
    customClasses = "",
    classNameSuffix = "",
    options = [
        { value: 'sku', label: 'Código de producto' },
        { value: 'supplier_name', label: 'Nombre de proveedor' },
        { value: 'title', label: 'Título' },
        { value: 'category', label: 'Categoría' },
        { value: 'branch', label: 'Marca' }
    ] }) => {

    const [selectedOption, setSelectedOption] = useState(options[1]);
    const [searchTerm, setSearchTerm] = useState("");

    const grayMediumDark = useCSSVar('--gray-medium-dark');
    const grayMedium = useCSSVar('--gray-medium');

    const handleOptionsChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        setSearchTerm("");
        onFilter(selectedOption, searchTerm);

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
            width: '100%',
            minWidth: '420px',
            maxWidth: '550px',
            height: '40px',
            minHeight: '40px',
            border: `1px solid ${grayMedium}`,
            borderRadius: '4px',
            padding: '1px',
            boxSizing: 'border-box',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: grayMediumDark,
        }),
        option: (provided, state) => ({
            ...provided,
            className: 'custom-select-option-product',
        }),
        menuPortal: (base, state) => ({
            ...base,
            zIndex: 9999
        })
    };

    const combinedStyles = {
        ...customStyles,
        ...customSelectStyles
    };

    return (

        <div className={`search-bar-container ${customClasses}`}>
            <Select
                isSearchable={false}
                options={options}
                value={selectedOption}
                onChange={handleOptionsChange}
                styles={combinedStyles}
                placeholder="Seleccionar"
                menuPortalTarget={document.body}
            />

            <div className={`search-products-box ${classNameSuffix ? `search-products-box-${classNameSuffix}` : ""}`}>
                <Icon name="search" className="search-products-icon" />
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
