import { Platform } from "react-native";

const PRODUCTION_WS_URL = "wss://caro-king--saobienme.replit.app/ws";

export function getWsUrl(): string {
  const expoDomain = process.env.EXPO_PUBLIC_DOMAIN;
  const customWs = process.env.EXPO_PUBLIC_WS_URL;

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    const wsProtocol = protocol === "https:" ? "wss" : "ws";

    if (port === "" || port === "80" || port === "443") {
      return `${wsProtocol}://${hostname}/ws`;
    }

    if (port === "8081" || port === "19006") {
      if (expoDomain) {
        return `${wsProtocol}://${expoDomain}/ws`;
      }
      return `${wsProtocol}://${hostname}:5000/ws`;
    }

    return `${wsProtocol}://${hostname}${port ? `:${port}` : ""}/ws`;
  }

  if (customWs) return customWs;

  if (expoDomain) {
    const wsProtocol = expoDomain.startsWith("localhost") ? "ws" : "wss";
    return `${wsProtocol}://${expoDomain}/ws`;
  }

  return PRODUCTION_WS_URL;
}
