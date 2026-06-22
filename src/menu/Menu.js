import "../Menu.css";
import React, { useState, useEffect, useMemo, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useSales } from "../contexts/searchContext/SalesContext";

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
const proformaIconBlue = process.env.PUBLIC_URL + "/images/icons/proformaIcon-blue.png";
const proformaIconGray = process.env.PUBLIC_URL + "/images/icons/proformaIcon-gray.png";

const Menu = ({ resetFunction, onInventoryClick }) => {

    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(null);
    const [manualToggle, setManualToggle] = useState(false);
    const [openSubmenuIndex, setOpenSubmenuIndex] = useState(null);
    const [isTabletLandscape, setIsTabletLandscape] = useState(
        window.matchMedia("(min-width: 800px) and (max-width: 1340px)").matches
    );
    const { resetAllFilters } = useSales();

    const { user } = useContext(AuthContext);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 800px) and (max-width: 1340px)");

        const handleMediaChange = (e) => {
            console.log("Media query changed:", e.matches);
            setIsTabletLandscape(e.matches);
        };

        console.log("Initial media query match:", mediaQuery.matches, `${window.innerWidth}x${window.innerHeight}`);
        setIsTabletLandscape(mediaQuery.matches);
        mediaQuery.addEventListener("change", handleMediaChange);

        return () => mediaQuery.removeEventListener("change", handleMediaChange);
    }, []);

    const toggleMenu = () => {
        setManualToggle(prev => !prev);
        setIsOpen(prev => !prev);
    };

    const handleImageClick = () => {
        setManualToggle(true);
        setIsOpen(false);
        setOpenSubmenuIndex(null);
    };

    const menuOptions = useMemo(() => {

        let commonOptions = [
            { path: "/home", icon: homeIconGray, iconSelected: homeIconBlue, label: "Home", labelStyle: { marginTop: "12px" } },
            { path: "/clients", icon: userIconGray, iconSelected: userIconBlue, label: "Clientes", labelStyle: { marginTop: "15px" } },
            { path: "/cars", icon: carIconGray, iconSelected: carIconBlue, label: "Vehículos", labelStyle: { marginTop: "12px" } },
            { path: "/services", icon: serviceIconGray, iconSelected: serviceIconBlue, label: "Servicios y operaciones", labelStyle: { marginTop: "12px" } },
            { path: "/suppliers", icon: supplierIconGray, iconSelected: supplierIconBlue, label: "Proveedores", labelStyle: { marginTop: "12px" } },
            { path: "/inventory", icon: inventoryIconGray, iconSelected: inventoryIconBlue, label: "Productos", labelStyle: { marginTop: "10px" }, },
            { path: "/workOrders", icon: workOrderIconGray, iconSelected: workOrderIconBlue, label: "Órdenes de trabajo", labelStyle: { marginTop: "12px" } },
            {
                path: null, icon: paymentIconGray, iconSelected: paymentIconBlue, label: "Ventas", labelStyle: { marginTop: "12px" },
                submenu: [
                    { path: "/sales", label: "Ventas totales" },
                    { path: "/receivables", label: "Cuentas por cobrar" }
                ]
            },
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

        const foundIndex = menuOptions.findIndex((option) => {
            if (option.path && currentPath.startsWith(option.path)) return true;
            if (option.submenu) {
                return option.submenu.some(sub => currentPath.startsWith(sub.path));
            }
            return false;
        });

        setActiveIndex(foundIndex);

        const activeOption = menuOptions[foundIndex];
        if (activeOption?.submenu) {
            console.log("Active option has submenu. isTabletLandscape:", isTabletLandscape, "activeOption:", activeOption.label);
            if (!isTabletLandscape) {
                console.log("Opening submenu for:", activeOption.label);
                setOpenSubmenuIndex(foundIndex);
            } else {
                console.log("Skipping submenu open for tablets");
            }
        }
    }, [location.pathname, menuOptions, isTabletLandscape]);

    const handleOptionClick = (option, index) => {
        resetAllFilters();

        if (option.submenu) {
            setOpenSubmenuIndex(prev => (prev === index ? null : index));
            return;
        }

        setOpenSubmenuIndex(null);

        if (option.path === "/inventory") {
            if (onInventoryClick) onInventoryClick();
        } else {
            if (resetFunction) resetFunction();
        }
    };

    return (
        <div className="Menu">
            <div
                className={`menu-lateral ${isOpen ? "open" : ""}`}
                onMouseEnter={() => {
                    if (!manualToggle) setIsOpen(false);
                }}
                onMouseLeave={() => {
                    if (!manualToggle) {
                        setIsOpen(true);
                        setOpenSubmenuIndex(null);
                    }
                }}
            >
                {menuOptions.map((option, index) => {

                    const isActive = activeIndex === index ||
                        option.submenu?.some(sub => location.pathname.startsWith(sub.path));

                    return (
                        <div key={index} className="opcion-wrapper">

                            {option.submenu ? (
                                <div
                                    className={`opcion-container ${isActive ? "active" : ""}`}
                                    onClick={() => handleOptionClick(option, index)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <span className="opcion-container">
                                        <span className="icono">
                                            <img
                                                src={isActive ? option.iconSelected : option.icon}
                                                alt={option.label}
                                            />
                                        </span>
                                        <span className="texto" style={option.labelStyle}>
                                            {option.label}
                                            <span
                                                className="submenu-arrow"
                                                style={{
                                                    marginLeft: "6px",
                                                    display: "inline-block",
                                                    transition: "transform 0.2s ease",
                                                    transform: openSubmenuIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                                                    fontSize: "10px",
                                                }}
                                            >
                                                ▼
                                            </span>
                                        </span>
                                    </span>
                                </div>
                            ) : (
                                <Link
                                    to={option.path}
                                    className={`opcion-container ${isActive ? "active" : ""}`}
                                    onClick={() => handleOptionClick(option, index)}
                                >
                                    <span className="opcion-container">
                                        <span className="icono">
                                            <img
                                                src={isActive ? option.iconSelected : option.icon}
                                                alt={option.label}
                                            />
                                        </span>
                                        <span className="texto" style={option.labelStyle}>
                                            {option.label}
                                        </span>
                                    </span>
                                </Link>
                            )}

                            {option.submenu && openSubmenuIndex === index && (
                                <div className="submenu">
                                    {option.submenu.map((subOption, subIndex) => (
                                        <Link
                                            key={subIndex}
                                            to={subOption.path}
                                            className={`submenu-item ${location.pathname.startsWith(subOption.path) ? "active" : ""}`}
                                            onClick={() => {
                                                console.log("Submenu item clicked. isTabletLandscape:", isTabletLandscape);
                                                resetAllFilters();
                                                if (resetFunction) resetFunction();
                                                if (isTabletLandscape) {
                                                    console.log("Closing submenu");
                                                    setOpenSubmenuIndex(null);
                                                }
                                            }}
                                        >
                                            <span className="submenu-texto">{subOption.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}

                        </div>
                    );
                })}

                <img
                    src={isOpen ? logoClose : logo}
                    alt="Logo Vertical"
                    className="imagen-vertical"
                    onClick={handleImageClick}
                />

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
