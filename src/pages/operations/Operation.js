import "../../Operation.css";
import React, { useState } from "react";
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import TitleAndSearchBox from "../../titleAndSearchBox/TitleAndSearchBox";
import Modal from "../../modal/Modal";

const deleteIcon = process.env.PUBLIC_URL + "/images/icons/deleteIcon.png";

const Operation = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [showAddOperation, setShowAddOperation] = useState(true);
    const [showEditOperation, setShowEditOperation] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleSearchOperationChange = (newSearchTerm) => {
        setSearchTerm(newSearchTerm);
    };

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const handleSelectClick = () => {
        // Aquí se puede manejar la opción seleccionada.
        console.log(selectedOption);

        // Cerrar el modal después de seleccionar.
        closeFilterModal();
    };

    const handleEditOperation = (event) => {
        event.stopPropagation();
        setShowEditOperation(true);
        setShowAddOperation(false);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    }

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser="Name User" showRol="Rol" />
            <Menu />

            <div className="container-operations">
                <div className="left-section">
                    {/*Título del contenedor y buscador */}
                    <TitleAndSearchBox
                        title="Operaciones"
                        onSearchChange={handleSearchOperationChange}
                        onButtonClick={openFilterModal}
                    />

                    <div className="result-operation" onClick={handleEditOperation}>
                        <label className="title-operation">Encerar</label>

                    </div>


                </div>
                <div className="right-section">

                    {showAddOperation && (
                        <div className="container-general-operation">

                            <div className="container-title-add-operation">
                                <h2>Agregar Operación</h2>
                            </div>

                            <div className="container-new-operation">

                                <div className="row-operation">
                                    <label>Título</label>
                                    <input />
                                </div>

                                <div className="row-operation">
                                    <label>Costo</label>
                                    <input />
                                </div>

                            </div>

                            <div className="container-operation-buttons">
                                <button className="accept-button" style={{ marginRight: "10px" }}>
                                    <span className="text-button-operation">Aceptar</span>
                                </button>
                            </div>

                        </div>
                    )}

                    {showEditOperation && (
                        <div className="container-general-operation">

                            <div className="container-title-add-operation">
                                <h2>Operación</h2>
                                <button className="delete-operation-button">
                                <img src={deleteIcon} alt="Delete Operation Icon" className="delete-icon-operation" />
                            </button>
                            </div>

                            <div className="container-new-operation">

                                <div className="row-operation">
                                    <label>Título</label>
                                    <input disabled={!isEditing} />
                                </div>

                                <div className="row-operation">
                                    <label>Costo</label>
                                    <input disabled={!isEditing} />
                                </div>

                            </div>

                            <div className="container-operation-buttons">
                            <button className="edit-button" style={{ marginRight: "10px" }} onClick={handleEditClick}>
                                    <span className="text-button-operation">Editar</span>
                                </button>
                                <button className={`button ${isEditing ? 'accept-button' : 'accept-button-disabled'}`} style={{ marginLeft: "10px" }} >
                                    <span className="text-button-operation">Aceptar</span>
                                </button>
                            </div>

                        </div>

                    )}




                </div>
            </div>

            {/*Modal del filtro de búsqueda */}

            {isFilterModalOpen && (
                <Modal
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    options={['Título', 'Nombre', 'Código']}
                    onOptionChange={handleOptionChange}
                    onSelect={handleSelectClick}
                />
            )}
        </div>
    )


};

export default Operation;