import axios from "axios";
import { sessionExpiredCallback } from "../contexts/AuthContext";

const apiAdmin = axios.create({

    baseURL: 'http://localhost:1313/cartics/admin',
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        //'Authorization': `Bearer ${token}`
    },
    timeout: 300000 // 5 minutos

});

//Interceptor para incluir el token en cada solicitud

apiAdmin.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = token;
        }

        return config;
    }, (error) => Promise.reject(error)
);
/*
apiAdmin.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("⚠️ Sesión expirada detectada");

            //Elimina el token y el usuario
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            //Llama a la funcion registrada en AUthcontext
            if (typeof sessionExpiredCallback === "function") {
                sessionExpiredCallback(true)
            }

            return Promise.reject(error);
        }
        return Promise.reject(error);
    }

)
*/
export default apiAdmin;
