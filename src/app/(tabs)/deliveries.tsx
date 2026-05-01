import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useShallow } from "zustand/react/shallow";

import DeliveryCard from "@/components/delivery/DeliveryCard";
import SectionHeader from "@/components/home/SectionHeader";
import Screen from "@/components/layout/Screen";
import { colors } from "@/constants/theme";
import {
  selectAssignedDeliveries,
  selectCompletedDeliveries,
  useDeliveriesStore,
} from "@/store/deliveries.store";

export default function DeliveriesScreen(): React.ReactElement {
  const router = useRouter();
  const assigned = useDeliveriesStore(useShallow(selectAssignedDeliveries));
  const completed = useDeliveriesStore(useShallow(selectCompletedDeliveries));

  return (
    <Screen>
      <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        <Text
          className="font-sans-bold uppercase"
          style={{ fontSize: 11, letterSpacing: 3, color: colors.inkMuted }}
        >
          Tableau de bord
        </Text>
        <Text
          style={{
            fontFamily: "BebasNeue_400Regular",
            fontSize: 56,
            letterSpacing: -1.5,
            color: colors.ink,
            marginTop: 8,
            lineHeight: 60,
          }}
        >
          Livraisons
        </Text>
      </View>

      <SectionHeader
        title="À faire"
        subtitle={
          assigned.length === 0
            ? "Aucune course en attente."
            : `${assigned.length} course${assigned.length > 1 ? "s" : ""} disponible${assigned.length > 1 ? "s" : ""}.`
        }
      />

      {assigned.length === 0 ? (
        <EmptyState message="Quand tu seras en ligne, les courses apparaîtront ici." />
      ) : (
        assigned.map((d) => (
          <DeliveryCard
            key={d.id}
            delivery={d}
            onPress={() => router.push(`/delivery/${d.id}`)}
          />
        ))
      )}

      <SectionHeader
        title="Historique"
        subtitle={
          completed.length === 0
            ? "Tu n'as pas encore livré de course."
            : `${completed.length} course${completed.length > 1 ? "s" : ""} terminée${completed.length > 1 ? "s" : ""}.`
        }
      />

      {completed.length === 0 ? (
        <EmptyState message="Tes livraisons effectuées s'afficheront ici." />
      ) : (
        completed.map((d) => (
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

function EmptyState({ message }: { message: string }): React.ReactElement {
  return (
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
        {message}
      </Text>
    </View>
  );
}
