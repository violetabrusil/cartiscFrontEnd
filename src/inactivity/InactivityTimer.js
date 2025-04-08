import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AlertWindow from "../alertWindow/AlertWindow";
import { AuthContext } from "../contexts/AuthContext";

const InactivityTimer = () => {

    const { sessionExpired, setSessionExpired } = useContext(AuthContext);
    const [isInactive, setIsInactive] = useState(false);
    const [lastActivityTime, setLastActivityTime] = useState(Date.now());
    const navigate = useNavigate();

    // Definir el tiempo de inactividad de 5 minutos (300000 ms)
    const INACTIVITY_TIMEOUT = 300000;

    // Verificar si el usuario ya ha iniciado sesión
    const user = JSON.parse(localStorage.getItem('user'));

    // Función para manejar la interacción del usuario
    const handleUserInteraction = () => {
        setIsInactive(false); // Desactivar el estado de inactividad
        setLastActivityTime(Date.now()); // Actualizar el tiempo de la última interacción
    };

    useEffect(() => {
        // Si no ha iniciado sesión, no hacer nada
        if (!user) {
            return;
        }

        // Escuchar eventos de interacción del usuario
        window.addEventListener('click', handleUserInteraction);

        // Verificar inactividad en cada renderizado
        const checkInactivity = () => {
            if (Date.now() - lastActivityTime > INACTIVITY_TIMEOUT) {
                setIsInactive(true); // Marcar como inactivo si pasó el tiempo límite
                setSessionExpired(true);
                localStorage.removeItem('token'); // Eliminar el token
                
            }
        };

        // Verificar inactividad al cargar el componente y en intervalos de tiempo
        const inactivityInterval = setInterval(checkInactivity, 1000); // Comprobar cada segundo

        // Limpiar eventos y el intervalo cuando el componente se desmonte
        return () => {
            window.removeEventListener('click', handleUserInteraction);
            clearInterval(inactivityInterval); // Limpiar el intervalo
        };
    }, [lastActivityTime, user, setSessionExpired]); // Dependemos de `lastActivityTime` y `user`

    const handleSessionExpired = () => {
        setIsInactive(false);
        setLastActivityTime(Date.now())
        navigate('/loginExpress');
    };

    // Cuando el usuario vuelve a iniciar sesión, actualizamos el estado correctamente
    useEffect(() => {
        if (user && !isInactive) { // Solo reinicia si no estaba inactivo
            setLastActivityTime(Date.now());
            setIsInactive(false);
        }
    }, [user]);

    useEffect(() => {
        console.log("Estado de isInactive cambió:", isInactive);
    }, [isInactive]);

    return (
        <>
            {isInactive && (
                <AlertWindow
                    title="Cierre de sesión por inactividad"
                    message="Por su seguridad inicie sesión nuevamente."
                    onConfirm={handleSessionExpired}
                    fullScreen={true}
                />
            )}
        </>
    );
};

export default InactivityTimer;
