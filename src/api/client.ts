import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios"
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/token"
import { useAuthStore } from "@/stores/useAuthStore"

// =============== BASE CONFIG =============== //

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5001/v1"
    : "https://node-boilerplate-pww8.onrender.com/v1"

axios.defaults.withCredentials = true

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-lang": "EN",
  },
})

// =============== REQUEST INTERCEPTOR =============== //

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// =============== REFRESH TOKEN HANDLER =============== //

let isRefreshing = false
let failedQueue: {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}[] = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token!)
  })
  failedQueue = []
}

// =============== RESPONSE INTERCEPTOR =============== //

api.interceptors.response.use(
  (res: AxiosResponse) => res,

  async (error) => {
    const original = error.config

    // Bỏ qua login/register/refresh
    if (
      original.url.includes("/auth/login") ||
      original.url.includes("/auth/register") ||
      original.url.includes("/auth/refresh-tokens")
    ) {
      return Promise.reject(error)
    }

    // 401 hoặc 403 → refresh
    if ((error.response?.status === 401 || error.response?.status === 403) && !original._retry) {
      original._retry = true

      // Nếu đang refresh → queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              original.headers.Authorization = `Bearer ${token}`
              resolve(api(original))
            },
            reject,
          })
        })
      }

      isRefreshing = true

      try {
        const refreshToken = getRefreshToken()

        if (!refreshToken) {
          clearTokens()
          useAuthStore.getState().clearState()
          return Promise.reject(error)
        }

        const res = await axios.post(`${BASE_URL}/auth/refresh-tokens`, {
          refreshToken,
        })

        const newAccess = res.data?.tokens?.access?.token
        const newRefresh = res.data?.tokens?.refresh?.token

        // Lưu lại token → lib token
        setTokens(newAccess, newRefresh, true)

        // Cập nhật Zustand → UI sync
        useAuthStore.getState().setAccessToken(newAccess)
        useAuthStore.getState().setRefreshToken(newRefresh)

        api.defaults.headers.Authorization = `Bearer ${newAccess}`

        processQueue(null, newAccess)

        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        useAuthStore.getState().clearState()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
