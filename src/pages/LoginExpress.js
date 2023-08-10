import '../App.css';
import '../Form.css';
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../contexts/AuthContext';
import apiLogin from '../services/api';
import Footer from "../footer/Footer";
import Header from "../header/Header";

const logo = process.env.PUBLIC_URL + "/images/ingenieria-mecatronica.png";
const image = process.env.PUBLIC_URL + "/images/car.png";
const deletIconNumber = process.env.PUBLIC_URL + "/images/icons/deleteNumberIcon.png";

const LoginExpress = () => {

    const [pin, setPin] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleNumberClick = (number) => {
        if (pin.length < 6) {
            setPin(prevPin => prevPin + number)
        }
    };

    const handleSubmit = async (event) => {

        // Para evitar que el formulario recargue la página
        event.preventDefault();

        const unumber = user.unumber;

        try {
            
            await apiLogin.post('/login-express', { unumber, pin });
            navigate("/home");
        } catch (error) {
            console.log("Error en el inicio de sesión", error)
        }
    };

    const handleDeleteClick = () => {
        setPin(prevPin => prevPin.slice(0, -1));  // Esta línea elimina el último carácter del PIN.
    };

    const handleLoginOtherAccout = () => {
        navigate("/login");
    };

    return (

        <div className="page-container">

            <Header></Header>

            <div className="content-container">
                <img src={logo} alt="Logo" className="logo" />
            </div>

            <div className="container-login-express">

                <div className="left">
                    <div className="container-data-user">
                        <div className="nameContainer">
                            <label className="name">Hola {user.username}</label>
                        </div>

                        <div className="rolContainer">
                            <label className="rol">{user.user_type}</label>
                        </div>

                        <div className="profile-container">
                            <img src={`data:image/jpeg;base64,${user.profile_picture}`} alt="Profile" className="profile-pic" />
                        </div>
                    </div>

                </div>

                <div className="right">

                    <div className="form-container-login-express ">
                        <form>

                            <input
                                className="form-input-login-express"
                                type="text"
                                value={user.unumber}
                                readOnly
                            />

                            <input
                                className="password-login-express "
                                type="password"
                                value={pin}
                                readOnly
                            />

                        </form>
                    </div>

                    <div className="pin-container">

                        <div className="number-pad">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
                                <button key={number} onClick={() => handleNumberClick(number.toString())}>
                                    {number}
                                </button>
                            ))}
                            <button onClick={handleDeleteClick}>
                                <img className="button-delete-number" alt="Delete Number Icon" src={deletIconNumber} />
                            </button>
                        </div>

                    </div>

                    <div className="container-button-login-express">
                        <button className="button-login-express" onClick={handleSubmit} type="button">Entrar</button>
                    </div>

                    <div className="container-button-other-account">
                        <button className="alternate-button" type="button" onClick={handleLoginOtherAccout}>Iniciar sesión con otro usuario</button>
                    </div>

                </div>

            </div>

            <div className="content-image" >
                <img className="blurred-image" src={image} alt='Car' />
            </div>


            <Footer></Footer>

        </div>


    )
}

export default LoginExpress;