import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import Screen from "@/components/layout/Screen";
import { colors } from "@/constants/theme";

const TITLES: Record<string, string> = {
  payout: "Compte bancaire",
  notifications: "Notifications",
  documents: "Documents",
  help: "Centre d'aide",
  privacy: "Confidentialité",
};

export default function SettingsPage(): React.ReactElement {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const title = TITLES[slug ?? ""] ?? "Réglages";

  return (
    <Screen>
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
          style={{
            fontFamily: "BebasNeue_400Regular",
            fontSize: 36,
            letterSpacing: -1,
            color: colors.ink,
          }}
        >
          {title}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 32 }}>
        <Text
          className="font-sans text-on-surface-variant"
          style={{ fontSize: 14, lineHeight: 22 }}
        >
          Cette section sera connectée à la plateforme partenaire dans une prochaine
          version. Pour toute urgence, contacte directement l&apos;équipe Pop&apos;s.
        </Text>
      </View>
    </Screen>
  );
}
