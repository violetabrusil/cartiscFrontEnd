import "../Menu.css";
import React, { useState, useEffect, useMemo, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const arrowLeftIcon = process.env.PUBLIC_URL + "/images/icons/arrowLeftIconGray.png";
const arrowRightIcon = process.env.PUBLIC_URL + "/images/icons/arrowRightIconBlue.png";
const settingsIconGray = process.env.PUBLIC_URL + "/images/icons/settingsIcon-gray.png";
const settingsIconBlue = process.env.PUBLIC_URL + "/images/icons/settingsIcon-blue.png";
const homeIconGray = process.env.PUBLIC_URL + "/images/icons/homeIcon-gray.png";
const homeIconBlue = process.env.PUBLIC_URL + "/images/icons/homeIcon-blue.png";
const userIconGray = process.env.PUBLIC_URL + "/images/icons/userIcon-gray.png";
const userIconBlue = process.env.PUBLIC_URL + "/images/icons/userIcon-blue.png";
const carIconGray = process.env.PUBLIC_URL + "/images/icons/carIcon-gray.png";
const carIconBlue = process.env.PUBLIC_URL + "/images/icons/carIcon-blue.png";
const workOrderIconGray = process.env.PUBLIC_URL + "/images/icons/workOrderIcon-gray.png";
const workOrderIconBlue = process.env.PUBLIC_URL + "/images/icons/workOrderIcon-blue.png";
const serviceIconGray = process.env.PUBLIC_URL + "/images/icons/serviceIcon-gray.png";
const serviceIconBlue = process.env.PUBLIC_URL + "/images/icons/serviceIcon-blue.png";
const supplierIconGray = process.env.PUBLIC_URL + "/images/icons/supplierIcon-gray.png";
const supplierIconBlue = process.env.PUBLIC_URL + "/images/icons/supplierIcon-blue.png";
const inventoryIconGray = process.env.PUBLIC_URL + "/images/icons/inventoryIcon-gray.png";
const inventoryIconBlue = process.env.PUBLIC_URL + "/images/icons/inventoryIcon-blue.png";
const paymentIconGray = process.env.PUBLIC_URL + "/images/icons/paymentIcon-gray.png";
const paymentIconBlue = process.env.PUBLIC_URL + "/images/icons/paymentIcon-blue.png";
const proformaIconBlue = process.env.PUBLIC_URL + "/images/icons/proformaIcon-blue.png";
const proformaIconGray = process.env.PUBLIC_URL + "/images/icons/proformaIcon-gray.png";

const Menu = ({ resetFunction, onInventoryClick }) => {

    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(null);
    const [manualToggle, setManualToggle] = useState(false);

    const { user } = useContext(AuthContext);

    const toggleMenu = () => {
        setManualToggle(true);
        setIsOpen(prevIsOpen => !prevIsOpen);
    };

    const handleImageClick = () => {
        setManualToggle(true);
        setIsOpen(false);
    };


    const menuOptions = useMemo(() => {

        let commonOptions = [
            { path: "/home", icon: homeIconGray, iconSelected: homeIconBlue, label: "Home", labelStyle: { marginTop: "12px" } },
            { path: "/clients", icon: userIconGray, iconSelected: userIconBlue, label: "Clientes", labelStyle: { marginTop: "15px" } },
            { path: "/cars", icon: carIconGray, iconSelected: carIconBlue, label: "Vehículos", labelStyle: { marginTop: "12px" } },
            { path: "/services", icon: serviceIconGray, iconSelected: serviceIconBlue, label: "Servicios y operaciones", labelStyle: { marginTop: "12px" } },
            { path: "/suppliers", icon: supplierIconGray, iconSelected: supplierIconBlue, label: "Proveedores", labelStyle: { marginTop: "12px" } },
            { path: "/inventory", icon: inventoryIconGray, iconSelected: inventoryIconBlue, label: "Inventario", labelStyle: { marginTop: "10px" }, },
            { path: "/workOrders", icon: workOrderIconGray, iconSelected: workOrderIconBlue, label: "Órdenes de trabajo", labelStyle: { marginTop: "12px" } },
            { path: "/paymentReceipt", icon: paymentIconGray, iconSelected: paymentIconBlue, label: "Comprobantes de pago", labelStyle: { marginTop: "12px" } },
            //{ path: '/proformas', icon: proformaIconGray, iconSelected: proformaIconBlue, label: "Proformas", labelStyle: { marginTop: "10px" } }
        ];

        if (user && user.translated_user_type === "Administrador") {
            return [
                { path: "/settings", icon: settingsIconGray, iconSelected: settingsIconBlue, label: "Configuración ", labelStyle: { marginTop: "12px" } },
                ...commonOptions
            ];
        }

        return commonOptions;
    }, [user]);

    useEffect(() => {
        const currentPath = location.pathname;
        const foundIndex = menuOptions.findIndex((option) => currentPath.startsWith(option.path));
        setActiveIndex(foundIndex);
    }, [location.pathname, menuOptions]);

    const configOption = menuOptions.find(option => option.path === "/settings");
    const mainOptions = menuOptions.filter(option => option.path !== "/settings");

    return (
        <div className="Menu">
            <div
                className={`menu-lateral ${isOpen ? "open" : "closed"}`}
                onMouseEnter={() => {
                    if (!manualToggle) setIsOpen(true);
                }}
                onMouseLeave={() => {
                    if (!manualToggle) setIsOpen(false);
                }}
            >
                <div className="options-top-menu">
                    {mainOptions.map((option, index) => (
                        <Link
                            to={option.path}
                            key={index}
                            className={`opcion-container ${activeIndex === menuOptions.findIndex(o => o.path === option.path) ? "active" : ""}`}
                            onClick={() => {
                                if (option.path === "/inventory") {
                                    if (onInventoryClick) onInventoryClick();
                                } else {
                                    if (resetFunction) resetFunction();
                                }
                            }}
                        >
                            <div className="opcion-content">
                                <span className="icono">
                                    <img
                                        src={activeIndex === menuOptions.findIndex(o => o.path === option.path) ? option.iconSelected : option.icon}
                                        alt={option.label}
                                    />
                                </span>
                                <span className="texto">{option.label}</span>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="options-bottom-menu">
                    {configOption && (
                        <Link
                            to={configOption.path}
                            className={`opcion-container ${activeIndex === menuOptions.findIndex(o => o.path === configOption.path) ? "active" : ""}`}
                            onClick={() => {
                                if (resetFunction) resetFunction();
                            }}
                        >
                            <div className="opcion-content">
                                <span className="icono">
                                    <img
                                        src={activeIndex === menuOptions.findIndex(o => o.path === configOption.path) ? configOption.iconSelected : configOption.icon}
                                        alt={configOption.label}
                                    />
                                </span>
                                <span className="texto">{configOption.label}</span>
                            </div>
                        </Link>
                    )}

                    <div className="icono-menu">
               
                        <button className="button-menu" onClick={toggleMenu}>
                            <img
                                src={isOpen ? arrowLeftIcon : arrowRightIcon}
                                alt="Toggle menu"
                            />
                            {isOpen && <span className={`button-menu-text ${isOpen ? 'visible' : ''}`}>Cerrar menú</span>}
                        </button>
                    </div>

                </div>




            </div>
        </div>

    );
};

export default Menu;
