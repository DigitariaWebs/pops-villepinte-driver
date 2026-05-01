import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";

import { colors } from "@/constants/theme";

export type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
}: SectionHeaderProps): React.ReactElement {
  const hasAction = actionLabel !== undefined && onActionPress !== undefined;

  return (
    <View
      className="flex-row items-end justify-between"
      style={{ paddingHorizontal: 24, paddingVertical: 24 }}
    >
      <View className="flex-1 pr-4">
        <Text
          className="font-sans-extrabold text-on-surface"
          style={{ fontSize: 24, letterSpacing: -0.5 }}
        >
          {title}
        </Text>
        {subtitle !== undefined ? (
          <Text
            className="font-sans text-on-surface-variant"
            style={{ fontSize: 13, lineHeight: 18, marginTop: 4 }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {hasAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onActionPress}
          hitSlop={12}
          className="flex-row items-center"
        >
          <Text
            className="font-sans-semibold text-primary"
            style={{ fontSize: 13 }}
          >
            {actionLabel}
          </Text>
          <ChevronRight
            size={14}
            color={colors.primary}
            strokeWidth={2.5}
            style={{ marginLeft: 2 }}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
