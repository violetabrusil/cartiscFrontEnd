import 'react-toastify/dist/ReactToastify.css';
import "../../NewWorkOrder.css";
import "../../InformationWorkOrder.css";
import "../../Modal.css";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useParams } from "react-router-dom";
import DatePicker from 'react-datepicker';
import Header from "../../header/Header";
import Menu from "../../menu/Menu";
import VehiclePlans from "../../vehicle-plans/VehiclePlans";

const arrowIcon = process.env.PUBLIC_URL + "/images/icons/arrowIcon.png";
const fuelIcon = process.env.PUBLIC_URL + "/images/icons/fuelIcon.png";
const addIcon = process.env.PUBLIC_URL + "/images/icons/addIcon.png";
const closeIcon = process.env.PUBLIC_URL + "/images/icons/closeIcon.png";

const InformationWorkOrder = () => {

    const [visibleSections, setVisibleSections] = useState({});
    const [iconRotated, setIconRotated] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleComponentes = (sectionId) => {
        setVisibleSections(prevSections => ({
            ...prevSections,
            [sectionId]: !prevSections[sectionId]
        }));
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const { workOrderId } = useParams();

    return (
        <div>

            <ToastContainer />

            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />

            <div className="new-work-order-general-container">
                <div className="new-work-order-title-container">
                    <h2>Detalle Orden de Trabajo</h2>
                    <button className="confirm-button" >
                        <span className="text-confirm-button ">Confirmar</span>
                    </button>
                </div>

                <div className="client-search-container">
                    <div className="left-div">
                        <div style={{ marginLeft: '30px', marginRight: '30px', marginTop: '10px' }}>

                            <h2>Cliente</h2>

                            <div className="label-container">
                                <label className="label-title">Nombre:</label>
                                <label className="label-input"></label>
                            </div>
                            <div className="label-container">
                                <label className="label-title">Cédula:</label>
                                <label className="label-input"></label>
                            </div>
                            <div className="label-container">
                                <label className="label-title">Dirección:</label>
                                <label className="label-input"></label>
                            </div>
                            <div className="label-container">
                                <label className="label-title">Teléfono:</label>
                                <label className="label-input"></label>
                            </div>
                            <div className="label-container">
                                <label className="label-title">Correo:</label>
                                <label className="label-input"></label>
                            </div>

                        </div>
                    </div>

                    <div className="right-div-container">
                        <div className="right-div">
                            <div className='div-information-vehicle'>

                                <div style={{ display: 'flex' }}>
                                    <div>
                                        <label>Placa:</label>
                                        <label></label>
                                    </div>
                                    <div>
                                        <label>Categoría:</label>
                                        <label></label>
                                    </div>
                                    <div>
                                        <label>Marca:</label>
                                        <label></label>
                                    </div>

                                </div>

                                <div style={{ display: 'flex' }}>
                                    <div>
                                        <label>Modelo:</label>
                                        <label></label>
                                    </div>
                                    <div>
                                        <label>Año:</label>
                                        <label></label>
                                    </div>
                                    <div>
                                        <label>Kilometraje:</label>
                                        <label></label>
                                    </div>
                                </div>


                            </div>

                        </div>

                        <div className="right-div">
                            <div className="container-fields-new-work-order">
                                <div className="input-group-work-order">
                                    <label>Fecha de inicio:</label>
                                    <label></label>
                                </div>

                                <div className="input-group-work-order">
                                    <label>Creada por</label>
                                    <label></label>
                                </div>

                                <div className="input-group-work-order">
                                    <label>Asignada a</label>
                                    <label></label>
                                </div>

                            </div>
                            <div className="container-div-comments" >
                                <div className="input-group-work-order">
                                    <label>Fecha de fin</label>
                                    <label></label>
                                </div>

                                <div className="input-group-work-order">
                                    <label>Entregada por</label>
                                    <label></label>
                                </div>

                                <div className="input-group-work-order">
                                    <label>Total</label>
                                    <label></label>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>

                <div className="title-second-section-container">
                    <h3>Comentarios</h3>
                    <button onClick={() => toggleComponentes('comments')} className="button-toggle">
                        <img
                            src={arrowIcon}
                            alt="Icono"
                            className={`icon ${iconRotated ? 'rotated' : ''}`}
                        />
                    </button>
                </div>

                {/* Renderización condicional para mostrar/ocultar la sección de comentarios */}
                {visibleSections['comments'] && (
                    <div className="comments-section">
                        <textarea></textarea>
                    </div>
                )}

                <div className="title-second-section-container">
                    <h3>Estado de Entrega</h3>
                    <button className="button-toggle" onClick={() => toggleComponentes('state')}>
                        <img
                            src={arrowIcon}
                            alt="Icono"
                            className={`icon ${iconRotated ? 'rotated' : ''}`}
                        />
                    </button>
                </div>

                {visibleSections['state'] && (
                    <>
                        <div className="checkbox-container">
                            {/*
                      {Object.keys(selections).map((group) => (
                            <div key={group} className="checkbox-group">
                                {selections[group].map((isChecked, index) => (
                                    optionsCheckBox[group][index] !== 'Gas' ? (
                                        <label key={index}>
                                            {optionsCheckBox[group][index]}
                                            <input
                                                type="checkbox"
                                            />
                                        </label>
                                    ) : (
                                        <div key={index}>
                                            <img src={fuelIcon} alt="Fuel Icon" className="fuel-icon" />
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                
                                            />
                                            {' %'}
                                        </div>
                                    )
                                ))}

                            </div>
                        ))} */}
                        </div>
                        <div className="second-container">

                            <div className="half-second-container">
                                <h3>Síntomas presentados</h3>
                                <div className="content-new-work-order">
                                    <div
                                        contentEditable
                                        suppressContentEditableWarning
                                    //onKeyDown={handleKeyPress}
                                    //className={`editable-container ${symptoms.length ? '' : 'placeholder'}`}
                                    // onFocus={() => setPlaceholder("")}

                                    >

                                    </div>

                                    <div className="list-sypmtoms-container" >
                                        {/* 
                                  <ul>
                                        {symptoms.map((item, index) => (
                                            <li key={index}
                                                //ref={index === symptoms.length - 1 ? symptomsEndRef : null}
                                                contentEditable
                                                suppressContentEditableWarning
                                                //onBlur={(e) => handleUpdateSymptom(index, e.currentTarget.textContent)}
                                            >
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    */}
                                    </div>
                                </div>
                            </div>

                            <div className="half-second-container">
                                <h3>Observaciones generales</h3>
                                <div className="content-new-work-order">
                                    <textarea
                                        className="textarea-class"
                                    >

                                    </textarea>
                                </div>
                            </div>

                        </div>

                        <div className="title-second-section-container">
                            <h3>Puntos de interés</h3>
                        </div>

                        <VehiclePlans

                        />

                    </>
                )
                }

                <div className="title-second-section-container">
                    <h3>Repuestos</h3>
                    <button className="button-toggle" onClick={() => toggleComponentes('products')}>
                        <img
                            src={arrowIcon}
                            alt="Icono"
                            className={`icon ${iconRotated ? 'rotated' : ''}`}
                        />
                    </button>
                </div>

                {visibleSections['products'] && (
                    <>
                        <div className="div-products">

                            <img
                                className="icon-container"
                                src={addIcon}
                                alt="Open Modal"
                                onClick={handleOpenModal}
                            />

                        </div>
                    </>

                )}
                <div className="title-second-section-container">
                    <h3>Servicios/Operaciones</h3>
                    <button className="button-toggle" onClick={() => toggleComponentes('products')}>
                        <img
                            src={arrowIcon}
                            alt="Icono"
                            className={`icon ${iconRotated ? 'rotated' : ''}`}
                        />
                    </button>
                </div>



            </div >
            {isModalOpen && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal">
                        <button style={{ marginTop: '16px' }} className="button-close-modal" onClick={handleCloseModal}  >
                            <img src={closeIcon} alt="Close Icon" className="modal-close-icon"></img>
                        </button>

                    </div>
                </div>
            )}



        </div >
    );

};

export default InformationWorkOrder;
