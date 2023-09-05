import '../../App.css';
import '../../Form.css';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import apiAdmin from '../../services/apiAdmin';
import Footer from '../../footer/Footer';
import Header from '../../header/Header';
import { useDebounce } from "../../useDebounce";
import { AuthContext } from "../../contexts/AuthContext";

const logo = process.env.PUBLIC_URL + "/images/ingenieria-mecatronica.png";
const image = process.env.PUBLIC_URL + "/images/car.png"

const ChangePassword = () => {

    const [changePassword, setChangePassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const debouncedPassword = useDebounce(changePassword, 1000);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setChangePassword(newPassword);
    };

    const handleConfirmPassword = (e) => {
        const newPasswordConfirm = e.target.value;
        setConfirmPassword(newPasswordConfirm);
    };

    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
        const isValidLength = password.length >= 6 && password.length <= 16;

        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isValidLength;
    };

    useEffect(() => {
        if (debouncedPassword.length > 0 && !validatePassword(debouncedPassword)) {
            setPasswordError("La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número, un carácter especial y tener entre 6 y 16 caracteres.");
        } else {
            setPasswordError("");
        }
        
        if (changePassword && confirmPassword && changePassword !== confirmPassword) {
            setConfirmPasswordError("Las contraseñas no coinciden");
        } else {
            setConfirmPasswordError("");
        }
    }, [debouncedPassword, confirmPassword]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!changePassword || !confirmPassword || passwordError) {
            toast.error('Revise los errores en el formulario.', {
                position: toast.POSITION.TOP_RIGHT
            });
            return;
        }

        const userId = user.id;

        const userData = {
            new_password: confirmPassword,
            reset: false,
        };

        try {
            await apiAdmin.put(`/change-password/${userId}`, userData);
            toast.success('Contraseña actualizada', {
                position: toast.POSITION.TOP_RIGHT
            });
            
            if (user.change_pin) {
                navigate("/changePIN");
            } else {
                navigate("/login");
            }
           
        } catch (error) {
            console.error("Hubo un error al cambiar la contraseña:", error);
            toast.error('Error al cambiar la contraseña. Inténtalo de nuevo.', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    return (

        <div className="page-container">
            <Header showCarticsLogo={true}></Header>

            <ToastContainer />

            <div className="content-container">

                <div className='containerApp'>

                    <img src={logo} alt="Logo" className="logo" />

                </div>

                <div className="titleContainer">
                    <span className="span-message">
                        “Es necesario un cambio de contraseña para
                        poder ingresar al sistema”
                    </span>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="Ingrese su nueva contraseña"
                            value={changePassword}
                            onChange={handlePasswordChange}
                        />
                        <div style={{marginTop: '-15px', marginBottom: '10px'}}>
                            {passwordError && <span style={{ color: 'red', fontSize: '11px' }}>{passwordError}</span>}
                        </div>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="Confirme su nueva contraseña"
                            value={confirmPassword}
                            onChange={handleConfirmPassword}
                        />
                         <div style={{marginTop: '-15px', marginBottom: '10px'}}>
                         {confirmPasswordError && <span style={{ color: 'red', fontSize: '11px' }}>{confirmPasswordError}</span>}
                        </div>
                        <button type="submit" className="button-form">Confimar</button>
                    </form>
                </div>



            </div>

            <div style={{ marginTop: '170px' }} className="content-image-login" >
                <img className="blurred-image" src={image} alt='Car' />
            </div>

            <Footer></Footer>

        </div>


    )
}

export default ChangePassword;