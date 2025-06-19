import React from "react";
import "../styles/ResultItem.css";
import Icon from "../components/Icons";

const clientIcon = process.env.PUBLIC_URL + "/images/icons/userIcon-gray.png";


const ResultItem = ({ type, data, onClickMain, onClickEye, flagIcon, eyeIcon, icons = {}, extra = {} }) => {

    const { receiptIcon, statusColors = {} } = icons;

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
                            <img className="icon-vehicle" src={data.iconSrc} alt="Icon Vehicle" />
                        </div>
                        <div className="div-label">
                            <label>{data.client_name}</label>
                        </div>

                    </div>

                    <div className="third-result-car">
                        <button className="button-eye" onClick={e => { e.stopPropagation(); onClickEye(data, e); }}>
                            <img src={eyeIcon} alt="Eye Icon Car" className="icon-eye" />
                        </button>
                    </div>
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

                    <div className="second-result-client">
                        <button className="button-eye" onClick={(e) => { e.stopPropagation(); onClickEye(data.client.id, e); }}>
                            <img src={eyeIcon} alt="Eye Icon" className="icon-eye" />
                        </button>
                    </div>
                </>
            )}

            {type === "work-order" && (
                <>
                    <div className="first-result-work-orders">
                        <div className="div-label-work-order-code">
                            <label>{data.work_order_code}</label>
                        </div>
                        <div className="div-label-work-order-client">
                            <label>{data.client_name}</label>
                        </div>
                    </div>

                    <div className="second-result-work-order">
                        <div className="input-plate-container-work-order">
                            <input
                                className="input-plate-vehicle-work-order"
                                type="text"
                                value={data.vehicle_plate}
                                readOnly
                            />
                            <img src={flagIcon} alt="Flag" className="ecuador-icon" />
                            <label>ECUADOR</label>
                        </div>
                    </div>

                    <div className="third-result-work-order">
                        <div className="div-label-status">
                            <label style={{ color: statusColors[data.work_order_status] }}>
                                {data.work_order_status}
                            </label>
                        </div>
                        <div className="div-label-date">
                            <label>{data.date_start}</label>
                        </div>
                    </div>

                    {data.work_order_status === "Completada" && !data.is_billed && (
                        <div className="fourth-result-work-order">
                            <div className="div-image-receipt">
                                <img
                                    src={receiptIcon}
                                    alt="Receipt Icon"
                                    className="payment-receipt-icon"
                                    style={{ width: "20px", height: "20px" }}
                                />
                            </div>
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

                    <div className="operation-eye-section">
                        <button className="button-eye-operation" onClick={onClickEye}>
                            <img src={eyeIcon} alt="Eye Icon" className="icon-eye-operation" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ResultItem;