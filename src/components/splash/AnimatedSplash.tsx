import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/constants/theme";

export type AnimatedSplashProps = {
  onComplete: () => void;
};

export default function AnimatedSplash({
  onComplete,
}: AnimatedSplashProps): React.ReactElement {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 1;
      scale.value = 1;
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
    opacity.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) });
    const t = setTimeout(() => {
      opacity.value = withDelay(
        100,
        withTiming(0, { duration: 280 }, (finished) => {
          if (finished) runOnJS(onComplete)();
        }),
      );
    }, 1100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View style={[{ alignItems: "center" }, animatedStyle]}>
        <Text
          style={{
            fontFamily: "BebasNeue_400Regular",
            fontSize: 84,
            letterSpacing: -2,
            color: colors.ink,
          }}
        >
          POP&apos;S
        </Text>
        <Text
          style={{
            fontFamily: "Poppins_700Bold",
            fontSize: 14,
            letterSpacing: 6,
            color: colors.ink,
            marginTop: -6,
          }}
        >
          DRIVER
        </Text>
      </Animated.View>
    </View>
  );
}
