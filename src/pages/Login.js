import '../App.css';
import '../Form.css';
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiLogin from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { userTypeMaping } from '../constants/userRoleConstants';
import Footer from "../footer/Footer";
import Header from "../header/Header";
import { showToastOnce } from '../utils/toastUtils';

const logo = process.env.PUBLIC_URL + "/images/ingenieria-mecatronica.png";
const image = process.env.PUBLIC_URL + "/images/car.png";
const userIcon = process.env.PUBLIC_URL + "/images/icons/username.png";
const passwordVisible = process.env.PUBLIC_URL + "/images/icons/password_visible.png";
const passwordInvisible = process.env.PUBLIC_URL + "/images/icons/password_invisible.png";
const passwordIcon = process.env.PUBLIC_URL + "/images/icons/password.png";

const Login = () => {

    const { setUser } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            const response = await apiLogin.post('/login', { username, password });
            const token = response.data.token;
            localStorage.setItem('token', token);

            const translatedUserType = userTypeMaping[response.data.user.user_type] || response.data.user.user_type;
            const modifiedUser = {
                ...response.data.user,
                translated_user_type: translatedUserType,
            };

            setUser(modifiedUser);
            localStorage.setItem('user', JSON.stringify(modifiedUser));

            if (response.data.user.change_password) {
                navigate("/changePassword");
                return;
            }

            if (response.data.user.change_pin) {
                navigate("/changePIN");
                return;
            }

            if (modifiedUser.translated_user_type === "Administrador") {
                navigate("/settings");
            } else {
                navigate("/home");
            }

        } catch (error) {

            let mensajesError = [];
            if (error.response && error.response.data && error.response.data.errors) {
                mensajesError = error.response.data.errors.map(err => err.message);
            }

            const mensajeFinal = mensajesError.length ? mensajesError.join(" / ") : null;

            if (error.message === "Network Error") {
                showToastOnce("error", "Error en el servidor. Conéctese con soporte técnico.");
            } else if (mensajeFinal) {
                showToastOnce("error", mensajeFinal);
            } else {
                showToastOnce("error", "Error en el inicio de sesión. Nombre de usuario o contraseña incorrectos");
            }
        }
    };

    return (

        <div className="page-container">
            <Header showCarticsLogo={true} showPhoto={false}></Header>

            <div className="content-container">

                <div className='containerApp'>
                    <img src={logo} alt="Logo" className="logo" />
                </div>

                <div className="titleContainer">
                    <h1 className="title">Bienvenido</h1>
                </div>

                <div className="form-container">
                    <form onSubmit={handleLogin}>
                        <div className="input-wrapper">

                            <img
                                src={userIcon}
                                alt="User Icon"
                                className="input-icon"
                            />

                            <input
                                className="form-input"
                                type="text"
                                placeholder="Ingrese su usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}

                            />

                        </div>

                        <div className="password-wrapper">

                            <img
                                src={passwordIcon}
                                alt="User Icon"
                                className="input-icon"
                            />

                            <input
                                className="form-input"
                                type={showPassword ? "text" : "password"}
                                placeholder="Ingrese su contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <img
                                src={showPassword ? passwordInvisible : passwordVisible}
                                alt="Toggle password visibility"
                                className="toggle-password-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            />

                        </div>

                        <button type="submit" className="button-form">Entrar</button>
                    </form>
                </div>



            </div>

            <div className="content-image-login" >
                <img className="blurred-image" src={image} alt='Car' />
            </div>

            <Footer></Footer>

        </div>


    )
}

export default Login;