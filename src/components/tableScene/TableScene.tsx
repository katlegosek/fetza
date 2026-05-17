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
  total,
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
  const orbitGeom =
    W > 0 && H > 0 ? orbitDecorEllipsePx(W, H, SCENE_CENTER_SHIFT_X) : null;

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
            {orbitGeom ? (
              <OrbitLayer
                cx={orbitGeom.cx}
                cy={orbitGeom.cy}
                height={H}
                rx={orbitGeom.rx}
                ry={orbitGeom.ry}
                strokeColor={theme.orbitColor}
                width={W}
              />
            ) : null}
            <BillTotalOverlay
              itemCount={itemCount}
              onPress={onPressTable}
              theme={theme}
              total={total}
            />
            {showParticipants ? (
              <ParticipantLayer
                maxVisible={maxVisible}
                onLongPressPerson={onLongPressPerson}
                onPressMorePeople={
                  showParticipantOverflow ? onPressMorePeople : undefined
                }
                onPressPerson={onPressPerson}
                people={people}
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
