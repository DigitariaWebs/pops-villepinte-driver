import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";

import { colors, shadow } from "@/constants/theme";
import { MAPBOX_PUBLIC_TOKEN } from "@/lib/mapbox";
import { useDeliveriesStore } from "@/store/deliveries.store";
import type { LngLat } from "@/types";

// Mock driver origin near POP'S Villepinte — used during development so the
// turn-by-turn navigation works on the simulator without needing a real GPS
// fix. POP'S pickup coordinates are [2.5413, 48.9622]; this point is ~600m
// south-west, on a real road, so Mapbox Directions returns a valid route.
const MOCK_DRIVER_ORIGIN: LngLat = [2.5350, 48.9580];

// Lazy-resolve the native module so the screen still renders a graceful
// fallback in Expo Go (where native modules aren't linked).
type MapboxNavigationViewProps = {
  coordinates: { latitude: number; longitude: number }[];
  useRouteMatchingApi?: boolean;
  travelMode?: "driving" | "driving-traffic" | "cycling" | "walking";
  language?: string;
  units?: "metric" | "imperial";
  mute?: boolean;
  routeProfile?: string;
  onArrive?: () => void;
  onCancelNavigation?: () => void;
  onRouteProgressChange?: (e: {
    nativeEvent: {
      distanceRemaining: number;
      distanceTraveled: number;
      durationRemaining: number;
      fractionTraveled: number;
    };
  }) => void;
  style?: object;
};

let MapboxNavigationView:
  | React.ComponentType<MapboxNavigationViewProps>
  | null = null;
let mapboxNavigationLoadError: string | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("@badatgil/expo-mapbox-navigation");
  MapboxNavigationView = mod.MapboxNavigationView ?? mod.default ?? null;
} catch (err) {
  mapboxNavigationLoadError =
    err instanceof Error ? err.message : "Module Mapbox introuvable";
}

export default function NavigateScreen(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const delivery = useDeliveriesStore((s) => (id ? s.byId[id] : undefined));

  // EXPERIMENTAL: hardcoded driver origin instead of simulator GPS. Lets the
  // turn-by-turn UI run on the simulator without permission/location plumbing.
  const origin: LngLat = MOCK_DRIVER_ORIGIN;

  // Pickup vs. dropoff routing decision: if not yet picked up, navigate to
  // restaurant; otherwise navigate to customer.
  const destination: LngLat | undefined = useMemo(() => {
    if (delivery === undefined) return undefined;
    if (delivery.status === "picked_up") return delivery.dropoff.coordinates;
    return delivery.pickup.coordinates;
  }, [delivery]);

  if (delivery === undefined || destination === undefined) {
    return <Fallback message="Course introuvable." onClose={() => router.back()} />;
  }

  if (MAPBOX_PUBLIC_TOKEN === "") {
    return (
      <Fallback
        message="Token Mapbox manquant. Ajoute EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN dans ton .env."
        onClose={() => router.back()}
      />
    );
  }

  if (mapboxNavigationLoadError !== null || MapboxNavigationView === null) {
    return (
      <Fallback
        message={
          "Le module de navigation natif n'est pas installé.\n" +
          "Lance `expo prebuild --clean` puis `expo run:ios` ou `expo run:android`.\n\n" +
          (mapboxNavigationLoadError ?? "")
        }
        onClose={() => router.back()}
      />
    );
  }

  const NavView = MapboxNavigationView;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <NavView
        style={{ flex: 1 }}
        coordinates={[
          { longitude: origin[0], latitude: origin[1] },
          { longitude: destination[0], latitude: destination[1] },
        ]}
        travelMode="driving-traffic"
        language="fr"
        units="metric"
        onArrive={() => router.back()}
        onCancelNavigation={() => router.back()}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fermer la navigation"
        onPress={() => router.back()}
        style={[
          {
            position: "absolute",
            top: 56,
            right: 20,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          },
          shadow.float,
        ]}
      >
        <X size={20} color={colors.ink} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

function Fallback({
  message,
  onClose,
  loading,
  actionLabel,
  onAction,
}: {
  message: string;
  onClose: () => void;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}): React.ReactElement {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 32,
        justifyContent: "center",
      }}
    >
      <Text
        className="font-sans-bold uppercase"
        style={{ fontSize: 11, letterSpacing: 3, color: colors.inkMuted }}
      >
        Navigation
      </Text>
      <Text
        style={{
          fontFamily: "BebasNeue_400Regular",
          fontSize: 44,
          letterSpacing: -1.5,
          color: colors.ink,
          marginTop: 12,
          lineHeight: 48,
        }}
      >
        {loading === true ? "Un instant…" : "On ne peut pas démarrer."}
      </Text>
      <Text
        className="font-sans"
        style={{
          fontSize: 14,
          lineHeight: 22,
          color: colors.inkMuted,
          marginTop: 16,
        }}
      >
        {message}
      </Text>

      {loading === true ? null : (
        <>
          {actionLabel !== undefined && onAction !== undefined ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
              onPress={onAction}
              style={({ pressed }) => ({
                marginTop: 32,
                backgroundColor: colors.ink,
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.9 : 1,
                ...shadow.card,
              })}
            >
              <Text
                style={{
                  fontFamily: "Poppins_700Bold",
                  fontSize: 14,
                  letterSpacing: 2,
                  color: colors.primary,
                  textTransform: "uppercase",
                }}
              >
                {actionLabel}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            onPress={onClose}
            style={({ pressed }) => ({
              marginTop: actionLabel !== undefined ? 12 : 32,
              backgroundColor: actionLabel !== undefined ? "transparent" : colors.ink,
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.6 : 1,
              ...(actionLabel !== undefined ? {} : shadow.card),
            })}
          >
            <Text
              style={{
                fontFamily: "Poppins_700Bold",
                fontSize: 14,
                letterSpacing: 2,
                color: actionLabel !== undefined ? colors.inkMuted : colors.primary,
                textTransform: "uppercase",
              }}
            >
              Fermer
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
