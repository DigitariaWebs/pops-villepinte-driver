import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { ArrowLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logoImage = require("../../../assets/images/pops-logo.png") as number;

const MOCK_OTP = "1234";
const PHONE_REGEX = /^0[67](\d{2}){4}$/;

function formatFrenchMobile(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

export type AuthFlowProps = {
  onComplete: (phone: string) => void;
};

export default function AuthFlow({ onComplete }: AuthFlowProps): React.ReactElement {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [otpError, setOtpError] = useState<string | undefined>();

  const otpRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handlePhoneChange = (v: string): void => {
    setPhone(formatFrenchMobile(v));
    setPhoneError(undefined);
  };

  const handleSendCode = (): void => {
    const digits = phone.replace(/\s/g, "");
    if (!PHONE_REGEX.test(digits)) {
      setPhoneError("Numéro invalide. Utilise un 06 ou 07.");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    void Haptics.selectionAsync();
    setStep("otp");
    setTimeout(() => otpRefs[0].current?.focus(), 300);
  };

  const handleOtpDigit = (digit: string, index: number): void => {
    if (digit.length > 1) return;
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setOtpError(undefined);

    if (digit !== "" && index < 3) {
      otpRefs[index + 1].current?.focus();
    }

    if (index === 3 && digit !== "") {
      const code = next.join("");
      if (code === MOCK_OTP) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const digits = phone.replace(/\s/g, "");
        onComplete(digits);
      } else {
        setOtpError("Code incorrect. Réessaye avec 1234.");
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setOtp(["", "", "", ""]);
        setTimeout(() => otpRefs[0].current?.focus(), 200);
      }
    }
  };

  const handleOtpBackspace = (index: number): void => {
    if (otp[index] === "" && index > 0) {
      otpRefs[index - 1].current?.focus();
      const next = [...otp];
      next[index - 1] = "";
      setOtp(next);
    }
  };

  // ── OTP STEP ──
  if (step === "otp") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 32,
              }}
            >
              <Pressable
                onPress={() => {
                  setStep("phone");
                  setOtp(["", "", "", ""]);
                  setOtpError(undefined);
                }}
                hitSlop={16}
              >
                <ArrowLeft size={28} color={colors.ink} strokeWidth={2.5} />
              </Pressable>
              <Image
                source={logoImage}
                contentFit="contain"
                style={{ width: 60, height: 60 }}
              />
              <View style={{ width: 28 }} />
            </View>

            <Text
              style={{
                fontFamily: "BebasNeue_400Regular",
                fontSize: 44,
                lineHeight: 46,
                letterSpacing: 2,
                color: colors.ink,
              }}
            >
              ENTRE TON CODE
            </Text>

            <Text
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: 14,
                color: "rgba(0,0,0,0.55)",
                marginTop: 8,
              }}
            >
              Code envoyé au {phone}
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 36 }}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={otpRefs[i]}
                  value={digit}
                  onChangeText={(v) => handleOtpDigit(v, i)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === "Backspace") handleOtpBackspace(i);
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={{
                    width: 64,
                    height: 72,
                    borderRadius: 16,
                    backgroundColor: colors.ink,
                    textAlign: "center",
                    fontFamily: "BebasNeue_400Regular",
                    fontSize: 32,
                    color: colors.primary,
                  }}
                />
              ))}
            </View>

            {otpError !== undefined ? (
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: 13,
                  color: colors.accent,
                  marginTop: 16,
                }}
              >
                {otpError}
              </Text>
            ) : (
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: 12,
                  color: "rgba(0,0,0,0.35)",
                  marginTop: 16,
                }}
              >
                Code de démo : 1234
              </Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── PHONE STEP ──
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
              maxWidth: 280,
            }}
          >
            Entre ton numéro pour démarrer ta tournée. Pas de spam, promis.
          </Text>

          <View
            style={{
              backgroundColor: colors.ink,
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 18,
              marginTop: 36,
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
              onChangeText={handlePhoneChange}
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

          {phoneError !== undefined ? (
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: 13,
                color: colors.accent,
                marginTop: 12,
              }}
            >
              {phoneError}
            </Text>
          ) : null}

          <Pressable
            onPress={handleSendCode}
            style={({ pressed }) => ({
              backgroundColor: colors.ink,
              borderRadius: 999,
              paddingVertical: 18,
              alignItems: "center",
              marginTop: 28,
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
              Recevoir le code
            </Text>
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
