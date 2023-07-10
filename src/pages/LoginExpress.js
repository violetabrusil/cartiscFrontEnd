import React from "react";
import '../App.css';
import '../Form.css';
import Footer from "../footer/Footer";
import Header from "../header/Header";
import logo from "../images/cartics-black.png";
import image from "../images/car.png";
import photo from "../images/user.png"

const LoginExpress = () => {

    return (

        <div className="page-container">
            <Header></Header>

            <div className="content-container">

                <div className='container'>

                    <img src={logo} alt="Logo" className="logo" />

                </div>

                <div className="nameContainer">
                    <label className="name">Hola nameuser</label>
                </div>

                <div className="rolContainer">
                    <label className="rol">Rol</label>
                </div>

                <div className="profile-container">
                    <img src={photo} alt="Profile" className="profile-pic" />
                </div>

                <div className="form-container">
                    <form>
                        <input className="form-input" type="text" placeholder="Ingrese su usuario" />
                        <input className="form-input" type="password" placeholder="Ingrese su contraseña" />
                        <button type="submit">Entrar</button>
                        <button className="alternate-button" type="button">Iniciar sesión con otro usuario</button>
                    </form>
                </div>

            </div>

            <div className='image'>
                <div className="image-container">
                    <img className="blurred-image" src={image} alt='Car' />
                </div>
            </div>

            <Footer></Footer>

        </div>


    )
}

export default LoginExpress;