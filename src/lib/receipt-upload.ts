import * as ImagePicker from "expo-image-picker";

export type ReceiptImageSource = "camera" | "library";

export function buildReceiptUploadFormData(imageUri: string): FormData {
  const formData = new FormData();
  const filename = imageUri.split("/").pop() ?? "receipt.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const extension = match?.[1]?.toLowerCase();
  const mimeType =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";

  formData.append("image", {
    uri: imageUri,
    name: filename.includes(".") ? filename : "receipt.jpg",
    type: mimeType,
  } as unknown as Blob);
  formData.append("position", "1");
  formData.append("capture_type", "full");

  return formData;
}

export async function pickReceiptImage(
  source: ReceiptImageSource,
): Promise<string | null> {
  if (source === "camera") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return null;
    }

    return result.assets[0].uri;
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.85,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}
