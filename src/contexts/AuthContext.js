import React, { createContext, useState, useEffect } from 'react';

import apiClient from '../services/apiClient';
import { userTypeMaping } from '../constants/userRoleConstants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Intenta obtener el usuario de localStorage
        const savedUser = localStorage.getItem('user');
        console.log("Usuario guardado en localStorage:", savedUser);
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        const checkAuth = async () => {
            try {
                const response = await apiClient.get('/check-auth');

                if (response.data && response.data.user) {
                    // Si el servidor devuelve un usuario, establece ese usuario
                    const modifiedUser = {
                        ...response.data.user,
                        translated_user_type: userTypeMaping[response.data.user.user_type] || response.data.user.user_type,
                    };
                    localStorage.setItem('user', JSON.stringify(modifiedUser));
                    setUser(modifiedUser);
                    console.log("ususario que llega", modifiedUser);
                } else {
                    // Si el token no es válido o no hay usuario en la respuesta del servidor, intenta obtenerlo de localStorage
                    const savedUser = localStorage.getItem('user');
                    console.log("Usuario guardado en localStorage:", savedUser);
                    if (savedUser) {
                        setUser(JSON.parse(savedUser));
                    } else {
                        // Si no hay usuario en localStorage, limpia el estado
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Error checking authentication', error);
                if (error.response && error.response.status === 401) {
                    // Elimina el token y el usuario del localStorage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } finally {
                setIsLoading(false);
            }
        };


        checkAuth();

    }, []);


    return (
        <AuthContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );

};
