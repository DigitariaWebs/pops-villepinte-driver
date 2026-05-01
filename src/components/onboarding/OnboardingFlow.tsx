import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ArrowRight, MapPin, Navigation, Wallet } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, shadow } from "@/constants/theme";

type Slide = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    icon: Navigation,
    title: "Tournée fluide",
    body: "Reçois tes courses dès que tu es en ligne. Une à la fois, jamais surchargée.",
  },
  {
    icon: MapPin,
    title: "Navigation guidée",
    body: "Itinéraires turn-by-turn intégrés. Plus besoin de jongler avec une autre app.",
  },
  {
    icon: Wallet,
    title: "Gains transparents",
    body: "Vois ce que tu gagnes en temps réel — par course, par jour, par semaine.",
  },
];

export type OnboardingFlowProps = {
  onComplete: () => void;
};

export default function OnboardingFlow({
  onComplete,
}: OnboardingFlowProps): React.ReactElement {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index]!;
  const isLast = index === SLIDES.length - 1;
  const Icon = slide.icon;

  const next = (): void => {
    if (isLast) onComplete();
    else setIndex((i) => i + 1);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: "space-between" }}>
        <View />

        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
              ...shadow.hero,
            }}
          >
            <Icon size={44} color={colors.ink} strokeWidth={2} />
          </View>

          <Text
            style={{
              fontFamily: "BebasNeue_400Regular",
              fontSize: 56,
              letterSpacing: -1.5,
              color: colors.ink,
              textAlign: "center",
            }}
          >
            {slide.title}
          </Text>

          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: 16,
              lineHeight: 24,
              color: colors.inkMuted,
              textAlign: "center",
              marginTop: 12,
              maxWidth: 320,
            }}
          >
            {slide.body}
          </Text>
        </View>

        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              marginBottom: 32,
            }}
          >
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === index ? colors.ink : colors.border,
                }}
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isLast ? "Commencer" : "Suivant"}
            onPress={next}
            style={({ pressed }) => ({
              backgroundColor: colors.ink,
              borderRadius: 16,
              paddingVertical: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
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
              {isLast ? "C'est parti" : "Suivant"}
            </Text>
            <ArrowRight size={18} color={colors.primary} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
