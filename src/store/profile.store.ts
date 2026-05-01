import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { DriverProfile } from "@/types";
import { asyncStorageAdapter } from "./_storage";

type ProfileState = {
  profile: DriverProfile;
  online: boolean;
  setProfile: (p: Partial<DriverProfile>) => void;
  setOnline: (v: boolean) => void;
  toggleOnline: () => void;
  bumpDeliveryCount: () => void;
};

const DEFAULT_PROFILE: DriverProfile = {
  name: "Driver",
  phone: "",
  vehicle: "scooter",
  rating: 5,
  deliveryCount: 0,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      online: false,

      setProfile: (p) => {
        set((s) => ({ profile: { ...s.profile, ...p } }));
      },

      setOnline: (v) => {
        set({ online: v });
      },

      toggleOnline: () => {
        set((s) => ({ online: !s.online }));
      },

      bumpDeliveryCount: () => {
        set((s) => ({
          profile: { ...s.profile, deliveryCount: s.profile.deliveryCount + 1 },
        }));
      },
    }),
    {
      name: "popsdriver.profile.v1",
      storage: createJSONStorage(() => asyncStorageAdapter),
      partialize: (state) => ({
        profile: state.profile,
        online: state.online,
      }),
    },
  ),
);
