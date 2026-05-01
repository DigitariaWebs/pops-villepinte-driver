import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { useProfileStore } from "@/store/profile.store";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logoImage = require("../../../assets/images/pops-logo.png") as number;

export type SignupFormProps = {
  phone: string;
  onComplete: () => void;
};

export default function SignupForm({
  phone,
  onComplete,
}: SignupFormProps): React.ReactElement {
  const setProfile = useProfileStore((s) => s.setProfile);
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [error, setError] = useState<string | undefined>();

  const submit = (): void => {
    if (name.trim().length < 2) {
      setError("Ton prénom est requis (2 caractères min).");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError(undefined);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProfile({
      name: name.trim(),
      phone,
      vehicle: "scooter",
      licensePlate: plate.trim() === "" ? undefined : plate.trim().toUpperCase(),
    });
    onComplete();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 32, paddingTop: 60, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={logoImage}
            contentFit="contain"
            style={{ width: 60, height: 60, marginBottom: 32 }}
          />

          <Text
            style={{
              fontFamily: "BebasNeue_400Regular",
              fontSize: 44,
              lineHeight: 46,
              letterSpacing: 2,
              color: colors.ink,
            }}
          >
            ON FAIT{"\n"}CONNAISSANCE.
          </Text>

          <Text
            style={{
              fontFamily: "Poppins_500Medium",
              fontSize: 14,
              color: "rgba(0,0,0,0.55)",
              marginTop: 8,
            }}
          >
            Bienvenue dans l&apos;équipe POP&apos;S.
          </Text>

          {/* Prénom */}
          <Text
            className="font-sans-bold uppercase"
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: "rgba(0,0,0,0.55)",
              marginTop: 36,
              marginBottom: 8,
            }}
          >
            Prénom
          </Text>
          <View
            style={{
              backgroundColor: colors.ink,
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 18,
            }}
          >
            <TextInput
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (v.trim().length >= 2) setError(undefined);
              }}
              placeholder="Karim"
              placeholderTextColor="rgba(255,206,0,0.35)"
              autoCapitalize="words"
              autoComplete="given-name"
              autoFocus
              maxLength={30}
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: 18,
                color: colors.primary,
                paddingVertical: 0,
              }}
            />
          </View>

          {error !== undefined ? (
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: 13,
                color: colors.accent,
                marginTop: 12,
              }}
            >
              {error}
            </Text>
          ) : null}

          {/* Plaque scooter */}
          <Text
            className="font-sans-bold uppercase"
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: "rgba(0,0,0,0.55)",
              marginTop: 24,
              marginBottom: 8,
            }}
          >
            Plaque scooter
          </Text>
          <View
            style={{
              backgroundColor: colors.ink,
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 18,
            }}
          >
            <TextInput
              value={plate}
              onChangeText={setPlate}
              placeholder="AB-123-CD"
              placeholderTextColor="rgba(255,206,0,0.35)"
              autoCapitalize="characters"
              maxLength={10}
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: 18,
                color: colors.primary,
                paddingVertical: 0,
                letterSpacing: 1,
              }}
            />
          </View>
          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: 11,
              lineHeight: 16,
              color: "rgba(0,0,0,0.45)",
              marginTop: 6,
            }}
          >
            Optionnel — on le demande pour les contrôles.
          </Text>

          <Pressable
            onPress={submit}
            style={({ pressed }) => ({
              backgroundColor: colors.ink,
              borderRadius: 999,
              paddingVertical: 18,
              alignItems: "center",
              marginTop: 32,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: "Poppins_700Bold",
                fontSize: 14,
                letterSpacing: 1,
                color: colors.primary,
                textTransform: "uppercase",
              }}
            >
              C&apos;est parti
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
