import { Text, View } from "react-native";

import EarningsHeroCard from "@/components/earnings/EarningsHeroCard";
import SectionHeader from "@/components/home/SectionHeader";
import Screen from "@/components/layout/Screen";
import { colors } from "@/constants/theme";
import { formatPriceEUR } from "@/lib/format";
import { useEarningsStore } from "@/store/earnings.store";

export default function EarningsScreen(): React.ReactElement {
  const todayEUR = useEarningsStore((s) => s.todayEUR);
  const weekEUR = useEarningsStore((s) => s.weekEUR);
  const monthEUR = useEarningsStore((s) => s.monthEUR);
  const todayDeliveries = useEarningsStore((s) => s.todayDeliveries);
  const weekDeliveries = useEarningsStore((s) => s.weekDeliveries);
  const monthDeliveries = useEarningsStore((s) => s.monthDeliveries);
  const hoursOnlineToday = useEarningsStore((s) => s.hoursOnlineToday);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 }}>
        <Text
          className="font-sans-bold uppercase"
          style={{ fontSize: 11, letterSpacing: 3, color: colors.inkMuted }}
        >
          Tes gains
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
          Cash flow
        </Text>
      </View>

      <View style={{ marginTop: 16 }}>
        <EarningsHeroCard
          amountEUR={todayEUR}
          deliveries={todayDeliveries}
          hoursOnline={hoursOnlineToday}
          periodLabel="Aujourd'hui"
        />
      </View>

      <SectionHeader title="Cumul" />

      <View style={{ marginHorizontal: 24, gap: 12 }}>
        <SummaryRow label="Cette semaine" amount={weekEUR} count={weekDeliveries} />
        <SummaryRow label="Ce mois-ci" amount={monthEUR} count={monthDeliveries} />
      </View>
    </Screen>
  );
}

function SummaryRow({
  label,
  amount,
  count,
}: {
  label: string;
  amount: number;
  count: number;
}): React.ReactElement {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        borderRadius: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View>
        <Text
          className="font-sans-bold uppercase"
          style={{ fontSize: 10, letterSpacing: 2, color: colors.inkMuted }}
        >
          {label}
        </Text>
        <Text
          className="font-sans"
          style={{ fontSize: 13, color: colors.inkMuted, marginTop: 2 }}
        >
          {count} course{count > 1 ? "s" : ""}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: "BebasNeue_400Regular",
          fontSize: 36,
          letterSpacing: -1,
          color: colors.ink,
        }}
      >
        {formatPriceEUR(amount)}
      </Text>
    </View>
  );
}
