import "../TitleAndSearchBox.css"
import React from "react";

const searchIcon = process.env.PUBLIC_URL + "/images/icons/searchIcon.png";
const filterIcon = process.env.PUBLIC_URL + "/images/icons/filterIcon.png";

const TitleAndSearchBox = ({ title, onSearchChange, onButtonClick }) => {
    return (
        <div>
            <div className="container-title">
                <h2>{title}</h2>
                <button className="button-filter" onClick={onButtonClick}>
                    <img src={filterIcon} alt="Filter Icon" className="filter-icon" />
                    <span className="filter-text">Filtro</span>
                </button>
            </div>

            <div className="search-box">
                <img src={searchIcon} alt="Search Icon" className="search-icon" />
                <input
                    type="text"
                    className="input-search"
                    onChange={e => onSearchChange(e.target.value)}
                />
            </div>

        </div>

    )
};

export default TitleAndSearchBox;