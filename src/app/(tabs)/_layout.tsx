import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

/**
 * System tab bar (UITabBarController / Material). On iOS 26+ (built with
 * Xcode 26) this automatically picks up Liquid Glass — same path WhatsApp uses.
 * JS `Tabs` cannot do that; it only paints a custom bar.
 *
 * @see https://docs.expo.dev/router/advanced/native-tabs/
 */
export default function TabsLayout() {
  return (
    <NativeTabs
      // iOS 26+: collapses the glass bar while scrolling, like Messages/WhatsApp.
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        {Platform.OS === "ios" ? (
          <Icon sf={{ default: "house", selected: "house.fill" }} />
        ) : (
          <Icon src={<VectorIcon family={Ionicons} name="home-outline" />} />
        )}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        {Platform.OS === "ios" ? (
          <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
        ) : (
          <Icon
            src={<VectorIcon family={Ionicons} name="settings-outline" />}
          />
        )}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
