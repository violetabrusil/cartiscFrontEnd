import "../TitleAndSearchBox.css";
import React, { useState, useEffect } from "react";
import { useWorkOrderContext } from "../contexts/searchContext/WorkOrderContext";
import Icon from "../components/Icons";

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
        setSearchInput(value); 

        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        const timeout = setTimeout(() => {
            if (value.length === 0) {
                onSearchChange(""); 
                setSearchTerm("");
            } else if (value.length >= 3) {
                onSearchChange(value, selectedOption); 
                setSearchTerm(value); 
            }
        }, 300); 

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
                    <Icon name="filter" className={iconClass} />
                    <span className="filter-text">Filtro</span>
                </button>
            </div>

            <div className={searchBoxClass}>
                <Icon name="search" className="search-client-icon" />
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
