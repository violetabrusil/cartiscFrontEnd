import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Icon from "../components/Icons";

const Menu = ({ resetFunction, onInventoryClick, onWorkOrderClick }) => {

    const [isOpen, setIsOpen] = useState(false);
    const [, setManualToggle] = useState(false);
    const [isHoverinMenu, setIsHoveringMenu] = useState(false);
    const [activePath, setActivePath] = useState(null);
    const manualToggleRef = useRef(false);
    const closeTimeout = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);


    const setManualToggleAndRef = (value, callback = null) => {
        manualToggleRef.current = value;
        setManualToggle(value);
        if (callback) callback();
    };

    const toggleMenu = () => {
        const newValue = !manualToggleRef.current;
        setManualToggleAndRef(newValue);
        setIsOpen(newValue);
    };

    const handleClickOption = (event, path, isInventory = false, isWorkOrder = false) => {

        event.preventDefault();

        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }

        manualToggleRef.current = true;
        setManualToggle(true);
        setIsOpen(true);

        if (isInventory && onInventoryClick) {
            onInventoryClick();
        } if (isWorkOrder && onWorkOrderClick) {
            onWorkOrderClick();
        } else if (resetFunction) {
            resetFunction();
        }

        navigate(path);
    };

    const menuOptions = useMemo(() => {

        let commonOptions = [
            { path: "/home", iconName: "dashboard", label: "Home" },
            { path: "/clients", iconName: "client", label: "Clientes" },
            { path: "/cars", iconName: "carMenu", label: "Vehículos" },
            { path: "/services", iconName: "services", label: "Servicios y operaciones" },
            { path: "/suppliers", iconName: "supplier", label: "Proveedores" },
            { path: "/inventory", iconName: "productDefault", label: "Inventario" },
            { path: "/workOrders", iconName: "workOrder", label: "Órdenes de trabajo" },
            { path: "/paymentReceipt", iconName: "receipt", label: "Comprobantes de pago" },
            //{ path: '/proformas', icon: proformaIconGray, iconSelected: proformaIconBlue, label: "Proformas", labelStyle: { marginTop: "10px" } }
        ];

        if (user && user.translated_user_type === "Administrador") {
            return [
                { path: "/settings", iconName: "settings", label: "Configuración " },
                ...commonOptions
            ];
        }

        return commonOptions;
    }, [user]);

    const configOption = menuOptions.find(option => option.path === "/settings");
    const mainOptions = menuOptions.filter(option => option.path !== "/settings");

    useEffect(() => {
        setActivePath(location.pathname);
    }, [location.pathname]);

    useEffect(() => {
    }, [isOpen]);

    useEffect(() => {
        return () => {
            if (closeTimeout.current) {
                clearTimeout(closeTimeout.current);
            }
        };
    }, []);

    return (
        <div className="Menu">
            <div
                className={`menu-lateral ${isOpen ? "open" : "closed"}`}
                onMouseEnter={() => {
                    if (closeTimeout.current) clearTimeout(closeTimeout.current);
                    if (!manualToggleRef.current) {
                        setIsOpen(true);
                    }
                    setIsHoveringMenu(true);
                }}
                onMouseLeave={() => {
                    setIsHoveringMenu(false);
                    if (!manualToggleRef.current) {
                        closeTimeout.current = setTimeout(() => {
                            if (!manualToggleRef.current) {
                                setIsOpen(false);
                            }
                        }, 100);
                    } else {
                        console.log("no cerrar menú porque fue abierto manualmente");
                    }
                }}
            >
                <div className="options-top-menu">
                    {mainOptions.map((option, index) => (
                        <Link
                            to={option.path}
                            key={index}
                            className={`opcion-container ${activePath === option.path && !isHoverinMenu ? "active" : ""}`}
                            onClick={(event) => handleClickOption(event, option.path, option.path === "/inventory")}
                        >
                            <div className="opcion-content">
                                <span className="icono">
                                    <Icon
                                        name={option.iconName}
                                        className={`menu-icon ${activePath === option.path && !isHoverinMenu ? 'menu-icon--active' : ''}`}
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
                            className={`opcion-container ${activePath === configOption.path && !isHoverinMenu ? "active" : ""}`}
                            onClick={(event) => handleClickOption(event, configOption.path)}
                        >
                            <div className="opcion-content">
                                <span className="icono">
                                    <Icon
                                        name={configOption.iconName}
                                        className={`menu-icon ${activePath === configOption.path && !isHoverinMenu ? 'menu-icon--active' : ''}`}
                                    />
                                </span>
                                <span className="texto">{configOption.label}</span>
                            </div>
                        </Link>
                    )}

                    <div className="icono-menu">

                        <button className="button-menu opcion-container" onClick={toggleMenu}>
                            <Icon
                                name={isOpen ? "leftArrowMenu" : "rightArrowMenu"}
                                className="menu-icon"
                                style={{ color: isOpen ? "var(--gray-muted)" : "var(--blue-medium)" }}
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
