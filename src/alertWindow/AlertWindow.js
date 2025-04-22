import React from "react";
import "../alertWindow/AlertWindow.css";

const image = process.env.PUBLIC_URL + "/images/chispita.png";

const AlertWindow = ({ title, message, onConfirm, fullScreen = false }) => {

    return (
        <div className="alert-window-overlay">

            <div className={`alert-window-content ${fullScreen ? "all" : ""}`}>
                <div className="alert-window-left">
                    <img src={image} alt="Chispita" className="alert-window-image" />

                </div>
                <div className="alert-window-right">
                    <div className="alert-window-title">
                        {title}
                    </div>
                    <div className="alert-window-right-container">
                        <div className="alert-window-text">
                            {message}
                        </div>
                        <div>
                            <button className="alert-window-button" onClick={onConfirm}>
                                Aceptar
                            </button>

                        </div>

                    </div>
                </div>
            </div>


        </div>
    )

};

export default AlertWindow;