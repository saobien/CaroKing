import { Platform } from "react-native";

export function getWsUrl(): string {
  const expoDomain = process.env.EXPO_PUBLIC_DOMAIN;

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    const wsProtocol = protocol === "https:" ? "wss" : "ws";

    if (port === "" || port === "80" || port === "443") {
      if (expoDomain) {
        return `${wsProtocol}://${expoDomain}/ws`;
      }
      return `${wsProtocol}://${hostname}:5000/ws`;
    }

    if (port === "8081" || port === "19006") {
      if (expoDomain) {
        return `${wsProtocol}://${expoDomain}/ws`;
      }
      return `${wsProtocol}://${hostname}:5000/ws`;
    }

    return `${wsProtocol}://${hostname}${port ? `:${port}` : ""}/ws`;
  }

  if (expoDomain) {
    const wsProtocol = expoDomain.startsWith("localhost") ? "ws" : "wss";
    return `${wsProtocol}://${expoDomain}/ws`;
  }

  const custom = process.env.EXPO_PUBLIC_WS_URL;
  if (custom) return custom;
  return "ws://localhost:5000/ws";
}
