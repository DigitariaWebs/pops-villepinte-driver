import { api } from "./api";

export type RemoteAssignmentStatus =
  | "pending"
  | "accepted"
  | "refused"
  | "cancelled";

export type RemoteAssignment = {
  id: string;
  order_id: string;
  status: RemoteAssignmentStatus;
  note: string | null;
  assigned_at: string;
  responded_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  orders?: {
    id: string;
    total_eur: number;
    customer_name: string;
    customer_phone: string | null;
    notes: string | null;
    created_at: string;
    estimated_ready_at: string;
    status: string;
    order_items?: {
      id: string;
      product_id: string;
      quantity: number;
      unit_price_eur: number;
      notes: string | null;
    }[];
  } | null;
};

export async function fetchAssignment(id: string): Promise<RemoteAssignment> {
  const res = await api.get<RemoteAssignment>(`/driver/assignments/${id}`);
  return res.data;
}

export async function listAssignments(
  status?: RemoteAssignmentStatus,
): Promise<RemoteAssignment[]> {
  const res = await api.get<RemoteAssignment[]>("/driver/assignments", {
    params: status ? { status } : undefined,
  });
  return res.data ?? [];
}

export async function respondToAssignment(
  id: string,
  status: "accepted" | "refused",
  note?: string,
): Promise<RemoteAssignment> {
  const res = await api.patch<RemoteAssignment>(
    `/driver/assignments/${id}/respond`,
    { status, note: note?.trim() || undefined },
  );
  return res.data;
}
