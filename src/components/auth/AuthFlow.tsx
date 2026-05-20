import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Eye, EyeOff } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { getSupabase } from "@/lib/supabase";
import { apiErrorMessage } from "@/lib/api";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logoImage = require("../../../assets/images/pops-logo.png") as number;

const PHONE_REGEX = /^(?:\+?33|0)[67](?:[\s.-]?\d{2}){4}$/;

function normalizePhone(raw: string): string {
  // Strip spaces / punctuation, convert leading 0 → +33 so Supabase matches
  // the canonical E.164 form admin used at creation time.
  const compact = raw.replace(/[\s.\-()]/g, "");
  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("33")) return `+${compact}`;
  if (compact.startsWith("0")) return `+33${compact.slice(1)}`;
  return compact;
}

function formatFrenchMobile(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

export type AuthFlowProps = {
  onComplete: (phone: string) => void;
};

export default function AuthFlow({ onComplete }: AuthFlowProps): React.ReactElement {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (): Promise<void> => {
    setError(undefined);
    const compact = phone.replace(/\s/g, "");
    if (!PHONE_REGEX.test(compact)) {
      setError("Numéro invalide. Utilise un 06 ou 07.");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { error: authError } = await supabase.auth.signInWithPassword({
        phone: normalizePhone(compact),
        password,
      });
      if (authError) {
        setError(authError.message);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete(compact);
    } catch (e) {
      setError(apiErrorMessage(e));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 60 }}>
          <Text
            className="font-sans-bold uppercase"
            style={{ fontSize: 11, letterSpacing: 3, color: "rgba(0,0,0,0.55)" }}
          >
            POP&apos;S Driver
          </Text>

          <Text
            style={{
              fontFamily: "BebasNeue_400Regular",
              fontSize: 44,
              lineHeight: 46,
              letterSpacing: 2,
              color: colors.ink,
              marginTop: 16,
            }}
          >
            CONNEXION
          </Text>

          <Text
            style={{
              fontFamily: "Poppins_500Medium",
              fontSize: 14,
              color: "rgba(0,0,0,0.55)",
              marginTop: 8,
              maxWidth: 320,
            }}
          >
            Ton compte est créé par le restaurant. Entre ton numéro et le mot de
            passe qu&apos;on t&apos;a donné.
          </Text>

          <View
            style={{
              backgroundColor: colors.ink,
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 18,
              marginTop: 28,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: 16,
                color: colors.primary,
              }}
            >
              🇫🇷
            </Text>
            <TextInput
              value={phone}
              onChangeText={(v) => {
                setPhone(formatFrenchMobile(v));
                setError(undefined);
              }}
              placeholder="06 12 34 56 78"
              placeholderTextColor="rgba(255,206,0,0.35)"
              keyboardType="phone-pad"
              maxLength={14}
              autoFocus
              style={{
                flex: 1,
                fontFamily: "Poppins_600SemiBold",
                fontSize: 18,
                color: colors.primary,
                paddingVertical: 0,
              }}
            />
          </View>

          <View
            style={{
              backgroundColor: colors.ink,
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 18,
              marginTop: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <TextInput
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setError(undefined);
              }}
              placeholder="Mot de passe"
              placeholderTextColor="rgba(255,206,0,0.35)"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                flex: 1,
                fontFamily: "Poppins_600SemiBold",
                fontSize: 18,
                color: colors.primary,
                paddingVertical: 0,
              }}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={12}
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.primary} strokeWidth={2} />
              ) : (
                <Eye size={20} color={colors.primary} strokeWidth={2} />
              )}
            </Pressable>
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

          <Pressable
            onPress={loading ? undefined : handleLogin}
            style={({ pressed }) => ({
              backgroundColor: colors.ink,
              borderRadius: 999,
              paddingVertical: 18,
              alignItems: "center",
              marginTop: 28,
              opacity: pressed || loading ? 0.85 : 1,
            })}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text
                style={{
                  fontFamily: "Poppins_700Bold",
                  fontSize: 14,
                  letterSpacing: 1,
                  color: colors.primary,
                  textTransform: "uppercase",
                }}
              >
                Se connecter
              </Text>
            )}
          </Pressable>
        </View>

        <View style={{ alignItems: "center", paddingBottom: 24 }}>
          <Image
            source={logoImage}
            contentFit="contain"
            style={{ width: 80, height: 80 }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
