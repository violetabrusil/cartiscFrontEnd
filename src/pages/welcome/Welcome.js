import '../../App.css';
import '../../Form.css';
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import Footer from '../../footer/Footer';
import Header from '../../header/Header';

const logo = process.env.PUBLIC_URL + "/images/ingenieria-mecatronica.png";
const image = process.env.PUBLIC_URL + "/images/car.png"
const arrowLeftIcon = process.env.PUBLIC_URL + "/images/icons/arrowLeftIcon.png";

const Welcome = () => {

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        
        if (storedUser !== null && storedUser !== "null" && storedUser !== "") {
            navigate("/login");
        }
    }, [navigate]);
    
    const handleContinue = () => {
        // Guarda en el localStorage que el usuario ya ha visitado la pantalla inicial
        localStorage.setItem("hasVisitedBefore", "true");
        navigate("/login");
    };

    return (

        <div className="page-container">
            <Header showCarticsLogo={true}></Header>

            <div className="content-container-welcome">

                <div className="titleContainer">
                    <span className="span-message-welcome">
                        Hola Administrador, bienvenido a tu nuevo Sistema Cartics.
                    </span>
                </div>

                <div className="container-logo-welcome">

                    <img src={logo} alt="Logo" className="logo-welcome" />
                </div>


                <div className="div-next" >
                    <img src={arrowLeftIcon} alt="Next Icon" className="next-icon" onClick={handleContinue} />
                </div>


            </div>

            <div style={{ marginTop: '60px' }} className="content-image-login" >
                <img className="blurred-image" src={image} alt='Car' />
            </div>

            <Footer></Footer>

        </div>


    )
}

export default Welcome;




