import "../styles/SearchBarFilter.css";
import React, { useState, useEffect } from "react";
import { useWorkOrderContext } from "../contexts/searchContext/WorkOrderContext";
import Icon from "../components/Icons";

const SearchBarFilter = ({
    onSearchChange,
    onButtonClick,
    selectedOption,
    shouldSaveSearch,
    className = "" }) => {

    const { searchTerm, setSearchTerm } = useWorkOrderContext();
    const [searchInput, setSearchInput] = useState(searchTerm || "");
    const [debounceTimeout, setDebounceTimeout] = useState(null);

    let placeholder = `Buscar por ${selectedOption}`;

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
    }, searchTerm);

    return (
        <div div className={`search-bar-filter-container ${className}`}>
            <div className="input-wrapper">
                <Icon name="search" className="input-icon-left" />

                <input
                    type="text"
                    className="search-input"
                    value={searchInput}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                />

                <button className="filter-button-inside" onClick={onButtonClick}>
                    <Icon name="filter" className="input-icon-right" />
                </button>
            </div>
        </div>
    )
};

export default SearchBarFilter;