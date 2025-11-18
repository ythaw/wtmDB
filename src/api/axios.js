// src/api/axios.js
import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY;

const axiosInstance = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: API_KEY, // Vite injects your key here
  },
});

export default axiosInstance;
    