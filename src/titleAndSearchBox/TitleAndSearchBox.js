import "../TitleAndSearchBox.css"
import React from "react";
import Icon from "../components/Icons";

const TitleAndSearchBox = ({ title, onSearchChange, onButtonClick, selectedOption, isSpecial, onAddClient, showAddButton }) => {

    const searchBoxClass = isSpecial ? "search-box-special" : "search-box";
    const buttonClass = isSpecial ? "button-filter-special" : "button-filter";
    const iconClass = isSpecial ? "filter-icon-special" : "filter-icon";

    // Define el texto del placeholder según selectedOption
    let placeholderText = `Buscar por ${selectedOption}`;

    return (
        <div>
            <div className="container-title">
                {showAddButton && ( // Condición para mostrar el botón nuevo
                    <button className="add-new-client" onClick={onAddClient}>
                        Agregar Cliente
                    </button>
                )}
                <h2>{title}</h2>
                <button className={buttonClass} onClick={onButtonClick}>
                    <Icon name="filter" className={iconClass} />
                    <span className="filter-text">Filtro</span>
                </button>
            </div>

            <div className={searchBoxClass}>
                <Icon name="search" className="search-client-icon" />
                <input
                    type="text"
                    className="input-search"
                    onChange={e => onSearchChange(e.target.value, selectedOption)}
                    placeholder={placeholderText} // Usa el placeholderText aquí
                />
            </div>

        </div>
    )
};

export default TitleAndSearchBox;