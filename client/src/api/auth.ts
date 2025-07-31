import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api/auth",
  withCredentials: true,
});

export const register = (name: string, email: string, password: string) =>
  api.post("/register", { name, email, password });

export const login = (email: string, password: string) =>
  api.post("/login", { email, password });

export const logout = () => api.post("/logout");

export const getMe = () => api.get("/me");
