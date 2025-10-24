import { Nullable } from "@/types/common"

// 📦 apps/web/lib/token.ts
export const setTokens = (access: string, refresh: string, keepLoggedIn: boolean) => {
  if (typeof window !== "undefined") {
    const storage = keepLoggedIn ? localStorage : sessionStorage
    storage.setItem("accessToken", access)
    storage.setItem("refreshToken", refresh)
  }
}

export const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("googleAccessToken")
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    sessionStorage.removeItem("accessToken")
    sessionStorage.removeItem("refreshToken")
  }
}

export const getGoogleAccessToken = (): Nullable<string> => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("googleAccessToken") || sessionStorage.getItem("googleAccessToken")
  }
  return null
}

export const getAccessToken = (): Nullable<string> => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  }
  return null
}

export const getRefreshToken = (): Nullable<string> => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken")
  }
  return null
}
