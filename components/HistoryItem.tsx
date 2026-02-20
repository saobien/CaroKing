import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import type { GameRecord } from "@/lib/game-logic";

interface HistoryItemProps {
  record: GameRecord;
}

export default function HistoryItem({ record }: HistoryItemProps) {
  const isDraw = record.winner === "draw";
  const winnerName =
    record.winner === "X"
      ? record.playerXName
      : record.winner === "O"
      ? record.playerOName
      : null;

  const date = new Date(record.date);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        {isDraw ? (
          <Ionicons name="remove-circle-outline" size={24} color={Colors.textSecondary} />
        ) : (
          <View
            style={[
              styles.winnerPiece,
              {
                backgroundColor:
                  record.winner === "X" ? Colors.pieceBlack : Colors.pieceWhite,
                borderColor:
                  record.winner === "X"
                    ? Colors.pieceBlackBorder
                    : Colors.pieceWhiteBorder,
              },
            ]}
          />
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.result} numberOfLines={1}>
          {isDraw
            ? `${record.playerXName} vs ${record.playerOName}`
            : `${winnerName} won`}
        </Text>
        <Text style={styles.detail}>
          {isDraw ? "Draw" : `vs ${record.winner === "X" ? record.playerOName : record.playerXName}`}
          {" \u00B7 "}
          {record.moveCount} moves
        </Text>
      </View>

      <View style={styles.dateWrap}>
        <Text style={styles.dateText}>{dateStr}</Text>
        <Text style={styles.timeText}>{timeStr}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  winnerPiece: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  result: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  detail: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  dateWrap: {
    alignItems: "flex-end",
    gap: 2,
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  timeText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(245,240,232,0.35)",
  },
});
