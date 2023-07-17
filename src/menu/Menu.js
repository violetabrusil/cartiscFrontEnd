import "../Menu.css";
import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import menuButton from "../images/icons/menu-button.png";
import logo from "../images/cartics-black.png";
import userIconGray from "../images/icons/userIcon-gray.png";
import userIconBlue from "../images/icons/userIcon-blue.png";
import carIconGray from "../images/icons/carIcon-gray.png";
import carIconBlue from "../images/icons/carIcon-blue.png";
import workOrderIconGray from "../images/icons/workOrderIcon-gray.png";
import workOrderIconBlue from "../images/icons/workOrderIcon-blue.png";
import serviceIconGray from "../images/icons/serviceIcon-gray.png";
import serviceIconBlue from "../images/icons/serviceIcon-blue.png";
import inventoryIconGray from "../images/icons/inventoryIcon-gray.png";
import inventoryIconBlue from "../images/icons/inventoryIcon-blue.png";

const Menu = () => {

    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const menuOptions = useMemo(() => [
        { path: "/clients", icon: userIconGray, iconSelected: userIconBlue, label: "Clientes", labelStyle: { marginTop: "16px" } },
        { path: "/cars", icon: carIconGray, iconSelected: carIconBlue, label: "Vehículos", labelStyle: { marginTop: "10px" } },
        { path: "/", icon: workOrderIconGray, iconSelected: workOrderIconBlue, label: "Órdenes de trabajo", labelStyle: { marginTop: "8px" } },
        { path: "/services", icon: serviceIconGray, iconSelected: serviceIconBlue, label: "Servicios y operaciones", labelStyle: { marginTop: "8px" } },
        { path: "/inventory", icon: inventoryIconGray, iconSelected: inventoryIconBlue, label: "Inventario", labelStyle: { marginTop: "8px" } },
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
