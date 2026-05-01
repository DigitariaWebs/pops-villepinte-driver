import { Pressable, Text, View } from "react-native";
import { ChevronRight, type LucideIcon } from "lucide-react-native";

export type SettingsRowProps = {
  icon: LucideIcon;
  label: string;
  labelColor?: string;
  onPress: () => void;
};

export default function SettingsRow({
  icon: Icon,
  label,
  labelColor,
  onPress,
}: SettingsRowProps): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          backgroundColor: "#F5F5F5",
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={20} color={labelColor ?? "#111111"} strokeWidth={1.5} />
      </View>

      <Text
        style={{
          fontFamily: "Poppins_600SemiBold",
          fontSize: 15,
          color: labelColor ?? "#111111",
          flex: 1,
          marginLeft: 16,
        }}
      >
        {label}
      </Text>

      <ChevronRight size={18} color="#6B6B6B" strokeWidth={2} />
    </Pressable>
  );
}
