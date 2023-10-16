import "../TitleAndSearchBox.css"
import React from "react";

const searchIcon = process.env.PUBLIC_URL + "/images/icons/searchIcon.png";
const filterIcon = process.env.PUBLIC_URL + "/images/icons/filterIcon.png";

const TitleAndSearchBox = ({ title, onSearchChange, onButtonClick, selectedOption, isSpecial }) => {

    const searchBoxClass = isSpecial ? "search-box-special" : "search-box";
    const buttonClass = isSpecial ? "button-filter-special" : "button-filter";
    const iconClass = isSpecial ? "filter-icon-special" : "filter-icon";
    
    // Define el texto del placeholder según selectedOption
    let placeholderText = `Buscar por ${selectedOption}`;

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
                    onChange={e => onSearchChange(e.target.value, selectedOption)}
                    placeholder={placeholderText} // Usa el placeholderText aquí
                />
            </div>

        </div>
    )
};

export default TitleAndSearchBox;