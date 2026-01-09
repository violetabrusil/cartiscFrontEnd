import React from "react";
import "../styles/ResultItem.css";
import Icon from "../components/Icons";

const ResultItem = ({ type, data, onClickMain, onClickEye, flagIcon, showEye = true }) => {

    const iconMap = {
        car: "car",
        van: "van",
        bus: "bus",
        truck: "truck",
        suv: "suv",
    };

    return (
        <div className={`result-item result--${type}`} onClick={onClickMain}>

            {type === "car" && (
                <>
                    <div className="first-result-car">
                        <div className="input-plate-container">
                            <div className="plate-header">
                                <img src={flagIcon} alt="flag" className="ecuador-icon" />
                                <label>ECUADOR</label>
                            </div>
                            <input
                                className="input-plate-vehicle"
                                type="text"
                                value={data.plate}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="second-result-car">
                        <div className="div-icon-vehicle">
                            <Icon name={iconMap[data.category]} className="icon-vehicle" />
                        </div>
                        <div className="div-label">
                            <label>{data.client_name}</label>
                        </div>

                    </div>

                    {showEye && (
                        <div className="third-result-car">
                            <button className="button-eye" onClick={e => { e.stopPropagation(); onClickEye(data, e); }}>
                                <Icon name="eye" className="icon-eye" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {type === "client" && (
                <>
                    <div className="first-result-client">
                        <Icon name="client" className="icon-client" />
                        <div className="container-data">
                            <label className="name-client">{data.client.name}</label>
                            <label className="id-client">{data.client.cedula}</label>
                        </div>
                    </div>

                    {showEye && (
                        <div className="second-result-client">
                            <button className="button-eye" onClick={(e) => { e.stopPropagation(); onClickEye(data.client.id, e); }}>
                                <Icon name="eye" className="icon-eye" />
                            </button>
                        </div>

                    )}


                </>
            )}

            {["operation", "service"].includes(type) && (
                <>
                    <div className="operation-code-section">
                        <label className="operation-code">
                            {data.operation_code || data.service_code}
                        </label>
                    </div>

                    <div className="operation-name-section">
                        <label className="operation-name">
                            {data.title || data.service_title}
                        </label>
                    </div>

                    {showEye && (
                        <div className="operation-eye-section">
                            <button className="button-eye" onClick={onClickEye}>
                                <Icon name="eye" className="icon-eye" />
                            </button>
                        </div>
                    )}

                </>
            )}

            {type === "supplier" && (
                <>
                    <div className="operation-code-section">
                        <label className="operation-code">
                            {data.supplier_code}
                        </label>
                    </div>

                    <div className="operation-name-section">
                        <label className="operation-name">
                            {data.name}
                        </label>
                    </div>

                    {showEye && (
                        <div className="operation-eye-section">
                            <button className="button-eye" onClick={onClickEye}>
                                <Icon name="eye" className="icon-eye" />
                            </button>
                        </div>
                    )}

                </>
            )}

        </div>
    );
};

export default ResultItem;