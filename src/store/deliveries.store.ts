import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Delivery, DeliveryStatus } from "@/types";
import { MOCK_DELIVERIES } from "@/data/deliveries";
import { asyncStorageAdapter } from "./_storage";

type DeliveriesState = {
  byId: Record<string, Delivery>;
  order: string[];           // stable display order
  activeId: string | null;   // currently-in-progress delivery (accepted | picked_up)
  setStatus: (id: string, status: DeliveryStatus) => void;
  setActive: (id: string | null) => void;
  reset: () => void;
};

function seed(): Pick<DeliveriesState, "byId" | "order"> {
  const byId: Record<string, Delivery> = {};
  for (const d of MOCK_DELIVERIES) byId[d.id] = d;
  return { byId, order: MOCK_DELIVERIES.map((d) => d.id) };
}

export const useDeliveriesStore = create<DeliveriesState>()(
  persist(
    (set) => ({
      ...seed(),
      activeId: null,

      setStatus: (id, status) => {
        set((s) => {
          const existing = s.byId[id];
          if (existing === undefined) return s;
          const now = new Date().toISOString();
          const updated: Delivery = {
            ...existing,
            status,
            acceptedAt:
              status === "accepted" && existing.acceptedAt === undefined
                ? now
                : existing.acceptedAt,
            pickedUpAt:
              status === "picked_up" && existing.pickedUpAt === undefined
                ? now
                : existing.pickedUpAt,
            deliveredAt:
              status === "delivered" && existing.deliveredAt === undefined
                ? now
                : existing.deliveredAt,
          };
          const nextActive =
            status === "accepted" || status === "picked_up"
              ? id
              : s.activeId === id
                ? null
                : s.activeId;
          return {
            byId: { ...s.byId, [id]: updated },
            activeId: nextActive,
          };
        });
      },

      setActive: (id) => {
        set({ activeId: id });
      },

      reset: () => {
        set({ ...seed(), activeId: null });
      },
    }),
    {
      name: "popsdriver.deliveries.v1",
      storage: createJSONStorage(() => asyncStorageAdapter),
    },
  ),
);

export function selectActiveDelivery(s: DeliveriesState): Delivery | null {
  if (s.activeId === null) return null;
  return s.byId[s.activeId] ?? null;
}

export function selectAssignedDeliveries(s: DeliveriesState): Delivery[] {
  return s.order
    .map((id) => s.byId[id])
    .filter((d): d is Delivery => d !== undefined && d.status === "assigned");
}

export function selectCompletedDeliveries(s: DeliveriesState): Delivery[] {
  return s.order
    .map((id) => s.byId[id])
    .filter(
      (d): d is Delivery =>
        d !== undefined && (d.status === "delivered" || d.status === "cancelled"),
    );
}
