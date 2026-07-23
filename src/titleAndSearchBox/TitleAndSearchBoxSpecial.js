import "../TitleAndSearchBox.css";
import React, { useState, useEffect } from "react";

const searchIcon = process.env.PUBLIC_URL + "/images/icons/searchIcon.png";
const filterIcon = process.env.PUBLIC_URL + "/images/icons/filterIcon.png";

const TitleAndSearchBoxSpecial = ({ title, subtitle, onSearchChange, onButtonClick, selectedOption, isSpecial, shouldSaveSearch, searchTerm, wrapperClassName }) => {
    const [searchInput, setSearchInput] = useState(searchTerm || "");

    const searchBoxClass = isSpecial ? "search-box-special" : "search-box";
    const buttonClass = isSpecial ? "button-filter-special" : "button-filter";
    const iconClass = isSpecial ? "filter-icon-special" : "filter-icon";

    let placeholderText = `Buscar por ${selectedOption}`;

    useEffect(() => {
        if (shouldSaveSearch && searchTerm !== searchInput) {
            setSearchInput(searchTerm || "");
        }
    }, [searchTerm]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        onSearchChange(value)
    };

    return (
        <div className={wrapperClassName}>
            <div className="container-title">
                <h2>{title}</h2>
                {(subtitle !== undefined && subtitle !== null) && (
                    <span className="subtitle-badge">
                        {subtitle}
                    </span>
                )}
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
