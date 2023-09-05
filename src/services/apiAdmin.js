import axios from "axios";

const apiAdmin = axios.create({
    //baseURL: 'http://192.168.100.147:1313/cartics',
    baseURL: 'http://192.168.100.98:1313/cartics/admin',
    //baseURL: 'http://localhost:3000/cartics',
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        //'Authorization': `Bearer ${token}`
    }
});

apiAdmin.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log("Token obtenido del localStorage:", token); // Esto imprimirá el token, o null si no existe.

    if (token) {
        config.headers.Authorization = token; // Sin el prefijo Bearer
        console.log("Cabecera configurada:", config.headers.Authorization); // Esto confirmará si la cabecera se configuró correctamente.
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});



export default apiAdmin;
