import { useState } from "react";
import {
  type LayoutChangeEvent,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
  useWindowDimensions,
} from "react-native";

import { BillTotalOverlay } from "./BillTotalOverlay";
import { OrbitLayer } from "./OrbitLayer";
import { ParticipantLayer } from "./ParticipantLayer";
import { TableArtwork } from "./TableArtwork";
import {
  SCENE_CENTER_SHIFT_X,
  orbitDecorEllipsePx,
  seatCountForPeople,
} from "./seatPositions";
import { resolveTableTheme } from "./tableThemes";
import type { TableSceneProps } from "./types";

const MAX_VISIBLE_CAP = 8;

export function TableScene({
  theme: themeId = "softWood",
  people,
  totalCents,
  itemCount,
  onPressTable,
  onPressPerson,
  onLongPressPerson,
  onPressMorePeople,
  showParticipants = true,
  maxVisibleParticipants = MAX_VISIBLE_CAP,
  sceneBackgroundColor,
  showParticipantOverflow = true,
  style,
}: TableSceneProps) {
  const theme = resolveTableTheme(themeId);
  const { width: windowW } = useWindowDimensions();
  const [layout, setLayout] = useState({ w: 0, h: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ w: width, h: height });
  };

  const sceneHeight = Math.min(480, Math.max(420, Math.round(windowW * 0.42)));

  const maxVisible = Math.min(
    MAX_VISIBLE_CAP,
    Math.max(1, Math.floor(maxVisibleParticipants)),
  );
  const ring = seatCountForPeople(Math.min(people.length, maxVisible) || 1);

  const { w: W, h: H } = layout;
  const rawOrbit =
    W > 0 && H > 0 ? orbitDecorEllipsePx(W, H, SCENE_CENTER_SHIFT_X) : null;
  const narrowOrbit = windowW < 360;
  const orbitScale = narrowOrbit ? 0.92 : 1;
  const layoutOrbit =
    rawOrbit != null
      ? {
          cx: rawOrbit.cx,
          cy: rawOrbit.cy,
          rx: rawOrbit.rx * orbitScale,
          ry: rawOrbit.ry * orbitScale,
        }
      : null;

  const pinCount =
    showParticipants && people.length > 0
      ? Math.min(people.length, maxVisible)
      : 0;

  const wrapStyle: StyleProp<ViewStyle> = [
    styles.sceneWrap,
    {
      backgroundColor: sceneBackgroundColor ?? theme.backgroundColor,
      height: sceneHeight,
    },
    style,
  ];

  return (
    <View style={wrapStyle}>
      <View style={styles.inner} onLayout={onLayout}>
        {W > 0 && H > 0 ? (
          <>
            <TableArtwork ring={ring} theme={theme} />
            {layoutOrbit ? (
              // Backlog: optional animated orbit (see OrbitLayer header).
              <OrbitLayer
                cx={layoutOrbit.cx}
                cy={layoutOrbit.cy}
                height={H}
                orbitBeadColor={theme.orbitColor}
                orbitLineColor={theme.orbitLineColor}
                participantCount={pinCount}
                rx={layoutOrbit.rx}
                ry={layoutOrbit.ry}
                width={W}
              />
            ) : null}
            <BillTotalOverlay
              itemCount={itemCount}
              onPress={onPressTable}
              theme={theme}
              totalCents={totalCents}
            />
            {showParticipants ? (
              <ParticipantLayer
                maxVisible={maxVisible}
                orbitGeom={layoutOrbit}
                onLongPressPerson={onLongPressPerson}
                onPressMorePeople={
                  showParticipantOverflow ? onPressMorePeople : undefined
                }
                onPressPerson={onPressPerson}
                people={people}
                stackMidDotColor={layoutOrbit ? theme.orbitColor : undefined}
              />
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sceneWrap: {
    marginTop: 16,
    width: "100%",
    borderRadius: 20,
    overflow: "visible",
    position: "relative",
  },
  inner: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
});
