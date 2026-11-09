import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "expo-router/tabs";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Txt } from "../../components/Txt";
import { color } from "../../theme";

const icons: Record<string, string> = {
  index: "M4 11l8-7 8 7v9H4z",
  learn: "M4 5h7v15H4zM13 5h7v15h-7z",
  progress: "M5 20v-6M12 20V5M19 20v-10",
};
const labels: Record<string, string> = { index: "Today", learn: "Learn", progress: "Progress" };

// Floating white pill nav from the Dawn mock-ups: Today / Learn / Progress.
function DawnTabBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              testID={`tab-${route.name}`}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                if (!focused) navigateToTab(route.key);
              }}
              style={[styles.tab, focused && { backgroundColor: color.trackSoft }]}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d={icons[route.name]}
                  stroke={focused ? color.ink : color.muted}
                  strokeWidth={1.6}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </Svg>
              <Txt size={12} weight={focused ? "medium" : "regular"} tone={focused ? "ink" : "muted"}>
                {labels[route.name]}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <DawnTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: "transparent" } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="progress" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 24, right: 24, bottom: 0 },
  bar: {
    flexDirection: "row",
    gap: 4,
    padding: 6,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: 30,
  },
  tab: { flex: 1, height: 52, borderRadius: 24, alignItems: "center", justifyContent: "center", gap: 2 },
});
