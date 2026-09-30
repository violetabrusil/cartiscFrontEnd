import React, { createContext, useState, useEffect } from 'react';

import apiClient from '../services/apiClient';
import { userTypeMaping } from '../constants/userRoleConstants';

export const AuthContext = createContext();

const CHECK_AUTH_TIMEOUT_MS = 10000;
const CHECK_AUTH_MAX_WAIT_MS = 15000;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; 

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const inactivityTimerRef = React.useRef(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        const safetyTimer = setTimeout(() => setIsLoading(false), CHECK_AUTH_MAX_WAIT_MS);

        const checkAuth = async () => {
            try {
                const response = await apiClient.get('/check-auth', { timeout: CHECK_AUTH_TIMEOUT_MS });

                if (response.data && response.data.user) {
                    const modifiedUser = {
                        ...response.data.user,
                        translated_user_type: userTypeMaping[response.data.user.user_type] || response.data.user.user_type,
                    };
                    localStorage.setItem('user', JSON.stringify(modifiedUser));
                    setUser(modifiedUser);
                } else {
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        setUser(JSON.parse(savedUser));
                    } else {
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Error checking authentication', error);
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.reload();
                }
            } finally {
                clearTimeout(safetyTimer);
                setIsLoading(false);
            }
        };

        checkAuth();

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkAuth();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        const handleOnline = () => {
            checkAuth();
        };
        window.addEventListener('online', handleOnline);

        const resetInactivityTimer = () => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = setTimeout(() => {
                checkAuth();
            }, INACTIVITY_TIMEOUT);
        };

        const activityEvents = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
        activityEvents.forEach(event => {
            document.addEventListener(event, resetInactivityTimer, true);
        });

        resetInactivityTimer();

        return () => {
            clearTimeout(safetyTimer);
            clearTimeout(inactivityTimerRef.current);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('online', handleOnline);
            activityEvents.forEach(event => {
                document.removeEventListener(event, resetInactivityTimer, true);
            });
        };
    }, []);


    return (
        <AuthContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );

};
