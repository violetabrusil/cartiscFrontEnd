import "../Modal.css"
import React, { useState } from "react";

const Modal = ({ options, onSelect, defaultOption  }) => {

    const [selectedOption, setSelectedOption] = useState(defaultOption || null);

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleButtonClick = () => {
        onSelect(selectedOption)
    };

    return (

        <div className="filter-modal-overlay">
            <div className="filter-modal">
                <h3>Seleccione el filtro a buscar</h3>
                {options.map(option => (
                    <div key={option} className="filter-options">
                        <input
                            type="radio"
                            id={option}
                            value={option}
                            name="filterOption"
                            onChange={handleOptionChange}
                            checked={option === selectedOption}
                        />
                        <label htmlFor={option}>{option}</label>
                    </div>
                ))}
                <button onClick={handleButtonClick} className="modal-button">Seleccionar</button>
            </div>
        </div>
    );

};

export default Modal;