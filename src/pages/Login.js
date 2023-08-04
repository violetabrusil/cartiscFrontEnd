import React from "react";
import '../App.css';
import '../Form.css';
import Footer from "../footer/Footer";
import Header from "../header/Header";

const logo = process.env.PUBLIC_URL + "/images/ingenieria-mecatronica.png";
const image = process.env.PUBLIC_URL + "/images/car.png"

const Login = () => {

    return (

        <div className="page-container">
            <Header></Header>

            <div className="content-container">

                <div className='containerApp'>

                    <img src={logo} alt="Logo" className="logo" />

                </div>

                <div className="titleContainer">
                    <h1 className="title">Bienvenido</h1>
                </div>

                <div className="form-container">
                    <form>
                        <input className="form-input" type="text" placeholder="Ingrese su usuario" />
                        <input className="form-input" type="password" placeholder="Ingrese su contraseña" />
                        <button type="submit" className="button-form">Entrar</button>
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

export default Login;