import { Platform } from "react-native";

export function getWsUrl(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;
    const cleanHost = host.replace(/:8081$/, ":5000");
    return `${protocol}://${cleanHost}/ws`;
  }
  const custom = process.env.EXPO_PUBLIC_WS_URL;
  if (custom) return custom;
  return "ws://localhost:5000/ws";
}
