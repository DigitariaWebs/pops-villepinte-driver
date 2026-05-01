import "../../global.css";

import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import AuthFlow from "@/components/auth/AuthFlow";
import SignupForm from "@/components/auth/SignupForm";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import AnimatedSplash from "@/components/splash/AnimatedSplash";
import { useAppFonts } from "@/constants/fonts";
import { useAuthStore } from "@/store/auth.store";

const KNOWN_DRIVER_PHONE = "0612345678";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout(): React.ReactNode {
  const fontsLoaded = useAppFonts();
  const [splashDone, setSplashDone] = useState(false);

  const onboardingDone = useAuthStore((s) => s.onboardingDone);
  const authed = useAuthStore((s) => s.authed);
  const signupDone = useAuthStore((s) => s.signupDone);
  const phone = useAuthStore((s) => s.phone);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const login = useAuthStore((s) => s.login);
  const completeSignup = useAuthStore((s) => s.completeSignup);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  if (!splashDone) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <AnimatedSplash onComplete={() => setSplashDone(true)} />
      </GestureHandlerRootView>
    );
  }

  if (!onboardingDone) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <OnboardingFlow onComplete={completeOnboarding} />
      </GestureHandlerRootView>
    );
  }

  if (!authed) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <AuthFlow
          onComplete={(p) => {
            login(p, p === KNOWN_DRIVER_PHONE);
          }}
        />
      </GestureHandlerRootView>
    );
  }

  if (!signupDone) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <SignupForm phone={phone} onComplete={completeSignup} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="delivery/[id]" options={{ presentation: "modal" }} />
          <Stack.Screen name="navigate/[id]" options={{ presentation: "fullScreenModal" }} />
          <Stack.Screen name="settings/[slug]" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
