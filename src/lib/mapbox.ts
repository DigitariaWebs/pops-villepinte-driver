import Constants from "expo-constants";

/**
 * Mapbox public access token (pk.*) — safe to embed in the JS bundle.
 * Restrict the token to the app's bundle IDs in the Mapbox dashboard.
 *
 * Resolution order:
 *   1. EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN (env at build time)
 *   2. expo.extra.mapboxPublicToken (app.json fallback)
 */
export const MAPBOX_PUBLIC_TOKEN: string =
  process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN ??
  (Constants.expoConfig?.extra?.mapboxPublicToken as string | undefined) ??
  "";

export type LngLat = readonly [number, number]; // [lng, lat]

export const POPS_VILLEPINTE_ORIGIN: LngLat = [2.5413, 48.9622]; // Villepinte, FR (approx.)
