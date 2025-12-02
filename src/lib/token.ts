import { Nullable } from "@/types/common"

// 📦 Lưu cả access + refresh (giữ nguyên)
export const setTokens = (access: string, refresh: string, keepLoggedIn: boolean) => {
  if (typeof window !== "undefined") {
    const storage = keepLoggedIn ? localStorage : sessionStorage
    storage.setItem("accessToken", access)
    storage.setItem("refreshToken", refresh)
  }
}

// 📦 NEW — chỉ set accessToken (ví dụ: refresh token xong)
export const setAccessToken = (access: string) => {
  if (typeof window !== "undefined") {
    // Ưu tiên nơi đang lưu token hiện tại
    if (localStorage.getItem("accessToken") !== null) {
      localStorage.setItem("accessToken", access)
    } else {
      sessionStorage.setItem("accessToken", access)
    }
  }
}

// 📦 NEW — chỉ set refreshToken
export const setRefreshToken = (refresh: string) => {
  if (typeof window !== "undefined") {
    if (localStorage.getItem("refreshToken") !== null) {
      localStorage.setItem("refreshToken", refresh)
    } else {
      sessionStorage.setItem("refreshToken", refresh)
    }
  }
}

// 🧹 Xóa toàn bộ token
export const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    sessionStorage.removeItem("accessToken")
    sessionStorage.removeItem("refreshToken")
  }
}

// 🟢 get accessToken (ưu tiên localStorage)
export const getAccessToken = (): Nullable<string> => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  }
  return null
}

// 🟢 get refreshToken
export const getRefreshToken = (): Nullable<string> => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken")
  }
  return null
}
