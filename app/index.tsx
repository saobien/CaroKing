import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import GameBoard from "@/components/GameBoard";
import PlayerIndicator from "@/components/PlayerIndicator";
import GameOverModal from "@/components/GameOverModal";
import {
  createInitialGameState,
  makeMove,
  getAIMove,
  type GameState,
  type ScoreState,
} from "@/lib/game-logic";
import { getScores, updateScores, saveGame } from "@/lib/storage";

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [scores, setScores] = useState<ScoreState>({
    playerWins: 0,
    aiWins: 0,
    draws: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getScores().then(setScores);
  }, []);

  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, []);

  const handleGameEnd = useCallback(
    (newState: GameState) => {
      const newScores = { ...scores };
      if (newState.winner) {
        if (newState.winner.winner === "black") newScores.playerWins++;
        else newScores.aiWins++;
      } else {
        newScores.draws++;
      }
      setScores(newScores);
      updateScores(newScores);

      const gameId =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      saveGame({
        id: gameId,
        date: new Date().toISOString(),
        winner: newState.winner ? newState.winner.winner : "draw",
        moveCount: newState.moveCount,
        capturedByBlack: newState.capturedByBlack,
        capturedByWhite: newState.capturedByWhite,
      });

      setTimeout(() => {
        setShowModal(true);
      }, 600);
    },
    [scores]
  );

  const runAIMove = useCallback(
    (currentState: GameState) => {
      setIsThinking(true);
      aiTimerRef.current = setTimeout(() => {
        const aiMove = getAIMove(currentState);
        if (!aiMove) {
          setIsThinking(false);
          return;
        }
        const newState = makeMove(currentState, aiMove.row, aiMove.col);
        setGameState(newState);
        setIsThinking(false);

        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        if (newState.winner || newState.isDraw) {
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(
              newState.winner?.winner === "black"
                ? Haptics.NotificationFeedbackType.Success
                : Haptics.NotificationFeedbackType.Error
            );
          }
          handleGameEnd(newState);
        }
      }, 400 + Math.random() * 300);
    },
    [handleGameEnd]
  );

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (
        gameState.winner ||
        gameState.isDraw ||
        gameState.currentPlayer !== "black" ||
        isThinking
      )
        return;

      const newState = makeMove(gameState, row, col);
      if (newState === gameState) return;
      setGameState(newState);

      if (newState.winner || newState.isDraw) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        handleGameEnd(newState);
        return;
      }

      runAIMove(newState);
    },
    [gameState, isThinking, handleGameEnd, runAIMove]
  );

  const handleNewGame = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    setGameState(createInitialGameState());
    setShowModal(false);
    setIsThinking(false);
  }, []);

  const gameOver = !!gameState.winner || gameState.isDraw;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => router.push("/history")}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="time-outline" size={22} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <Animated.View entering={FadeIn.duration(400)}>
          <Text style={styles.headerTitle}>Caro + Go</Text>
        </Animated.View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={() => router.push("/settings")}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          >
            <Feather name="settings" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + webBottomInset + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <PlayerIndicator
            currentPlayer={gameState.currentPlayer}
            capturedByBlack={gameState.capturedByBlack}
            capturedByWhite={gameState.capturedByWhite}
            scorePlayer={scores.playerWins}
            scoreAI={scores.aiWins}
            winner={gameState.winner?.winner ?? null}
            isDraw={gameState.isDraw}
            isThinking={isThinking}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.boardWrapper}
        >
          <GameBoard
            board={gameState.board}
            winResult={gameState.winner}
            lastMove={gameState.lastMove}
            disabled={gameOver || isThinking || gameState.currentPlayer !== "black"}
            onCellPress={handleCellPress}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.actions}
        >
          {gameOver && (
            <Pressable
              onPress={handleNewGame}
              style={({ pressed }) => [
                styles.newGameButton,
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.newGameText}>Van Moi</Text>
            </Pressable>
          )}

          {!gameOver && (
            <View style={styles.infoRow}>
              <View style={styles.moveCounter}>
                <Text style={styles.moveCountText}>
                  {isThinking
                    ? "AI dang suy nghi..."
                    : gameState.moveCount === 0
                    ? "Cham de dat quan"
                    : `Nuoc ${gameState.moveCount}`}
                </Text>
              </View>

              {gameState.moveCount > 0 && (
                <Pressable
                  onPress={handleNewGame}
                  style={({ pressed }) => [
                    styles.resetBtn,
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={18}
                    color={Colors.textSecondary}
                  />
                </Pressable>
              )}
            </View>
          )}

          <View style={styles.rulesHint}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="rgba(245,240,232,0.3)"
            />
            <Text style={styles.rulesText}>
              5 lien tiep thang  |  Bao vay bat quan
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <GameOverModal
        visible={showModal}
        winner={gameState.winner?.winner ?? null}
        isDraw={gameState.isDraw}
        capturedByBlack={gameState.capturedByBlack}
        capturedByWhite={gameState.capturedByWhite}
        onNewGame={handleNewGame}
        onDismiss={() => setShowModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerLeft: {
    width: 44,
    alignItems: "flex-start",
  },
  headerRight: {
    width: 44,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    alignItems: "center",
    gap: 16,
    paddingTop: 4,
  },
  boardWrapper: {
    alignItems: "center",
  },
  actions: {
    alignItems: "center",
    paddingHorizontal: 16,
    width: "100%",
    gap: 12,
  },
  newGameButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 8,
    width: "100%",
    maxWidth: 300,
  },
  newGameText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  moveCounter: {
    backgroundColor: Colors.card,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  moveCountText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  resetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  rulesHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rulesText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(245,240,232,0.3)",
  },
});
