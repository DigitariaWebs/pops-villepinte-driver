import axios, { AxiosInstance } from "axios";
import Constants from "expo-constants";

import { getSupabase } from "./supabase";

const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };
const baseURL =
  extra.apiBaseUrl ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "http://localhost:3000/api/v1";

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization =
        `Bearer ${token}`;
    }
  } catch {
    // No supabase env / no session — request will 401 if route requires auth.
  }
  return config;
});

api.interceptors.response.use((response) => {
  const body = response.data;
  if (body && typeof body === "object" && "data" in body) {
    response.data = (body as { data: unknown }).data;
  }
  return response;
});

export function apiErrorMessage(err: unknown, fallback = "Erreur inconnue"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(", ") : data.message;
    }
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
