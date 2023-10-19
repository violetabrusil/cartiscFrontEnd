import "../Menu.css";
import React, { useState, useEffect, useMemo, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const menuButton = process.env.PUBLIC_URL + "/images/icons/menu-button.png";
const logo = process.env.PUBLIC_URL + "/images/cartics-black.png";
const logoClose = process.env.PUBLIC_URL + "/images/cartics-icon.png";
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

const Menu = ({ resetFunction, onInventoryClick }) => {

    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(null);
    const { user } = useContext(AuthContext);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
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

    return (
        <div className="Menu">
            <div className={`menu-lateral ${isOpen ? "open" : ""}`}
                onMouseEnter={() => setIsOpen(false)}
                onMouseLeave={() => setIsOpen(true)}
            >
                {menuOptions.map((option, index) => (
                    <Link
                        to={option.path}
                        key={index}
                        className={`opcion-container ${activeIndex === index ? "active" : ""}`}
                        onClick={() => {
                            if (option.path === "/inventory") {
                                if (onInventoryClick) onInventoryClick();
                                console.log("Icono de Inventario presionado");
                            } else {
                                if (resetFunction) resetFunction();
                            }
                        }}
                    >
                        <span className="opcion-container">
                            <span className="icono">
                                <img src={activeIndex === index ? option.iconSelected : option.icon} alt="ClientIcon" />
                            </span>
                            <span className="texto" style={option.labelStyle}>{option.label}</span>
                        </span>

                    </Link>
                ))}

                <img src={isOpen ? logoClose : logo} alt="Logo Vertical" className="imagen-vertical" />

                {!isOpen && (
                    <div className="icono-menu">
                        <button className="button-menu" onClick={toggleMenu}>
                            <img src={menuButton} alt="Menu" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Menu;
