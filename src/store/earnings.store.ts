import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { asyncStorageAdapter } from "./_storage";

type EarningsState = {
  todayEUR: number;
  weekEUR: number;
  monthEUR: number;
  todayDeliveries: number;
  weekDeliveries: number;
  monthDeliveries: number;
  hoursOnlineToday: number;
  addPayout: (eur: number) => void;
  addOnlineMinutes: (min: number) => void;
};

export const useEarningsStore = create<EarningsState>()(
  persist(
    (set) => ({
      todayEUR: 0,
      weekEUR: 0,
      monthEUR: 0,
      todayDeliveries: 0,
      weekDeliveries: 0,
      monthDeliveries: 0,
      hoursOnlineToday: 0,

      addPayout: (eur) => {
        set((s) => ({
          todayEUR: s.todayEUR + eur,
          weekEUR: s.weekEUR + eur,
          monthEUR: s.monthEUR + eur,
          todayDeliveries: s.todayDeliveries + 1,
          weekDeliveries: s.weekDeliveries + 1,
          monthDeliveries: s.monthDeliveries + 1,
        }));
      },

      addOnlineMinutes: (min) => {
        set((s) => ({ hoursOnlineToday: s.hoursOnlineToday + min / 60 }));
      },
    }),
    {
      name: "popsdriver.earnings.v1",
      storage: createJSONStorage(() => asyncStorageAdapter),
    },
  ),
);
