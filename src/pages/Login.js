import '../App.css';
import '../Form.css';
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { userTypeMaping } from '../constants/userRoleConstants'; 
import Footer from "../footer/Footer";
import Header from "../header/Header";

const logo = process.env.PUBLIC_URL + "/images/ingenieria-mecatronica.png";
const image = process.env.PUBLIC_URL + "/images/car.png"

const Login = () => {

    const { setUser } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        // Para evitar que el formulario recargue la página
        event.preventDefault();

        try {
            const response = await apiClient.post('/login', { username, password });

            //Transforma el valor de user_type por la constante
            //correspondiente antes de actualizar el estado 
            const modifiedUser = {
                ...response.data,
                user_type: userTypeMaping[response.data.user_type] || response.data.user_type
            };

            //Actualiza el estado global del usuario
            setUser(modifiedUser);
            navigate("/home");
            
        } catch (error) {
            console.log("Error en el inicio de sesión", error)
        }
    }

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
                    <form onSubmit={handleLogin}>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="Ingrese su usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            className="form-input"
                            type="password"
                            placeholder="Ingrese su contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
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