import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GameRecord, ScoreState } from "./game-logic";

const HISTORY_KEY = "caro_history";
const SCORES_KEY = "caro_scores";
const NAMES_KEY = "caro_names";

export async function getHistory(): Promise<GameRecord[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveGame(record: GameRecord): Promise<void> {
  const history = await getHistory();
  history.unshift(record);
  if (history.length > 50) history.length = 50;
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}

export async function getScores(): Promise<ScoreState> {
  const raw = await AsyncStorage.getItem(SCORES_KEY);
  return raw ? JSON.parse(raw) : { playerX: 0, playerO: 0, draws: 0 };
}

export async function updateScores(scores: ScoreState): Promise<void> {
  await AsyncStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

export async function resetScores(): Promise<void> {
  await AsyncStorage.setItem(
    SCORES_KEY,
    JSON.stringify({ playerX: 0, playerO: 0, draws: 0 })
  );
}

export async function getPlayerNames(): Promise<{ x: string; o: string }> {
  const raw = await AsyncStorage.getItem(NAMES_KEY);
  return raw ? JSON.parse(raw) : { x: "Black", o: "White" };
}

export async function savePlayerNames(names: { x: string; o: string }): Promise<void> {
  await AsyncStorage.setItem(NAMES_KEY, JSON.stringify(names));
}
