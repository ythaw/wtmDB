import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.example.com', // api URL
    params: {
        api_key: 
        language: "en-US",

    },
});
export default api;