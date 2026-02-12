import "../TitleAndSearchBox.css"
import React, { useState, useEffect } from "react";

const searchIcon = process.env.PUBLIC_URL + "/images/icons/searchIcon.png";
const filterIcon = process.env.PUBLIC_URL + "/images/icons/filterIcon.png";

const TitleAndSearchBox = ({ title, onSearchChange, onButtonClick, selectedOption, isSpecial, onAddClient, showAddButton }) => {

    const [localValue, setLocalValue] = useState("");

    const searchBoxClass = isSpecial ? "search-box-special" : "search-box";
    const buttonClass = isSpecial ? "button-filter-special" : "button-filter";
    const iconClass = isSpecial ? "filter-icon-special" : "filter-icon";

    let placeholderText = `Buscar por ${selectedOption}`;

    const handleChange = (e) => {
        const val = e.target.value;
        setLocalValue(val); 
        onSearchChange(val); 
    };

    useEffect(() => {
        setLocalValue("");
    }, [selectedOption]);

    return (
        <div>
            <div className="container-title">
                {showAddButton && (
                    <button className="add-new-client" onClick={onAddClient}>
                        Agregar Cliente
                    </button>
                )}
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
                    value={localValue}
                    onChange={handleChange}
                    placeholder={placeholderText}
                />
            </div>
        </div>
    );
};

export default TitleAndSearchBox;