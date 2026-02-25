import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GameRecord, ScoreState } from "./game-logic";

const HISTORY_KEY = "caro_go_history";
const SCORES_KEY = "caro_go_scores";
const USERNAME_KEY = "caro_go_username";

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
  return raw ? JSON.parse(raw) : { playerWins: 0, aiWins: 0, draws: 0 };
}

export async function updateScores(scores: ScoreState): Promise<void> {
  await AsyncStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

export async function resetScores(): Promise<void> {
  await AsyncStorage.setItem(
    SCORES_KEY,
    JSON.stringify({ playerWins: 0, aiWins: 0, draws: 0 })
  );
}

export async function getUsername(): Promise<string | null> {
  return AsyncStorage.getItem(USERNAME_KEY);
}

export async function saveUsername(username: string): Promise<void> {
  await AsyncStorage.setItem(USERNAME_KEY, username);
}
