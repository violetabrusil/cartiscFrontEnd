import axios from "axios";

const apiLogin = axios.create({
    //baseURL: 'https://192.168.100.97:3000/cartics',
    baseURL: 'https://localhost:3000/cartics',
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
    },
});

export default apiLogin;