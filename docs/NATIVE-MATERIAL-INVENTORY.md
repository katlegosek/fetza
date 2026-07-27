# Native material inventory

Fetza uses platform-native chrome where it improves hierarchy without turning
content into decoration. Liquid Glass is restricted to iOS 26+ builds that pass
both Expo availability checks. Older iOS uses frosted blur and Android uses
solid, elevated Material surfaces with ripple feedback.

## Surface decisions

| Candidate | Decision | Reason |
| --- | --- | --- |
| Main tab bar | `NativeTabs` | The system owns layout, accessibility, minimisation, and iOS 26 Liquid Glass. |
| Header back buttons | `GlassIconButton` | Small floating navigation chrome benefits from native glass; older iOS blurs and Android uses a circular Material control. |
| Sheet close buttons | `GlassIconButton` | Same interaction and geometry as header icon controls. |
| Camera close, flash, gallery, and manual controls | `GlassIconButton` | They float over live imagery, where glass/frosted chrome has a functional contrast role. |
| Camera shutter | Leave solid | A white concentric shutter is established camera chrome and should not morph or become translucent. |
| Camera guidance and error/status overlays | `GlassSurface` | These float over moving imagery; Android gets a dark elevated Material overlay. |
| Home search | `GlassSurface` | It is persistent filtering chrome rather than content. |
| Search clear glyph | Leave inside search surface | A nested glass control would add noise and can fight the parent material. |
| Review and Assign bottom bars | `GlassSurface` + `NativeGlassButton` | They float above scrolling content and contain the primary transition action. |
| Primary flow CTAs | SwiftUI `glassProminent` through `NativeGlassButton` | Native iOS interaction where available; normal Material button elsewhere. |
| Secondary action CTAs | SwiftUI `glass` through `NativeGlassButton` | Used for receipt/assignment actions without competing with primary actions. |
| Review and Assign overflow menus | SwiftUI `ContextMenu` + `buttonStyle("glass")` | Preserves the native trigger-to-menu morph. The trigger is never wrapped in `GlassView`. |
| Overflow menu fallback | Shared anchored Material/frosted menu | Older iOS and Android retain the same actions without pretending to be Liquid Glass. |
| Receipt discovery pill | `GlassSurface` | It is temporary overlay chrome. On Liquid Glass, its parent never animates opacity. |
| Full headers | Leave solid | They contain content hierarchy and often contain glass children; wrapping the entire header would create nested materials. |
| Form fields and sheet bodies | Leave solid | Text entry needs stable contrast. A glass form sheet would reduce clarity and overuse the effect. |
| Destructive confirmation buttons | Leave solid red | Destructive meaning is more important than material novelty. |
| Bill, participant, item, totals, and QR cards | Leave solid | These are content surfaces, not floating chrome. |
| Thermal receipt and processing receipt paper | Leave paper | The paper metaphor is core to the feature and must remain visually stable. |
| Receipt scan beam and detection frame | Leave overlay drawing | They describe detection state, not interactive chrome. |
| Horizontal person/type chip pickers | Leave solid | Repeated glass chips would be visually noisy and expensive. |
| `GlassContainer` | Reserve for a future adjacent morphing control group | Current glass controls are spatially independent. Wrapping unrelated or single controls provides no merging benefit. |

## Implementation order

1. Central safety gate and platform-correct fallbacks.
2. Shared icon, surface, button, and overflow-menu primitives.
3. System navigation and high-frequency chrome: tabs, headers, camera, search.
4. Floating review/assign bars and primary transition actions.
5. Sheet close controls, form save actions, and temporary overlays.
6. Leave paper, content cards, destructive actions, and dense pickers solid.

## Real-device checks

- iOS 26 device with an Xcode 26 build: native glass, interactive icon controls,
  SwiftUI glass buttons, and menu morphs.
- Older iOS: no glass API mounting; BlurView controls remain readable in both
  appearances.
- Android: elevated solid surfaces, ripple feedback, and no iOS-like glow or
  spring recreation.
- Camera: controls remain legible over bright and dark receipts.
- Reduce Motion, Dynamic Type, dark mode, and disabled-button states.
