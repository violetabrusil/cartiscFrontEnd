import '../App.css';
import '../Form.css';
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { AuthContext } from '../contexts/AuthContext';
import apiLogin from '../services/api';
import Footer from "../footer/Footer";
import Header from "../header/Header";

const logo = process.env.PUBLIC_URL + "/images/ingenieria-mecatronica.png";
const image = process.env.PUBLIC_URL + "/images/car.png";
const deletIconNumber = process.env.PUBLIC_URL + "/images/icons/deleteNumberIcon.png";
const pinIcon = process.env.PUBLIC_URL + "/images/icons/pin.png";
const userIcon = process.env.PUBLIC_URL + "/images/user.png";

const LoginExpress = () => {

    const [pin, setPin] = useState('');
    const [physicalPin, setPhysicalPin] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleNumberClick = (number) => {
        if (pin.length < 6) {
            setPin(prevPin => prevPin + number);
            setPhysicalPin(prevPhysicalPin => prevPhysicalPin + number);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const unumber = user.unumber;

        try {
            const response = await apiLogin.post('/login-express', { unumber, pin });
            const token = response.data.token;

            if (response.data.user) {
                // Guarda todos los datos del usuario en localStorage
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            document.cookie = `jwt=${token}; path=/; samesite=none`;

            if (user.user_type === "admin") {
                navigate("/settings");
            } else {
                navigate("/home");
            }
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.errors) {
                // Muestra los errores en toasts
                error.response.data.errors.forEach(err => {
                    toast.error(`${err.field}: ${err.message}`, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                });
            }
        }
    };


    const handleDeleteClick = () => {
        setPin(prevPin => prevPin.slice(0, -1));  // Esta línea elimina el último carácter del PIN.
    };

    const handleLoginOtherAccount = () => {
        navigate("/login");
    };

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.keyCode === 13) {
                handleSubmit(event);
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };

    }, [pin]);

    return (

        <div className="page-container">

            <Header showCarticsLogo={true}></Header>

            <ToastContainer />

            <div className="content-container content-container-login-express">
                <img src={logo} alt="Logo" className="logo" />
            </div>

            <div className="container-login-express">

                <div className="left">
                    <div className="container-data-user">
                        <div className="nameContainer">
                            <label className="name">Hola {user.username}</label>
                        </div>

                        <div className="rolContainer">
                            <label className="rol">{user.translated_user_type}</label>
                        </div>

                        <div className="profile-container">
                            <img
                                src={user && user.profile_picture ? `data:image/jpeg;base64,${user.profile_picture}` : userIcon}
                                alt="Profile"
                                className="profile-pic"
                            />
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

                            <div className="input-wrapper-pin">

                                <img
                                    src={pinIcon}
                                    alt="Pin Icon"
                                    className="input-pin-icon"
                                />

                                <input
                                    className="password-login-express "
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)} 
                                />



                            </div>



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
                        <button className="alternate-button" type="button" onClick={handleLoginOtherAccount}>Iniciar sesión con otro usuario</button>
                    </div>

                </div>

            </div>

            <div className="content-image-express" >
                <img className="blurred-image-express" src={image} alt='Car' />
            </div>


            <Footer></Footer>

        </div>


    )
}

export default LoginExpress;