import "../ModalNewClient.css";
import React from "react";

function ModalNewClient({ primaryMessage, secondaryMessage, handleNo, handleYes, icon, modalType }) {
    console.log(modalType);
    return (
        <div className="filter-modal-new-client-overlay">
            <div className="filter-modal-new-client">
                {icon && <img src={icon} alt="Icono" className="modal-icon" />}
                <h3>{primaryMessage}</h3>
                {secondaryMessage && <p>{secondaryMessage}</p>}
                <div className="button-options-new-client">
                    {modalType === 'success' && (
                        <>
                            <div className="half-new-client">
                                <button className="optionNo-button-modal-new-client" onClick={handleNo}>
                                    No
                                </button>
                            </div>
                            <div className="half-new-client">
                                <button className="optionYes-button-modal-new-client" onClick={handleYes}>
                                    Si
                                </button>
                            </div>
                        </>
                    )}
                    {modalType === 'error' && (
                        <>
                            <div className="half-new-client">
                                <button className="optionYes-button-modal-new-client" onClick={handleYes}>
                                    Aceptar
                                </button>
                            </div></>

                    )}

                </div>
            </div>
        </div>

    )
};

export default ModalNewClient;


