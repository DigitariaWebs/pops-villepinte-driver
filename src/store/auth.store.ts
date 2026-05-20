import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { asyncStorageAdapter } from "./_storage";

type AuthState = {
  onboardingDone: boolean;
  authed: boolean;
  phone: string;
  completeOnboarding: () => void;
  login: (phone: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      onboardingDone: false,
      authed: false,
      phone: "",

      completeOnboarding: () => {
        set({ onboardingDone: true });
      },

      login: (phone) => {
        set({ authed: true, phone });
      },

      logout: () => {
        set({ authed: false, phone: "" });
      },
    }),
    {
      name: "popsdriver.auth.v2",
      storage: createJSONStorage(() => asyncStorageAdapter),
      partialize: (state) => ({
        onboardingDone: state.onboardingDone,
        authed: state.authed,
        phone: state.phone,
      }),
    },
  ),
);
