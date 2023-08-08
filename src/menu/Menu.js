import "../Menu.css";
import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

const menuButton = process.env.PUBLIC_URL + "/images/icons/menu-button.png";
const logo = process.env.PUBLIC_URL + "/images/cartics-black.png";
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
const inventoryIconGray = process.env.PUBLIC_URL + "/images/icons/inventoryIcon-gray.png";
const inventoryIconBlue = process.env.PUBLIC_URL + "/images/icons/inventoryIcon-blue.png";
const paymentIconGray = process.env.PUBLIC_URL + "/images/icons/paymentIcon-gray.png";
const paymentIconBlue = process.env.PUBLIC_URL + "/images/icons/paymentIcon-blue.png";

const Menu = () => {

    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const menuOptions = useMemo(() => [
        { path: "/home", icon: homeIconGray, iconSelected: homeIconBlue, label: "Home" },
        { path: "/clients", icon: userIconGray, iconSelected: userIconBlue, label: "Clientes" },
        { path: "/cars", icon: carIconGray, iconSelected: carIconBlue, label: "Vehículos" },
        { path: "/workOrders", icon: workOrderIconGray, iconSelected: workOrderIconBlue, label: "Órdenes de trabajo" },
        { path: "/services", icon: serviceIconGray, iconSelected: serviceIconBlue, label: "Servicios y operaciones" },
        { path: "/inventory", icon: inventoryIconGray, iconSelected: inventoryIconBlue, label: "Inventario" },
        { path: "/paymentReceipt", icon: paymentIconGray, iconSelected: paymentIconBlue, label: "Comprobantes de pago" },
    ], []);

    useEffect(() => {
        const currentPath = location.pathname;
        const foundIndex = menuOptions.findIndex((option) => currentPath.startsWith(option.path));
        setActiveIndex(foundIndex);
    }, [location.pathname, menuOptions]);

    return (
        <div className="Menu">
            <div className={`menu-lateral ${isOpen ? "open" : ""}`}>
                {menuOptions.map((option, index) => (
                    <Link
                        to={option.path}
                        key={index}
                        className={`opcion-container ${activeIndex === index ? "active" : ""}`}
                        onClick={() => setActiveIndex(index)}
                    >
                        <span className="opcion-container">
                            <span className="icono">
                                <img src={activeIndex === index ? option.iconSelected : option.icon} alt="ClientIcon" />
                            </span>
                            <span className="texto" style={option.labelStyle}>{option.label}</span>
                        </span>

                    </Link>
                ))}

                <img src={logo} alt="Logo Vertical" className="imagen-vertical" />

                <div className={`icono-menu ${isOpen ? "open" : ""}`}>
                    <button className="button-menu" onClick={toggleMenu}>
                        <img src={isOpen ? menuButton : menuButton} alt="Menu" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Menu;
