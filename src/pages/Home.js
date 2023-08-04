import "../Home.css";
import React from "react";
import Header from "../header/Header";
import Menu from "../menu/Menu";

const logo = process.env.PUBLIC_URL + "/images/ingenieria-mecatronica.png";

const Home = () => {
    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser="Name User" showRol="Rol" />
            <Menu />
            <div className="container">
                
                <div className="content">
                    {/* Contenido de la página */}
                </div>
                <img src={logo} alt="Imagen Logo" className="image" />
            </div>
        </div>
    );
};

export default Home;
