import '../../App.css';
import '../../Form.css';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useContext } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../useDebounce";
import { AuthContext } from '../../contexts/AuthContext';
import apiAdmin from '../../services/apiAdmin';
import Footer from "../../footer/Footer";
import Header from "../../header/Header";

const logo = process.env.PUBLIC_URL + "/images/ingenieria-mecatronica.png";
const image = process.env.PUBLIC_URL + "/images/car.png";
const deletIconNumber = process.env.PUBLIC_URL + "/images/icons/deleteNumberIcon.png";

const ChangePIN = () => {

    const [changePIN, setChangePIN] = useState("");
    const [confirmPIN, setConfirmPIN] = useState("");
    const [pinError, setPinError] = useState("");
    const [confirmPinError, setConfirmPinError] = useState("");
    const [activeInput, setActiveInput] = useState('new');
    const debouncedPIN = useDebounce(changePIN, 1000);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

   

    const handleConfirmPinNumberClick = (number) => {
        if (confirmPIN.length < 6) {
            const newConfirmPin = confirmPIN + number;
            setConfirmPIN(newConfirmPin);

            if (newConfirmPin !== changePIN) {
                setConfirmPinError("El PIN y el PIN de confirmación no coinciden.");
            } else {
                setConfirmPinError("");
            }
        }
    };

    const handleNumberClick = (number) => {
        if (activeInput === 'new' && changePIN.length < 6) {
            setChangePIN(prevPin => prevPin + number);
        } else if (activeInput === 'confirm' && confirmPIN.length < 6) {
            handleConfirmPinNumberClick(number);
        }
    };

    const handleDeleteClick = () => {
        if (activeInput === 'new') {
            setChangePIN(prevPin => prevPin.slice(0, -1));
        } else if (activeInput === 'confirm') {
            setConfirmPIN(prevConfirmPin => prevConfirmPin.slice(0, -1));
        }
    };    

    const handleConfirm = async (e) => {
        e.preventDefault();

        if (!changePIN || !confirmPIN || pinError) {
            toast.error('Revise los errores en el formulario.', {
                position: toast.POSITION.TOP_RIGHT
            });
            return;
        }

        const userId = user.id;
        const userData = {
            new_pin: confirmPIN,
            reset: false,
        };

        try {
            await apiAdmin.put(`/change-pin/${userId}`, userData);
            toast.success('PIN actualizado', {
                position: toast.POSITION.TOP_RIGHT
            });
            navigate("/login"); // O redirige a donde corresponda después de cambiar el PIN

        } catch (error) {
            toast.error('Error al cambiar el PIN. Inténtalo de nuevo.', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    useEffect(() => {
        if (debouncedPIN.length > 0 && (debouncedPIN.length < 4 || debouncedPIN.length > 6)) {
            setPinError("El PIN debe tener entre 4 y 6 dígitos.");
        } else {
            setPinError("");
        }

        if (changePIN && confirmPIN && changePIN !== confirmPIN) {
            setConfirmPinError("Los PINs no coinciden");
        } else {
            setConfirmPinError("");
        }
    }, [debouncedPIN, confirmPIN]);

    
    return (

        <div className="page-container">

            <Header showCarticsLogo={true}></Header>

            <div className="content-container">
                <img src={logo} alt="Logo" className="logo" />
            </div>

            <div className="titleContainer">
                <span style={{ width: '22%' }} className="span-message">
                    “Es necesario un cambio de PIN para
                    poder ingresar al sistema”
                </span>
            </div>

            <div className="container-login-express">

                <div className="left">
                    <div style={{ marginLeft: '110px' }} className="container-data-user">
                        <div style={{ marginTop: '-16px', }} className="pin-container">

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

                    </div>

                </div>

                <div className="right">

                    <div style={{ marginLeft: '-24px' }} className="form-container-login-express ">
                        <form>

                            <input
                                className="form-input-login-express"
                                type="text"
                                value={user.unumber}
                                readOnly
                            />

                            <input
                                className="password-login-express"
                                type="password"
                                value={changePIN}
                                onClick={() => setActiveInput('new')}
                                onChange={() => { }}
                            />
                            <div style={{marginTop: '-9px', marginBottom: '5px'}}>
                                {pinError && <span style={{ color: 'red', fontSize: '11px' }}>{pinError}</span>}
                            </div>
                            <input
                                className="password-login-express"
                                type="password"
                                value={confirmPIN}
                                onClick={() => setActiveInput('confirm')}
                                onChange={() => { }}
                            />
                            <div>
                                {confirmPinError && <span style={{ color: 'red', fontSize: '11px' }}>{confirmPinError}</span>}
                            </div>
                        </form>
                    </div>



                    <div style={{ marginTop: '53px', textAlign: 'inherit' }} className="container-button-login-express">
                        <button style={{ marginLeft: '52px' }} className="button-login-express" type="button" onClick={handleConfirm}>Confirmar</button>
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

export default ChangePIN;