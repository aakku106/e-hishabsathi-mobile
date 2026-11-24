import { create } from "zustand";

export type UserSession = {
  pan: string | null;
  username: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  /**
   * Signed in through the guest button: no PAN/username, and the session is
   * persisted like a normal one so the login screen does not come back.
   */
  isGuest: boolean;
  login: (session: { pan: string; username: string }) => void;
  loginAsGuest: () => void;
  logout: () => void;
  hydrate: (session: {
    pan: string | null;
    username: string | null;
    isGuest: boolean;
  }) => void;
};

export const useAuthStore = create<UserSession>((set) => ({
  pan: null,
  username: null,
  isAuthenticated: false,
  isHydrated: false,
  isGuest: false,
  login: ({ pan, username }) =>
    set({ pan, username, isGuest: false, isAuthenticated: true }),
  loginAsGuest: () =>
    set({ pan: null, username: null, isGuest: true, isAuthenticated: true }),
  logout: () =>
    set({ pan: null, username: null, isGuest: false, isAuthenticated: false }),
  hydrate: ({ pan, username, isGuest }) =>
    set({
      pan,
      username,
      isGuest,
      isAuthenticated: Boolean((pan && username) || isGuest),
      isHydrated: true,
    }),
}));
