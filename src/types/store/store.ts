import { user } from './../../db/schema';
export type Store = {
  id: string
  name: string
  address: string
  city: string
  distance: number
  coordinates: [number, number]
  hours: Record<string, string>
  phone: string
  features: string[]
}

export interface AuthState {
  signUp: {
    username: string
    email: string
    password: string  
    firstNme: string
    lastName: string
  },
  signIn: {username: string, password: string},
  signOut: Promise<void>,
  fetchMe: Promise<void>,
  refresh: Promise<void>,
}

export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}
