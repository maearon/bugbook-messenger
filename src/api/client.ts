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
    const original = error.config as InternalAxiosRequestConfig | undefined

    // if no original config, just reject
    if (!original) return Promise.reject(error)

    const originalUrl = String(original.url || "")

    // Bỏ qua login/register/refresh
    if (
      originalUrl.includes("/auth/login") ||
      originalUrl.includes("/auth/register") ||
      originalUrl.includes("/auth/refresh-tokens")
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
              if (!original.headers) original.headers = {}
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
          // no refresh token -> clear state everywhere
          clearTokens()
          try { useAuthStore.getState().clearState() } catch (_) {}
          // notify other parts (AuthContext) to logout
          window.dispatchEvent(new CustomEvent("auth:logged_out"))
          return Promise.reject(error)
        }

        // Use axios (not api) to call refresh (avoid interceptor loop)
        const res = await axios.post(`${BASE_URL}/auth/refresh-tokens`, {
          refreshToken,
        })

        const newAccess = res.data?.tokens?.access?.token
        const newRefresh = res.data?.tokens?.refresh?.token

        if (!newAccess) {
          throw new Error("Refresh returned no access token")
        }

        // Lưu lại token → lib token
        setTokens(newAccess, newRefresh, true)

        // Cập nhật Zustand → UI sync
        try {
          useAuthStore.getState().setAccessToken(newAccess)
          useAuthStore.getState().setRefreshToken(newRefresh)
        } catch (_) {}

        // update default header for future requests
        api.defaults.headers.Authorization = `Bearer ${newAccess}`

        // Inform other parts of the app (AuthContext, SocketProvider) that tokens updated
        window.dispatchEvent(new CustomEvent("auth:tokens_updated", {
          detail: { accessToken: newAccess, refreshToken: newRefresh }
        }))

        processQueue(null, newAccess)

        if (!original.headers) original.headers = {}
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        try { useAuthStore.getState().clearState() } catch (_) {}
        // notify other parts to logout/clear state
        window.dispatchEvent(new CustomEvent("auth:logged_out"))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
