import "../Home.css";
import React from "react";
import Header from "../header/Header";
import Menu from "../menu/Menu";

const logo = process.env.PUBLIC_URL + "/images/ingenieria-mecatronica.png";

const Home = () => {

    return (
        <div>
            <Header showIcon={true} showPhoto={true} showUser={true} showRol={true} showLogoutButton={true} />
            <Menu />
            <div className="container">

               
                <img src={logo} alt="Imagen Logo" className="image" />
            </div>
        </div>
    );
};

export default Home;
