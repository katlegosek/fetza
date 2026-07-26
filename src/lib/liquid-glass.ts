import {
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";

/**
 * True when we can safely render `GlassView` / `GlassContainer`.
 * Requires an Xcode 26 build (`isLiquidGlassAvailable`) and a device
 * runtime that actually exposes the API (`isGlassEffectAPIAvailable` —
 * some iOS 26 betas don't, and mounting then crashes).
 *
 * @see https://docs.expo.dev/versions/v54.0.0/sdk/glass-effect/
 */
export function canUseLiquidGlass(): boolean {
  return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
}
