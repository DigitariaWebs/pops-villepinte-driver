import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { asyncStorageAdapter } from "./_storage";

type AuthState = {
  onboardingDone: boolean;
  authed: boolean;
  signupDone: boolean;
  phone: string;
  completeOnboarding: () => void;
  login: (phone: string, skipSignup: boolean) => void;
  completeSignup: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      onboardingDone: false,
      authed: false,
      signupDone: false,
      phone: "",

      completeOnboarding: () => {
        set({ onboardingDone: true });
      },

      login: (phone, skipSignup) => {
        set({ authed: true, phone, signupDone: skipSignup });
      },

      completeSignup: () => {
        set({ signupDone: true });
      },

      logout: () => {
        set({ onboardingDone: false, authed: false, signupDone: false, phone: "" });
      },
    }),
    {
      name: "popsdriver.auth.v1",
      storage: createJSONStorage(() => asyncStorageAdapter),
      partialize: (state) => ({
        onboardingDone: state.onboardingDone,
        authed: state.authed,
        signupDone: state.signupDone,
        phone: state.phone,
      }),
    },
  ),
);
