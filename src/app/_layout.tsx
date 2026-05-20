import "../../global.css";

import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import AuthFlow from "@/components/auth/AuthFlow";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import AnimatedSplash from "@/components/splash/AnimatedSplash";
import { useAppFonts } from "@/constants/fonts";
import { useAuthStore } from "@/store/auth.store";
import { getSupabase } from "@/lib/supabase";
import {
  isAssignmentNotification,
  registerForPushNotifications,
} from "@/lib/push";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout(): React.ReactNode {
  const fontsLoaded = useAppFonts();
  const [splashDone, setSplashDone] = useState(false);
  const router = useRouter();

  const onboardingDone = useAuthStore((s) => s.onboardingDone);
  const authed = useAuthStore((s) => s.authed);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  // Keep the zustand auth flag in sync with the Supabase session — covers
  // refresh failures (auto-logout) and external sign-outs.
  useEffect(() => {
    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      return;
    }
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const phone = data.session.user.phone ?? "";
        login(phone);
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        logout();
      } else if (session) {
        login(session.user.phone ?? "");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [login, logout]);

  // Once authed, register for Expo push so the backend can notify us of
  // incoming assignments. Tapping a notification opens the assignment screen.
  useEffect(() => {
    if (!authed) return;
    registerForPushNotifications().catch(() => {});

    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      const data = res.notification.request.content.data;
      if (isAssignmentNotification(data)) {
        router.push(`/assignment/${data.assignment_id}`);
      }
    });
    return () => sub.remove();
  }, [authed, router]);

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
        <AuthFlow onComplete={(p) => login(p)} />
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
          <Stack.Screen
            name="assignment/[id]"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name="settings/[slug]" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
