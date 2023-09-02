import axios from "axios";

const apiAdmin = axios.create({
    //baseURL: 'http://192.168.100.98:1313/cartics',
    baseURL: 'http://localhost:3000/cartics/admin',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
    }
});

export default apiAdmin;