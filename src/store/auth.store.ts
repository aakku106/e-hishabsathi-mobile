import { create } from "zustand";

export type UserSession = {
  pan: string | null;
  username: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (session: { pan: string; username: string }) => void;
  logout: () => void;
  hydrate: (session: { pan: string | null; username: string | null }) => void;
};

export const useAuthStore = create<UserSession>((set) => ({
  pan: null,
  username: null,
  isAuthenticated: false,
  isHydrated: false,
  login: ({ pan, username }) => set({ pan, username, isAuthenticated: true }),
  logout: () => set({ pan: null, username: null, isAuthenticated: false }),
  hydrate: ({ pan, username }) =>
    set({
      pan,
      username,
      isAuthenticated: Boolean(pan && username),
      isHydrated: true,
    }),
}));
