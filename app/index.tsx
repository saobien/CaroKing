import React, { useState, useCallback, useEffect } from "react";
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
  type GameState,
  type ScoreState,
  type Player,
} from "@/lib/game-logic";
import {
  getScores,
  updateScores,
  saveGame,
  getPlayerNames,
} from "@/lib/storage";

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [scores, setScores] = useState<ScoreState>({ playerX: 0, playerO: 0, draws: 0 });
  const [names, setNames] = useState({ x: "Black", o: "White" });
  const [showModal, setShowModal] = useState(false);
  const [modalShownForGame, setModalShownForGame] = useState(false);

  useEffect(() => {
    getScores().then(setScores);
    getPlayerNames().then(setNames);
  }, []);

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (gameState.winner || gameState.isDraw) return;
      const newState = makeMove(gameState, row, col);
      if (newState === gameState) return;
      setGameState(newState);

      if (newState.winner || newState.isDraw) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(
            newState.winner
              ? Haptics.NotificationFeedbackType.Success
              : Haptics.NotificationFeedbackType.Warning
          );
        }

        const newScores = { ...scores };
        if (newState.winner) {
          if (newState.winner.winner === "X") newScores.playerX++;
          else newScores.playerO++;
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
          playerXName: names.x,
          playerOName: names.o,
        });

        setTimeout(() => {
          setShowModal(true);
          setModalShownForGame(true);
        }, 600);
      }
    },
    [gameState, scores, names]
  );

  const handleNewGame = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setGameState(createInitialGameState());
    setShowModal(false);
    setModalShownForGame(false);
  }, []);

  const handleUndoOrNew = useCallback(() => {
    if (gameState.winner || gameState.isDraw) {
      handleNewGame();
    }
  }, [gameState, handleNewGame]);

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
          <Text style={styles.headerTitle}>Caro</Text>
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
            playerXName={names.x}
            playerOName={names.o}
            scoreX={scores.playerX}
            scoreO={scores.playerO}
            winner={gameState.winner?.winner ?? null}
            isDraw={gameState.isDraw}
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
            disabled={gameOver}
            onCellPress={handleCellPress}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.actions}>
          {gameOver && (
            <Pressable
              onPress={handleNewGame}
              style={({ pressed }) => [
                styles.newGameButton,
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.newGameText}>New Game</Text>
            </Pressable>
          )}

          {!gameOver && gameState.moveCount > 0 && (
            <View style={styles.moveCounter}>
              <Text style={styles.moveCountText}>
                Move {gameState.moveCount}
              </Text>
            </View>
          )}

          {!gameOver && gameState.moveCount === 0 && (
            <View style={styles.moveCounter}>
              <Text style={styles.moveCountText}>Tap to place a piece</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <GameOverModal
        visible={showModal}
        winner={gameState.winner?.winner ?? null}
        isDraw={gameState.isDraw}
        playerXName={names.x}
        playerOName={names.o}
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
    paddingVertical: 12,
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
    fontSize: 22,
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
    gap: 20,
    paddingTop: 8,
  },
  boardWrapper: {
    alignItems: "center",
  },
  actions: {
    alignItems: "center",
    paddingHorizontal: 16,
    width: "100%",
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
});
