import axios from "axios";

const apiClient = axios.create({
    baseURL: 'http://192.168.100.98:1313/cartics',
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
    },
});

export default apiClient;