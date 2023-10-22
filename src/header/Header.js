import '../Header.css';
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../contexts/AuthContext';
import apiLogin from '../services/api';

const logoutIcon = process.env.PUBLIC_URL + "/images/icons/logout1Icon.png";
const logo = process.env.PUBLIC_URL + "/images/ingenieria-mecatronica.png";
const carticsLogo = process.env.PUBLIC_URL + "/images/cartics-white.png";
const userIcon = process.env.PUBLIC_URL + "/images/user.png";

function Header({ showIcon, showCarticsLogo, showPhoto, showUser, showRol, showLogoutButton }) {

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    let imageToDisplay;
    if (showPhoto) {
        if (user && user.profile_picture) {
            imageToDisplay = <img src={`data:image/jpeg;base64,${user.profile_picture}`} alt="Profile" className="profile-image" />;
        } else {
            imageToDisplay = <img src={userIcon} alt="Default User Icon" className="profile-image" />;
        }
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

    const styleHeader = {
        padding: '10px',
        background: '#0C1F31',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '0px',
        height: '60px',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        "@media screen and (maxWidth: 600px)": {
            flexDirection: 'column',
            alignItems: 'flex-end',
        },

    };

    const styleHeaderLarge = {
        ...styleHeader,
        flexDirection: 'row',
        justifyContent: 'space-around'
    };

    const isWindowLarge = windowWidth > 768;

    return (
        <header style={isWindowLarge ? styleHeaderLarge : styleHeader}>
            <div className="header-left">
                {showIcon && <img src={logo} alt="Mecatronica" className="icon-image" />}
            </div>

            <div className="header-right">
                {showCarticsLogo && <img src={carticsLogo} alt="Cartics Logo" className="cartics-logo" />}
                {imageToDisplay}
                <div className="profile-text">
                    {showUser && <label className="profile-name">{user.username}</label>}
                    {showRol && <label className="profile-role">{user.translated_user_type}</label>}
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