import { ScrollView, View } from "react-native";
import { type Edge, SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";

// Street food brand: warm off-white base
export type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: readonly Edge[];
  stickyHeaderIndices?: number[];
  /**
   * Optional element rendered as an absolute-positioned sibling above the
   * scroll region — useful for floating bars (e.g. accept-delivery bar) that
   * should stay pinned to the bottom of the screen regardless of scroll.
   */
  floatingBottom?: React.ReactNode;
};

const DEFAULT_EDGES: readonly Edge[] = ["top"];

// SafeAreaView is from react-native-safe-area-context (third-party). NativeWind
// v5 only auto-wraps the core RN components — so the className prop is dropped
// here and the view collapses to 0 height. We pass an explicit inline style
// instead. First-party components below (View, ScrollView, Pressable) still
// use className normally.
const SAFE_AREA_STYLE = { flex: 1, backgroundColor: colors.white } as const;

export default function Screen({
  children,
  scroll = true,
  edges = DEFAULT_EDGES,
  stickyHeaderIndices,
  floatingBottom,
}: ScreenProps): React.ReactElement {
  const hasFloating = floatingBottom !== undefined && floatingBottom !== null;

  return (
    <SafeAreaView edges={edges} style={SAFE_AREA_STYLE}>
      <View style={{ flex: 1 }}>
        {scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{ paddingBottom: 128 }}
            stickyHeaderIndices={stickyHeaderIndices}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>{children}</View>
        )}
        {hasFloating ? (
          <View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {floatingBottom}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
