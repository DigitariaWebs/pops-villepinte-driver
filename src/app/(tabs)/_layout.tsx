import { Tabs } from "expo-router";
import { Navigation, Package, User, Wallet } from "lucide-react-native";

import { colors, font } from "@/constants/theme";

export default function TabLayout(): React.ReactNode {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopWidth: 3,
          borderTopColor: colors.ink,
          height: 88,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: font.bodySemi,
          fontSize: 11,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tournée",
          tabBarIcon: ({ color }) => <Navigation size={22} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="deliveries"
        options={{
          title: "Livraisons",
          tabBarIcon: ({ color }) => <Package size={22} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Gains",
          tabBarIcon: ({ color }) => <Wallet size={22} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={2.5} />,
        }}
      />
    </Tabs>
  );
}
