import { Pressable, Text, View } from "react-native";
import { MapPin, Navigation, Package } from "lucide-react-native";

import { colors, shadow } from "@/constants/theme";
import { formatDistanceMeters, formatDurationMinutes, formatPriceEUR } from "@/lib/format";
import type { Delivery } from "@/types";

import DeliveryStatusPill from "./DeliveryStatusPill";

export type DeliveryCardProps = {
  delivery: Delivery;
  onPress: () => void;
};

export default function DeliveryCard({
  delivery,
  onPress,
}: DeliveryCardProps): React.ReactElement {
  const itemCount = delivery.items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Livraison ${delivery.shortCode}`}
      onPress={onPress}
      style={({ pressed }) => ({
        marginHorizontal: 24,
        marginBottom: 16,
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View
        className="bg-surface rounded-xl"
        style={[
          {
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
          },
          shadow.card,
        ]}
      >
        <View className="flex-row items-center justify-between" style={{ marginBottom: 14 }}>
          <Text
            className="font-sans-bold text-on-surface uppercase"
            style={{ fontSize: 12, letterSpacing: 2 }}
          >
            {delivery.shortCode}
          </Text>
          <DeliveryStatusPill status={delivery.status} />
        </View>

        <View style={{ gap: 10 }}>
          <Row
            icon={<Package size={16} color={colors.ink} strokeWidth={2.5} />}
            primary={delivery.pickup.label}
            secondary={`${itemCount} article${itemCount > 1 ? "s" : ""}`}
          />
          <Row
            icon={<MapPin size={16} color={colors.accent} strokeWidth={2.5} />}
            primary={delivery.dropoff.label}
            secondary={`${delivery.dropoff.line1} · ${delivery.dropoff.postalCode}`}
          />
        </View>

        <View
          className="flex-row items-center justify-between"
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Navigation size={14} color={colors.inkMuted} strokeWidth={2.5} />
            <Text
              className="font-sans-semibold text-on-surface-variant"
              style={{ fontSize: 12 }}
            >
              {formatDistanceMeters(delivery.distanceMeters)} ·{" "}
              {formatDurationMinutes(delivery.estimatedDurationMinutes)}
            </Text>
          </View>
          <Text
            className="font-sans-bold text-on-surface"
            style={{
              fontFamily: "BebasNeue_400Regular",
              fontSize: 22,
              letterSpacing: -0.5,
              color: colors.ink,
            }}
          >
            {formatPriceEUR(delivery.driverPayoutEUR)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function Row({
  icon,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  primary: string;
  secondary: string;
}): React.ReactElement {
  return (
    <View className="flex-row items-start" style={{ gap: 10 }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: "#F5F5F5",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
        }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text
          className="font-sans-semibold text-on-surface"
          style={{ fontSize: 14, lineHeight: 18 }}
        >
          {primary}
        </Text>
        <Text
          className="font-sans text-on-surface-variant"
          style={{ fontSize: 12, lineHeight: 16, marginTop: 1 }}
          numberOfLines={1}
        >
          {secondary}
        </Text>
      </View>
    </View>
  );
}
