export type LngLat = readonly [number, number]; // [lng, lat]

export type DeliveryStatus =
  | "assigned"      // assigned to driver, not yet accepted
  | "accepted"      // driver accepted, on the way to pickup
  | "picked_up"     // order picked up at restaurant, en route to customer
  | "delivered"     // delivered to customer
  | "cancelled";

export type DeliveryAddress = {
  label: string;          // "POP'S Villepinte" or customer name
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  coordinates: LngLat;
  notes?: string;         // gate code, instructions
};

export type DeliveryItem = {
  name: string;
  quantity: number;
};

export type Delivery = {
  id: string;
  shortCode: string;            // "PV-2041" — what the driver references on the phone
  status: DeliveryStatus;
  pickup: DeliveryAddress;
  dropoff: DeliveryAddress;
  customerName: string;
  customerPhone: string;
  items: DeliveryItem[];
  totalEUR: number;
  driverPayoutEUR: number;
  distanceMeters: number;
  estimatedDurationMinutes: number;
  createdAt: string;            // ISO
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
};

export type DriverProfile = {
  name: string;
  phone: string;
  vehicle: "scooter" | "bike" | "car";
  licensePlate?: string;
  rating: number;               // 0..5
  deliveryCount: number;
};

export type EarningsBucket = {
  periodLabel: string;          // "Aujourd'hui", "Cette semaine", "Avril 2026"
  totalEUR: number;
  deliveryCount: number;
  hoursOnline: number;
};
