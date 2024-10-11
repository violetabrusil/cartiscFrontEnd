import "../TitleAndSearchBox.css";
import React, { useState, useEffect } from "react";
import { useWorkOrderContext } from "../contexts/searchContext/WorkOrderContext";

const searchIcon = process.env.PUBLIC_URL + "/images/icons/searchIcon.png";
const filterIcon = process.env.PUBLIC_URL + "/images/icons/filterIcon.png";

const TitleAndSearchBoxSpecial = ({ title, onSearchChange, onButtonClick, selectedOption, isSpecial, shouldSaveSearch }) => {
    const { searchTerm, setSearchTerm } = useWorkOrderContext();
    const [searchInput, setSearchInput] = useState(searchTerm || "");
    const [debounceTimeout, setDebounceTimeout] = useState(null);

    const searchBoxClass = isSpecial ? "search-box-special" : "search-box";
    const buttonClass = isSpecial ? "button-filter-special" : "button-filter";
    const iconClass = isSpecial ? "filter-icon-special" : "filter-icon";

    let placeholderText = `Buscar por ${selectedOption}`;

    useEffect(() => {
        if (shouldSaveSearch) {
            setSearchInput(searchTerm || "");
        }
    }, [searchTerm, shouldSaveSearch]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchInput(value); // Actualiza el estado local del input

        // Limpiar el timeout anterior si existe
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Configurar un nuevo timeout para el debounce
        const timeout = setTimeout(() => {
            if (value.length === 0) {
                onSearchChange(""); // Muestra toda la lista
                setSearchTerm(""); // Restablece el término de búsqueda
            } else if (value.length >= 5) {
                onSearchChange(value, selectedOption); // Actualiza la búsqueda
                setSearchTerm(value); // Actualiza el término de búsqueda global
            }
        }, 300); // Tiempo de espera de 300 ms (ajustable según la necesidad)

        setDebounceTimeout(timeout);
    };

    useEffect(() => {
        setSearchInput(searchTerm);
    }, [searchTerm]);

    return (
        <div>
            <div className="container-title">
                <h2>{title}</h2>
                <button className={buttonClass} onClick={onButtonClick}>
                    <img src={filterIcon} alt="Filter Icon" className={iconClass} />
                    <span className="filter-text">Filtro</span>
                </button>
            </div>

            <div className={searchBoxClass}>
                <img src={searchIcon} alt="Search Icon" className="search-icon" />
                <input
                    type="text"
                    className="input-search"
                    value={searchInput}
                    onChange={handleInputChange}
                    placeholder={placeholderText}
                />
            </div>
        </div>
    );
};

export default TitleAndSearchBoxSpecial;
