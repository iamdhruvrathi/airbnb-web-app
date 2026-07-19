import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail ?? error.message ?? "Something went wrong";
    return Promise.reject(new Error(typeof message === "string" ? message : JSON.stringify(message)));
  }
);
