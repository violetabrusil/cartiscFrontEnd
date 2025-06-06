import React, { createContext, useState, useEffect } from 'react';

import apiClient from '../services/apiClient';
import { userTypeMaping } from '../constants/userRoleConstants';
import AlertWindow from '../alertWindow/AlertWindow';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();
export let sessionExpiredCallback = null;

export const setSessionExpiredHandler = (callback) => {
    sessionExpiredCallback = callback;
};

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [wasInactive, setWasInactive] = useState(false);
    const navigate = useNavigate();



    useEffect(() => {

        // Guardar la referencia de setSessionExpired para que apiClient pueda acceder
        setSessionExpiredHandler(setSessionExpired);

        // Intenta obtener el usuario de localStorage
        const savedUser = localStorage.getItem('user');

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        const checkAuth = async () => {

            if (!user) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await apiClient.get('/check-auth');

                if (response.data && response.data.valid === false) {

                    localStorage.removeItem('token');
                    setSessionExpired(true);


                } else if (response.data && response.data.user) {
                    // Si el servidor devuelve un usuario, establece ese usuario
                    const modifiedUser = {
                        ...response.data.user,
                        translated_user_type: userTypeMaping[response.data.user.user_type] || response.data.user.user_type,
                    };
                    localStorage.setItem('user', JSON.stringify(modifiedUser));
                    setUser(modifiedUser);

                }
            } catch (error) {

                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    setSessionExpired(true);
                } else {

                    console.log("🔎 No hay respuesta del servidor, error completo:", error);
                }

            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

    }, []);

    const handleSessionExpired = () => {
        setSessionExpired(false);
        setWasInactive(false);
        navigate("/loginExpress");
    }
/*
    useEffect(() => {

        if (sessionExpired) {
            console.log("📢 sessionExpired cambió:", sessionExpired);

            if (localStorage.getItem('token') === null) {
                setWasInactive(true);
            }

        }

    }, [sessionExpired]);
*/

    if (isLoading) {
        return <div>Cargando...</div>; // Puedes agregar un cargador mientras se verifica el estado de la sesión
    }

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, sessionExpired, setSessionExpired }}>
            {children}

      

        </AuthContext.Provider>
    );

};
