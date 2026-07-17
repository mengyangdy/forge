import { create } from "zustand";

import { localStg } from "@/utils/storage";

interface AuthStore {
  initialized: boolean;
  token: string | null;
  resetSession: () => void;
  setInitialized: (initialized: boolean) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  initialized: false,
  token: localStg.get("token") || null,
  resetSession: () => set({ initialized: false, token: null }),
  setInitialized: (initialized) => set({ initialized }),
  setToken: (token) => {
    set({ token });

    if (token) {
      localStg.set("token", token);
      return;
    }

    localStg.remove("token");
  },
}));

export function getToken() {
  return useAuthStore.getState().token ?? localStg.get("token");
}

export function setAuth(data: Api.Auth.LoginToken) {
  useAuthStore.getState().setToken(data.token);
  localStg.set("refreshToken", data.refreshToken);
}

export function clearAuthStorage() {
  localStg.remove("token");
  localStg.remove("refreshToken");
  useAuthStore.getState().resetSession();
}
