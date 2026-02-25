export interface BoardTheme {
  id: string;
  name: string;
  board: string;
  boardBg: string;
  boardLine: string;
  starPoint: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: "forest",
    name: "Rừng",
    board: "#2D5A3D",
    boardBg: "#1E3F2B",
    boardLine: "rgba(0,0,0,0.28)",
    starPoint: "rgba(0,0,0,0.35)",
  },
  {
    id: "wood",
    name: "Gỗ",
    board: "#C8955A",
    boardBg: "#A87645",
    boardLine: "rgba(60,30,0,0.35)",
    starPoint: "rgba(60,30,0,0.45)",
  },
  {
    id: "ocean",
    name: "Đại Dương",
    board: "#1A3A5C",
    boardBg: "#0F2540",
    boardLine: "rgba(0,180,255,0.2)",
    starPoint: "rgba(0,180,255,0.35)",
  },
  {
    id: "night",
    name: "Đêm",
    board: "#1A1A2E",
    boardBg: "#0D0D1A",
    boardLine: "rgba(255,255,255,0.12)",
    starPoint: "rgba(255,255,255,0.2)",
  },
  {
    id: "stone",
    name: "Đá",
    board: "#5C5C6B",
    boardBg: "#3D3D4A",
    boardLine: "rgba(0,0,0,0.3)",
    starPoint: "rgba(0,0,0,0.4)",
  },
];

export const DEFAULT_THEME_ID = "forest";
