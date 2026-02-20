import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import type { Player } from "@/lib/game-logic";

interface PlayerIndicatorProps {
  currentPlayer: Player;
  capturedByBlack: number;
  capturedByWhite: number;
  scorePlayer: number;
  scoreAI: number;
  winner: Player | null;
  isDraw: boolean;
  isThinking: boolean;
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
          borderColor: isBlack ? "rgba(0,0,0,0.8)" : "rgba(200,192,180,0.8)",
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

function ThinkingDots() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  React.useEffect(() => {
    dot1.value = withRepeat(withTiming(1, { duration: 500 }), -1, true);
    setTimeout(() => {
      dot2.value = withRepeat(withTiming(1, { duration: 500 }), -1, true);
    }, 150);
    setTimeout(() => {
      dot3.value = withRepeat(withTiming(1, { duration: 500 }), -1, true);
    }, 300);
  }, []);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.thinkingDots}>
      <Animated.View style={[styles.dot, s1]} />
      <Animated.View style={[styles.dot, s2]} />
      <Animated.View style={[styles.dot, s3]} />
    </View>
  );
}

export default function PlayerIndicator({
  currentPlayer,
  capturedByBlack,
  capturedByWhite,
  scorePlayer,
  scoreAI,
  winner,
  isDraw,
  isThinking,
}: PlayerIndicatorProps) {
  const isBlackActive = !winner && !isDraw && currentPlayer === "black";
  const isWhiteActive = !winner && !isDraw && currentPlayer === "white";

  return (
    <View style={styles.container}>
      <View style={[styles.playerCard, isBlackActive && styles.activeCard]}>
        <PiecePreview isBlack={true} isActive={isBlackActive} />
        <View style={styles.playerInfo}>
          <Text
            style={[styles.playerName, isBlackActive && styles.activeText]}
            numberOfLines={1}
          >
            You
          </Text>
          <View style={styles.capturedRow}>
            <Ionicons name="skull-outline" size={11} color={Colors.textSecondary} />
            <Text style={styles.capturedText}>{capturedByBlack}</Text>
          </View>
        </View>
        <Text style={styles.score}>{scorePlayer}</Text>
      </View>

      <View style={styles.vs}>
        {isThinking ? (
          <ThinkingDots />
        ) : (
          <Text style={styles.vsText}>VS</Text>
        )}
      </View>

      <View style={[styles.playerCard, isWhiteActive && styles.activeCard]}>
        <PiecePreview isBlack={false} isActive={isWhiteActive} />
        <View style={styles.playerInfo}>
          <Text
            style={[styles.playerName, isWhiteActive && styles.activeText]}
            numberOfLines={1}
          >
            AI
          </Text>
          <View style={styles.capturedRow}>
            <Ionicons name="skull-outline" size={11} color={Colors.textSecondary} />
            <Text style={styles.capturedText}>{capturedByWhite}</Text>
          </View>
        </View>
        <Text style={styles.score}>{scoreAI}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  playerCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  activeCard: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(76,175,125,0.08)",
  },
  piecePreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  playerInfo: {
    flex: 1,
    gap: 1,
  },
  playerName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  activeText: {
    color: Colors.text,
  },
  capturedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  capturedText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  score: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.accent,
  },
  vs: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  thinkingDots: {
    flexDirection: "row",
    gap: 3,
    alignItems: "center",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.accent,
  },
});
