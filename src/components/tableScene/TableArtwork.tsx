import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  View,
} from "react-native";

import type { SeatRing } from "./seatPositions";
import type { TableTheme } from "./tableThemes";

type TableArtworkProps = {
  theme: TableTheme;
  ring: SeatRing;
};

/**
 * Table/chair artwork: uses `resizeMode="contain"` so true transparency
 * shows the scene background. A checkerboard pattern usually means the
 * raster itself is opaque/baked — replace with a transparent PNG/WebP when ready.
 */
export function TableArtwork({ theme, ring }: TableArtworkProps) {
  const src = theme.seats[ring] as ImageSourcePropType;
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Image resizeMode="contain" source={src} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
