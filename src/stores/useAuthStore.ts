import { user } from './../db/schema';

import { create } from 'zustand';
import { toast } from 'sonner';
import { authService } from '@/lib/services';
import type { AuthState } from '@/types/store';

import { persist } from 'zustand/middleware';
import { useChatStore } from './useChatStore';

export const useAuthStore = create<AuthState>()(
  persist(
    (set,get) => ({
        accessToken: null,
        user: null,
        loading: false,

        setAccessToken: (accessToken) => {
          set({ accessToken });
        },
        clearState: () => {
          set({
            accessToken: null,
            user: null,
            loading: false,
          });
          localStorage.clear();
          useChatStore.getState().reset();
        },

        signUp: async (username, email, password, firstName, lastName) => {
          try {
            set({ loading: true });
            // Call sign up service api
            await authService.signUp(username, email, password, firstName, lastName);
            toast.success("Sign up successful! You will redirect to sign in.");
          } catch (error: any) {
            toast.error(error?.message || "Sign up failed");
            throw error;
          } finally {
            set({ loading: false });
          }
        },

        signIn: async (username, password) => {
            try {
                set({ loading: true });
                localStorage.clear();
                const { accessToken } =  await authService.signIn(username, password);
                get().setAccessToken(accessToken);
                await get().fetchMe();
                useChatStore.getState().fetchConversations();
                toast.success("Sign in successful!");
            } catch (error: any) {
                toast.error(error?.message || "Sign in failed");
                throw error;
            } finally {
                set({ loading: false });
            }
        },

        signOut: async () => {  
            try {
                set({ loading: true });
                await authService.signOut();
                get().clearState();
            } catch (error: any) {
                toast.error(error?.message || "Sign out failed");
                throw error;
            } finally {
                set({ loading: false });
            }   
        },

        fetchMe: async () => {
            try {
                set({ loading: true });
                const user = await authService.fetchMe();
                set({ user });
            } catch (error: any) {
                toast.error(error?.message || "Fetch user failed");
                throw error;
            } finally {
                set({ loading: false });
            }   
        },

        refresh: async () => {
            try {
                set({ loading: true });
                const { accessToken, user } = await authService.refresh();
                set({ accessToken, user });
            } catch (error: any) {
                toast.error(error?.message || "Refresh token failed");
                throw error;
            } finally {
                set({ loading: false });
            }   
        },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (should be unique)
      partialize: (state) => ({conversations: state.conversations}),
    }
  )
);  