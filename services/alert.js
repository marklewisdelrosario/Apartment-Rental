import { Alert, Platform } from "react-native";

export function showAlert(title, message, buttons) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.alert(`${title}\n\n${message}`);
    buttons?.[0]?.onPress?.();
    return;
  }

  Alert.alert(title, message, buttons);
}