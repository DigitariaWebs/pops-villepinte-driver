import { Linking, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Navigation, Phone } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import DeliveryStatusPill from "@/components/delivery/DeliveryStatusPill";
import RouteSummary from "@/components/delivery/RouteSummary";
import Screen from "@/components/layout/Screen";
import { colors, shadow } from "@/constants/theme";
import {
  formatDistanceMeters,
  formatDurationMinutes,
  formatPriceEUR,
  formatTimeFR,
} from "@/lib/format";
import { useDeliveriesStore } from "@/store/deliveries.store";
import { useEarningsStore } from "@/store/earnings.store";
import { useProfileStore } from "@/store/profile.store";
import type { DeliveryStatus } from "@/types";

const NEXT_LABEL: Partial<Record<DeliveryStatus, string>> = {
  assigned: "Accepter la course",
  accepted: "Lancer la navigation",
  picked_up: "Lancer la navigation",
};

const NEXT_STATUS: Partial<Record<DeliveryStatus, DeliveryStatus>> = {
  assigned: "accepted",
  // From "accepted" the driver navigates to the restaurant. Once at the resto
  // they tap the "j'ai récupéré" button (rendered separately below).
};

export default function DeliveryDetailScreen(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const delivery = useDeliveriesStore((s) => (id ? s.byId[id] : undefined));
  const setStatus = useDeliveriesStore((s) => s.setStatus);
  const bumpDeliveryCount = useProfileStore((s) => s.bumpDeliveryCount);
  const addPayout = useEarningsStore((s) => s.addPayout);

  if (delivery === undefined || id === undefined) {
    return (
      <Screen>
        <View style={{ padding: 24 }}>
          <Text className="font-sans-semibold text-on-surface" style={{ fontSize: 16 }}>
            Course introuvable.
          </Text>
        </View>
      </Screen>
    );
  }

  const callCustomer = (): void => {
    Linking.openURL(`tel:${delivery.customerPhone.replace(/\s+/g, "")}`).catch(() => {});
  };

  const launchNavigation = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push(`/navigate/${delivery.id}`);
  };

  const onPrimary = (): void => {
    if (delivery.status === "assigned") {
      setStatus(delivery.id, "accepted");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return;
    }
    if (delivery.status === "accepted" || delivery.status === "picked_up") {
      launchNavigation();
    }
  };

  const onPickedUp = (): void => {
    setStatus(delivery.id, "picked_up");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const onDelivered = (): void => {
    setStatus(delivery.id, "delivered");
    addPayout(delivery.driverPayoutEUR);
    bumpDeliveryCount();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  const primaryLabel = NEXT_LABEL[delivery.status];
  const showPickedUpBtn = delivery.status === "accepted";
  const showDeliveredBtn = delivery.status === "picked_up";

  return (
    <Screen
      floatingBottom={
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 32,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            gap: 10,
          }}
        >
          {primaryLabel !== undefined ? (
            <PrimaryButton label={primaryLabel} onPress={onPrimary} />
          ) : null}
          {showPickedUpBtn ? (
            <SecondaryButton label="J'ai récupéré la commande" onPress={onPickedUp} />
          ) : null}
          {showDeliveredBtn ? (
            <PrimaryButton label="Marquer comme livrée" onPress={onDelivered} success />
          ) : null}
        </View>
      }
    >
      <View
        className="flex-row items-center"
        style={{ paddingHorizontal: 24, paddingTop: 16, gap: 12 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => router.back()}
          hitSlop={12}
        >
          <ArrowLeft size={24} color={colors.ink} strokeWidth={2.5} />
        </Pressable>
        <Text
          className="font-sans-bold uppercase"
          style={{ fontSize: 12, letterSpacing: 2, color: colors.inkMuted }}
        >
          {delivery.shortCode}
        </Text>
        <View style={{ flex: 1 }} />
        <DeliveryStatusPill status={delivery.status} />
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
        <Text
          style={{
            fontFamily: "BebasNeue_400Regular",
            fontSize: 56,
            letterSpacing: -1.5,
            color: colors.ink,
            lineHeight: 60,
          }}
        >
          {delivery.customerName}
        </Text>
        <Text
          className="font-sans"
          style={{ fontSize: 14, color: colors.inkMuted, marginTop: 4 }}
        >
          Reçue à {formatTimeFR(delivery.createdAt)} ·{" "}
          {formatDistanceMeters(delivery.distanceMeters)} ·{" "}
          {formatDurationMinutes(delivery.estimatedDurationMinutes)}
        </Text>
      </View>

      <RouteSummary pickup={delivery.pickup} dropoff={delivery.dropoff} />

      <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
        <Text
          className="font-sans-bold uppercase"
          style={{ fontSize: 10, letterSpacing: 2, color: colors.inkMuted }}
        >
          Commande
        </Text>
        <View
          style={{
            marginTop: 12,
            padding: 20,
            borderRadius: 16,
            backgroundColor: "#F5F5F5",
            gap: 8,
          }}
        >
          {delivery.items.map((item, idx) => (
            <View
              key={idx}
              className="flex-row items-center justify-between"
              style={{ paddingVertical: 4 }}
            >
              <Text
                className="font-sans-semibold text-on-surface"
                style={{ fontSize: 14 }}
              >
                {item.quantity}× {item.name}
              </Text>
            </View>
          ))}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Text
              className="font-sans-bold uppercase"
              style={{ fontSize: 10, letterSpacing: 2, color: colors.inkMuted }}
            >
              Total client
            </Text>
            <Text className="font-sans-bold" style={{ fontSize: 16, color: colors.ink }}>
              {formatPriceEUR(delivery.totalEUR)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              className="font-sans-bold uppercase"
              style={{ fontSize: 10, letterSpacing: 2, color: colors.inkMuted }}
            >
              Ta part
            </Text>
            <Text
              style={{
                fontFamily: "BebasNeue_400Regular",
                fontSize: 28,
                letterSpacing: -0.5,
                color: colors.accent,
              }}
            >
              {formatPriceEUR(delivery.driverPayoutEUR)}
            </Text>
          </View>
        </View>
      </View>

      <View
        className="flex-row"
        style={{ paddingHorizontal: 24, marginTop: 16, gap: 12 }}
      >
        <ActionTile
          icon={<Phone size={18} color={colors.ink} strokeWidth={2.5} />}
          label="Appeler"
          onPress={callCustomer}
        />
        <ActionTile
          icon={<Navigation size={18} color={colors.ink} strokeWidth={2.5} />}
          label="Navigation"
          onPress={launchNavigation}
        />
      </View>
    </Screen>
  );
}

function PrimaryButton({
  label,
  onPress,
  success,
}: {
  label: string;
  onPress: () => void;
  success?: boolean;
}): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: success === true ? colors.success : colors.ink,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.92 : 1,
        ...shadow.card,
      })}
    >
      <Text
        style={{
          fontFamily: "Poppins_700Bold",
          fontSize: 14,
          letterSpacing: 2,
          color: success === true ? colors.surface : colors.primary,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: colors.ink,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: "Poppins_700Bold",
          fontSize: 13,
          letterSpacing: 2,
          color: colors.ink,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ActionTile({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {icon}
      <Text className="font-sans-bold" style={{ fontSize: 13, color: colors.ink }}>
        {label}
      </Text>
    </Pressable>
  );
}
