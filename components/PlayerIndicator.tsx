import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import type { Player } from "@/lib/game-logic";

interface PlayerIndicatorProps {
  currentPlayer: Player;
  playerXName: string;
  playerOName: string;
  scoreX: number;
  scoreO: number;
  winner: Player | null;
  isDraw: boolean;
}

function PiecePreview({ isBlack, isActive }: { isBlack: boolean; isActive: boolean }) {
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (isActive) {
      pulse.value = withRepeat(
        withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulse.value = withSpring(1);
    }
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.piecePreview,
        {
          backgroundColor: isBlack ? Colors.pieceBlack : Colors.pieceWhite,
          borderColor: isBlack ? Colors.pieceBlackBorder : Colors.pieceWhiteBorder,
        },
        isActive && {
          shadowColor: isBlack ? "#fff" : Colors.accent,
          shadowOpacity: 0.5,
          shadowRadius: 6,
          elevation: 4,
        },
        animStyle,
      ]}
    />
  );
}

export default function PlayerIndicator({
  currentPlayer,
  playerXName,
  playerOName,
  scoreX,
  scoreO,
  winner,
  isDraw,
}: PlayerIndicatorProps) {
  const isXActive = !winner && !isDraw && currentPlayer === "X";
  const isOActive = !winner && !isDraw && currentPlayer === "O";

  return (
    <View style={styles.container}>
      <View style={[styles.playerCard, isXActive && styles.activeCard]}>
        <PiecePreview isBlack={true} isActive={isXActive} />
        <Text
          style={[styles.playerName, isXActive && styles.activeText]}
          numberOfLines={1}
        >
          {playerXName}
        </Text>
        <Text style={styles.score}>{scoreX}</Text>
      </View>

      <View style={styles.vs}>
        <Text style={styles.vsText}>VS</Text>
      </View>

      <View style={[styles.playerCard, isOActive && styles.activeCard]}>
        <PiecePreview isBlack={false} isActive={isOActive} />
        <Text
          style={[styles.playerName, isOActive && styles.activeText]}
          numberOfLines={1}
        >
          {playerOName}
        </Text>
        <Text style={styles.score}>{scoreO}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  playerCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  activeCard: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(76,175,125,0.08)",
  },
  piecePreview: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  playerName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  activeText: {
    color: Colors.text,
  },
  score: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.accent,
  },
  vs: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  vsText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
});
