import { ThemeState } from '@/types/store';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

let nextThemeSetter: ((theme: string) => void) | null = null;

export const registerNextThemeSetter = (fn: (theme: string) => void) => {
  nextThemeSetter = fn;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set,get) => ({
      isDark: false,
      toggleTheme: () => {
        const newValue = !get().isDark;
        set({ isDark: newValue });

        if (typeof window !== 'undefined') {
          if (newValue) {
            document.documentElement.classList.add('dark');     
          } else {
            document.documentElement.classList.remove('dark');
          }
        }

        if (nextThemeSetter) {
          nextThemeSetter(newValue ? "dark" : "light");
        }
    },
      setTheme: (dark: boolean) => {
        set({ isDark: dark });

        if (typeof window !== 'undefined') {
          if (dark) {
            document.documentElement.classList.add('dark');     
          } else {
            document.documentElement.classList.remove('dark');
          }
        }

        if (nextThemeSetter) {
          nextThemeSetter(dark ? "dark" : "light");
        }
      },
    }),
    {
      name: 'theme-storage', // name of the item in the storage (should be unique)
    }
  )
);  