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
            profilePicture: user.profile_picture, 
            code: user.code, 
        };
        localStorage.setItem('expressLoginData', JSON.stringify(expressLoginData));
    };

    const handleLogout = async (event) => {
        event.preventDefault();
        saveUserForExpressLogin(user);

        try {
            await apiLogin.post('/logout');
            localStorage.removeItem('user');  
            navigate("/loginExpress");
        } catch (error) {
        }
    };

    return (
        <header className="main-header">
            <div className="header-left">
                {showIcon && <img src={logo} alt="Mecatronica" className="icon-image" />}
            </div>

            <div className="header-right">
                {showCarticsLogo && <img src={carticsLogo} alt="Cartics Logo" className="cartics-logo" />}
                {imageToDisplay}
                <div className="profile-text">
                    {showUser && <span className="profile-name">{user.username}</span>}
                    {showRol && <span className="profile-role">{user.translated_user_type}</span>}
                </div>
                {showLogoutButton &&
                    <button className="logout-button" onClick={handleLogout} aria-label="Logout">
                        <img className="logout-icon" src={logoutIcon} alt="Logout" />
                    </button>
                }
            </div>
        </header>
    )
}

export default Header;