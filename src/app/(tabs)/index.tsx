import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useShallow } from "zustand/react/shallow";

import DeliveryCard from "@/components/delivery/DeliveryCard";
import OnlineToggle from "@/components/delivery/OnlineToggle";
import Greeting from "@/components/home/Greeting";
import SectionHeader from "@/components/home/SectionHeader";
import Screen from "@/components/layout/Screen";
import { colors } from "@/constants/theme";
import {
  selectActiveDelivery,
  selectAssignedDeliveries,
  useDeliveriesStore,
} from "@/store/deliveries.store";
import { useEarningsStore } from "@/store/earnings.store";
import { useProfileStore } from "@/store/profile.store";
import { formatPriceEUR } from "@/lib/format";

export default function HomeScreen(): React.ReactElement {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const online = useProfileStore((s) => s.online);
  const toggleOnline = useProfileStore((s) => s.toggleOnline);

  const active = useDeliveriesStore(selectActiveDelivery);
  const assigned = useDeliveriesStore(useShallow(selectAssignedDeliveries));

  const todayEUR = useEarningsStore((s) => s.todayEUR);
  const todayDeliveries = useEarningsStore((s) => s.todayDeliveries);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
        <Greeting
          name={profile.name}
          subtitle={online ? "Tu es en ligne. On t'envoie une course." : "Touche le bouton pour démarrer."}
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <OnlineToggle online={online} onToggle={toggleOnline} />
      </View>

      <View
        style={{
          marginHorizontal: 24,
          padding: 20,
          borderRadius: 16,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          gap: 12,
        }}
      >
        <Stat label="Aujourd'hui" value={formatPriceEUR(todayEUR)} accent />
        <Divider />
        <Stat label="Courses" value={String(todayDeliveries)} />
      </View>

      {active !== null ? (
        <>
          <SectionHeader
            title="En cours"
            subtitle="Termine cette course pour en recevoir une autre."
          />
          <DeliveryCard
            delivery={active}
            onPress={() => router.push(`/delivery/${active.id}`)}
          />
        </>
      ) : null}

      <SectionHeader
        title={online ? "Disponibles" : "En attente"}
        subtitle={
          online
            ? "Tape sur une course pour voir les détails."
            : "Passe en ligne pour recevoir des courses."
        }
      />

      {assigned.length === 0 ? (
        <View
          style={{
            marginHorizontal: 24,
            padding: 32,
            borderRadius: 16,
            backgroundColor: "#F5F5F5",
            alignItems: "center",
          }}
        >
          <Text
            className="font-sans-semibold text-on-surface-variant"
            style={{ fontSize: 14, textAlign: "center" }}
          >
            Aucune course pour l&apos;instant.{"\n"}On te ping dès qu&apos;une commande tombe.
          </Text>
        </View>
      ) : (
        assigned.map((d) => (
          <DeliveryCard
            key={d.id}
            delivery={d}
            onPress={() => router.push(`/delivery/${d.id}`)}
          />
        ))
      )}
    </Screen>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}): React.ReactElement {
  return (
    <View style={{ flex: 1 }}>
      <Text
        className="font-sans-bold uppercase"
        style={{ fontSize: 9, letterSpacing: 2, color: colors.inkMuted }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: "BebasNeue_400Regular",
          fontSize: 36,
          letterSpacing: -1,
          color: accent === true ? colors.accent : colors.ink,
          marginTop: 2,
          lineHeight: 38,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Divider(): React.ReactElement {
  return <View style={{ width: 1, backgroundColor: colors.border }} />;
}
