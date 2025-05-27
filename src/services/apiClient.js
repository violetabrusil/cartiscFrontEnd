import axios from "axios";
import { sessionExpiredCallback } from "../contexts/AuthContext";

const apiClient = axios.create({
    baseURL: 'http://localhost:1313/cartics',
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
    },
    timeout: 300000 // 5 minutos
});

// Interceptor para incluir el token en cada solicitud
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
/*
// Interceptor para manejar errores 401 globalmente
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("⚠️ Sesión expirada detectada");

            // Elimina el token y el usuario
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Llama a la función registrada en AuthContext
            if (typeof sessionExpiredCallback === "function") {
                sessionExpiredCallback(true);
                console.log("🔄 sessionExpired actualizado a TRUE");
            }

            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);
*/

export default apiClient;
