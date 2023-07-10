import "../../Car.css";
import "../../Modal.css";
import React, { useState } from "react";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import filterIcon from "../../images/icons/filterIcon.png";
import searchIcon from "../../images/icons/searchIcon.png";
import eyeIcon from "../../images/icons/eyeIcon.png";

const Cars = () => {
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [showCarInformarion, setShowCarInformation] = useState(false);
    const [showCarHistory, setShowCarHistory] = useState(false);

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const handleCarHistory = (event) => {
        event.stopPropagation();
        setShowCarHistory(true);
    }

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser="Name User" showRol="Rol" />
            <Menu />

            <div className="containerCars">
                <div className="left-section">
                    {/*Título del contenedor */}
                    <div className="containerTitle-car">
                        <h2>Autos</h2>
                        <button className="button-filter-car" onClick={openFilterModal}>
                            <img src={filterIcon} alt="Filter Car Icon" className="button-icon-car" />
                            <span className="button-text-car">Filtro</span>
                        </button>
                    </div>
                    {/*Buscador */}
                    <div className="search-car-box">
                        <img src={searchIcon} alt="Search Car Icon" className="search-car-icon" />
                        <input type="text" className="search-car-input"></input>
                    </div>
                    {/*Lista de vehículos */}
                    <div className="result-car">
                        <div className="first-result-car">
                            <label>PJL-568</label>
                        </div>
                        <div className="second-result-car">
                            <label>Daniel Taco</label>
                        </div>
                        <div className="third-result-car">
                            <button className="button-eye-car">
                                <img src={eyeIcon} alt="Eye Icon Car" className="icon-eye-car" />
                            </button>
                        </div>

                    </div>


                </div>

                <div className="right-section">
                    {showCarHistory && (
                        <div></div>
                    )}

                </div>

                {/*Modal del filtro de búsqueda*/}

                {isFilterModalOpen && (
                    <div className="filter-modal-overlay">
                        <div className="filter-modal">
                            <h3>Seleccione el filtro a buscar</h3>
                            <div className="filter-options">
                                <label>
                                    <input type="radio" name="filter" value="cedula" />
                                    Placa
                                </label>
                                <label>
                                    <input type="radio" name="filter" value="nombre" />
                                    Nombre Titular
                                </label>
                            </div>
                            <button className="modal-button" onClick={closeFilterModal}>
                                Seleccionar
                            </button>
                        </div>
                    </div>
                )}

            </div>

        </div>
    )

};

export default Cars;



