import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { api } from "./api";

// Foreground notification handling — show alert + play sound so the driver
// hears an incoming order even when the app is open.
// Wrapped because the native module is absent in dev clients that haven't been
// rebuilt after adding expo-notifications; failing here would break the whole
// app at import time.
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch {
  // Native module not linked — push features will no-op until a rebuild.
}

export async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync("orders", {
      name: "Commandes",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FFCE00",
    });
  } catch {
    // ignore
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  await ensureNotificationChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let granted = existing === "granted";
  if (!granted) {
    const { status } = await Notifications.requestPermissionsAsync();
    granted = status === "granted";
  }
  if (!granted) return null;

  const projectId =
    (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)
      ?.eas?.projectId ??
    (Constants.easConfig as { projectId?: string } | undefined)?.projectId;

  const tokenRes = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  const token = tokenRes.data;

  // Best-effort: register with backend. Caller may catch failures.
  try {
    await api.post("/driver/push-token", { expo_push_token: token });
  } catch {
    // Driver may not be authed yet — registration happens again on next launch.
  }

  return token;
}

export type IncomingAssignmentData = {
  type: "order_assignment";
  assignment_id: string;
  order_id: string;
};

export function isAssignmentNotification(
  data: unknown,
): data is IncomingAssignmentData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    d.type === "order_assignment" &&
    typeof d.assignment_id === "string" &&
    typeof d.order_id === "string"
  );
}
