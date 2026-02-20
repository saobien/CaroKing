import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import type { Player } from "@/lib/game-logic";

interface GameOverModalProps {
  visible: boolean;
  winner: Player | null;
  isDraw: boolean;
  playerXName: string;
  playerOName: string;
  onNewGame: () => void;
  onDismiss: () => void;
}

export default function GameOverModal({
  visible,
  winner,
  isDraw,
  playerXName,
  playerOName,
  onNewGame,
  onDismiss,
}: GameOverModalProps) {
  const winnerName = winner === "X" ? playerXName : playerOName;
  const isBlack = winner === "X";

  const handleNewGame = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onNewGame();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconContainer}>
            {isDraw ? (
              <Ionicons name="remove-outline" size={40} color={Colors.textSecondary} />
            ) : (
              <View
                style={[
                  styles.winPiece,
                  {
                    backgroundColor: isBlack ? Colors.pieceBlack : Colors.pieceWhite,
                    borderColor: isBlack
                      ? Colors.pieceBlackBorder
                      : Colors.pieceWhiteBorder,
                    shadowColor: Colors.winGlow,
                  },
                ]}
              />
            )}
          </View>

          <Text style={styles.title}>
            {isDraw ? "Draw!" : `${winnerName} Wins!`}
          </Text>

          <Text style={styles.subtitle}>
            {isDraw
              ? "The board is full. No one wins this round."
              : "Five in a row achieved!"}
          </Text>

          <View style={styles.buttons}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleNewGame}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Play Again</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && { opacity: 0.85 },
              ]}
              onPress={onDismiss}
            >
              <Text style={styles.secondaryButtonText}>Review Board</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  modal: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  winPiece: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  buttons: {
    width: "100%",
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
});
