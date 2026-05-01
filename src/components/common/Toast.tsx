import { useEffect } from "react";
import { Text } from "react-native";
import { Check } from "lucide-react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/constants/theme";

const ENTRANCE_SPRING = { damping: 16, stiffness: 220, mass: 0.8 };
const EXIT_DURATION_MS = 180;

export type ToastProps = {
  visible: boolean;
  message: string;
  onHide: () => void;
  duration?: number;
};

export default function Toast({
  visible,
  message,
  onHide,
  duration = 2000,
}: ToastProps): React.ReactElement | null {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    if (!visible) return;

    if (reducedMotion) {
      opacity.value = 1;
      translateY.value = 0;
    } else {
      opacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
      translateY.value = withSpring(0, ENTRANCE_SPRING);
    }

    const exit = (): void => {
      if (reducedMotion) {
        opacity.value = 0;
        translateY.value = -8;
        runOnJS(onHide)();
        return;
      }
      opacity.value = withTiming(0, { duration: EXIT_DURATION_MS });
      translateY.value = withTiming(
        -8,
        { duration: EXIT_DURATION_MS, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(onHide)();
          }
        },
      );
    };

    const timeoutId = setTimeout(exit, duration);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      className="bg-on-surface flex-row items-center rounded-lg"
      style={[
        {
          position: "absolute",
          bottom: 120,
          left: 24,
          right: 24,
          paddingHorizontal: 20,
          paddingVertical: 14,
          gap: 12,
        },
        animatedStyle,
      ]}
    >
      <Check size={20} color={colors.success} strokeWidth={2.5} />
      <Text
        className="font-sans-semibold flex-1"
        style={{ fontSize: 14, color: colors.surface }}
      >
        {message}
      </Text>
    </Animated.View>
  );
}
