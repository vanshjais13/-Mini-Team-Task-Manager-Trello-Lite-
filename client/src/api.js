import axios from "axios";

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "/api"
// });
const apiBaseURL = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: apiBaseURL
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
