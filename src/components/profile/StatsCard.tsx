import { Text, View } from "react-native";

export type StatsCardProps = {
  deliveryCount: number;
  name: string;
};

function loyaltyCopy(count: number, name: string): string {
  if (count === 0) return "Première tournée ? Bienvenue dans l'équipe Pop's.";
  if (count <= 20) return `Bienvenue ${name}, on apprend à se connaître.`;
  if (count <= 100) return "Tu fais partie des piliers. On compte sur toi.";
  return `Légende de la route. Respect, ${name}.`;
}

export default function StatsCard({
  deliveryCount,
  name,
}: StatsCardProps): React.ReactElement {
  return (
    <View
      className="bg-surface-container-low rounded-xl"
      style={{
        marginHorizontal: 24,
        paddingHorizontal: 28,
        paddingVertical: 28,
      }}
    >
      <View
        className="bg-primary"
        style={{ width: 32, height: 2, marginBottom: 20 }}
      />

      <Text
        className="font-sans-bold text-on-surface-variant uppercase"
        style={{ fontSize: 10, letterSpacing: 2 }}
      >
        Livraisons effectuées
      </Text>

      <Text
        className="text-primary"
        style={{
          fontFamily: "BebasNeue_400Regular",
          fontSize: 56,
          letterSpacing: -2,
          marginTop: 4,
        }}
      >
        {deliveryCount}
      </Text>

      <Text
        className="font-sans text-on-surface-variant"
        style={{ fontSize: 14, lineHeight: 20, marginTop: 12 }}
      >
        {loyaltyCopy(deliveryCount, name)}
      </Text>
    </View>
  );
}
