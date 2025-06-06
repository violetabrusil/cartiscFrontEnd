import '../Header.css';
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../contexts/AuthContext';
import apiLogin from '../services/api';

const logoutIcon = process.env.PUBLIC_URL + "/images/icons/logout1Icon.png";
const logo = process.env.PUBLIC_URL + "/images/ingenieria-mecatronica.png";
const carticsLogo = process.env.PUBLIC_URL + "/images/cartics-white.png";
const userIcon = process.env.PUBLIC_URL + "/images/user.png";
const carticsIcon = process.env.PUBLIC_URL + "/images/cartics-icon.png";

function Header({ showIcon, showCarticsLogo, showPhoto, showUser, showRol, showLogoutButton, showIconCartics }) {

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    let imageToDisplay;
    if (showPhoto && user) {
        imageToDisplay = user.profile_picture ? (
            <img src={`data:image/jpeg;base64,${user.profile_picture}`} alt="Profile" className="profile-image" />
        ) : (
            <img src={userIcon} alt="Default User Icon" className="profile-image" />
        );
    }

    const saveUserForExpressLogin = (user) => {
        const expressLoginData = {
            name: user.name,
            role: user.translated_user_type,
            profilePicture: user.profile_picture, // Suponiendo que este campo existe
            code: user.code, // Suponiendo que este campo existe
        };
        localStorage.setItem('expressLoginData', JSON.stringify(expressLoginData));
    };

    const handleLogout = async (event) => {
        event.preventDefault();

        // Guarda la información del usuario para el login express antes de cerrar sesión.
        saveUserForExpressLogin(user);

        try {
            await apiLogin.post('/logout');

            // Limpia el usuario del contexto y del localStorage.
            localStorage.removeItem('user');  // Remueve el usuario actual.

            navigate("/loginExpress");
        } catch (error) {
        }
    };


    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        // Limpia la suscripción al evento resize cuando el componente se desmonte
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isWindowLarge = windowWidth > 768;

    return (
        <header className={`main-header ${isWindowLarge ? 'header-large' : 'header-default'}`}>
            <div className="header-left">
                {showIcon && showIconCartics &&
                    <div className="logo-container">
                        <img src={carticsIcon} alt="Icon Cartics" className="icon-cartics" />
                        <img src={logo} alt="Mecatronica" className="icon-image" />
                    </div>
                }
            </div>

            <div className="header-right">
                {showCarticsLogo && <img src={carticsLogo} alt="Cartics Logo" className="cartics-logo" />}
                {imageToDisplay}
                <div className="profile-text">
                    {showUser && user && <label className="profile-name">{user.username}</label>}
                    {showRol && user && <label className="profile-role">{user.translated_user_type}</label>}
                </div>
                {showLogoutButton &&
                    <div style={{ marginLeft: "auto" }}>
                        <button className="logout-button" onClick={handleLogout}>
                            <img className="logout-icon" src={logoutIcon} alt="Logout" />
                        </button>
                    </div>
                } {/* Botón de Salir con imagen */}
            </div>
        </header>
    )
}

export default Header;