import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import type { Player } from "@/lib/game-logic";

interface GameOverModalProps {
  visible: boolean;
  winner: Player | null;
  isDraw: boolean;
  capturedByBlack: number;
  capturedByWhite: number;
  onNewGame: () => void;
  onDismiss: () => void;
  customMessage?: string;
}

export default function GameOverModal({
  visible,
  winner,
  isDraw,
  capturedByBlack,
  capturedByWhite,
  onNewGame,
  onDismiss,
  customMessage,
}: GameOverModalProps) {
  const playerWon = winner === "black";

  const handleNewGame = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onNewGame();
  };

  const titleText = customMessage
    ? customMessage
    : isDraw
    ? "Hòa!"
    : playerWon
    ? "Bạn Thắng!"
    : "Bạn Thua!";

  const subtitleText = isDraw
    ? "Bàn cờ đã đầy. Không ai thắng."
    : playerWon
    ? "Xếp được 5 quân liên tiếp!"
    : "Đối thủ xếp được 5 quân liên tiếp.";

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
            ) : playerWon ? (
              <Ionicons name="trophy" size={40} color={Colors.highlight} />
            ) : (
              <View
                style={[
                  styles.aiPiece,
                  {
                    backgroundColor: Colors.pieceWhite,
                    borderColor: Colors.pieceWhiteBorder,
                  },
                ]}
              />
            )}
          </View>

          <Text style={styles.title}>{titleText}</Text>

          {!customMessage && (
            <Text style={styles.subtitle}>{subtitleText}</Text>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statPiece,
                  {
                    backgroundColor: Colors.pieceBlack,
                    borderColor: "rgba(0,0,0,0.8)",
                  },
                ]}
              />
              <Text style={styles.statLabel}>Bắt</Text>
              <Text style={styles.statValue}>{capturedByBlack}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statPiece,
                  {
                    backgroundColor: Colors.pieceWhite,
                    borderColor: "rgba(200,192,180,0.8)",
                  },
                ]}
              />
              <Text style={styles.statLabel}>Bắt</Text>
              <Text style={styles.statValue}>{capturedByWhite}</Text>
            </View>
          </View>

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
              <Text style={styles.primaryButtonText}>Chơi Lại</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && { opacity: 0.85 },
              ]}
              onPress={onDismiss}
            >
              <Text style={styles.secondaryButtonText}>Xem Bàn Cờ</Text>
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
  aiPiece: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
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
    marginBottom: 20,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statPiece: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.cardBorder,
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
