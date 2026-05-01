import { Alert, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Bell, FileText, HelpCircle, LogOut, Shield, Wallet } from "lucide-react-native";

import SectionHeader from "@/components/home/SectionHeader";
import Screen from "@/components/layout/Screen";
import SettingsRow from "@/components/profile/SettingsRow";
import StatsCard from "@/components/profile/StatsCard";
import { colors } from "@/constants/theme";
import { useAuthStore } from "@/store/auth.store";
import { useDeliveriesStore } from "@/store/deliveries.store";
import { useProfileStore } from "@/store/profile.store";

export default function ProfileScreen(): React.ReactElement {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);
  const resetDeliveries = useDeliveriesStore((s) => s.reset);

  const confirmLogout = (): void => {
    Alert.alert("Se déconnecter ?", "Tu devras te reconnecter pour reprendre une tournée.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: () => {
          resetDeliveries();
          logout();
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }}>
        <Text
          className="font-sans-bold uppercase"
          style={{ fontSize: 11, letterSpacing: 3, color: colors.inkMuted }}
        >
          Profil
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
          {profile.name}
        </Text>
        <Text
          className="font-sans"
          style={{ fontSize: 14, color: colors.inkMuted, marginTop: 4 }}
        >
          {profile.phone} · ⭐ {profile.rating.toFixed(1)}
        </Text>
      </View>

      <StatsCard deliveryCount={profile.deliveryCount} name={profile.name} />

      <SectionHeader title="Compte" />

      <View style={{ paddingHorizontal: 24 }}>
        <SettingsRow
          icon={Wallet}
          label="Compte bancaire"
          onPress={() => router.push("/settings/payout")}
        />
        <SettingsRow
          icon={Bell}
          label="Notifications"
          onPress={() => router.push("/settings/notifications")}
        />
        <SettingsRow
          icon={FileText}
          label="Documents"
          onPress={() => router.push("/settings/documents")}
        />
      </View>

      <SectionHeader title="Aide" />

      <View style={{ paddingHorizontal: 24 }}>
        <SettingsRow
          icon={HelpCircle}
          label="Centre d'aide"
          onPress={() => router.push("/settings/help")}
        />
        <SettingsRow
          icon={Shield}
          label="Confidentialité"
          onPress={() => router.push("/settings/privacy")}
        />
        <SettingsRow
          icon={LogOut}
          label="Se déconnecter"
          labelColor={colors.error}
          onPress={confirmLogout}
        />
      </View>
    </Screen>
  );
}
