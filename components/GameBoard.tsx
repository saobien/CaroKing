import React, { useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import type { Board, WinResult } from "@/lib/game-logic";
import { BOARD_SIZE } from "@/lib/game-logic";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BOARD_PADDING = 12;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - BOARD_PADDING * 2 - 32) / BOARD_SIZE);
const BOARD_WIDTH = CELL_SIZE * BOARD_SIZE;

interface GameBoardProps {
  board: Board;
  winResult: WinResult | null;
  lastMove: { row: number; col: number } | null;
  disabled: boolean;
  onCellPress: (row: number, col: number) => void;
}

function GamePiece({
  row,
  col,
  value,
  isWinCell,
  isLastMove,
}: {
  row: number;
  col: number;
  value: "X" | "O";
  isWinCell: boolean;
  isLastMove: boolean;
}) {
  const scale = useSharedValue(0);
  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isBlack = value === "X";
  const pieceSize = CELL_SIZE - 4;

  return (
    <Animated.View
      style={[
        {
          width: pieceSize,
          height: pieceSize,
          borderRadius: pieceSize / 2,
          backgroundColor: isBlack ? Colors.pieceBlack : Colors.pieceWhite,
          borderWidth: 1.5,
          borderColor: isBlack ? Colors.pieceBlackBorder : Colors.pieceWhiteBorder,
          position: "absolute",
          left: col * CELL_SIZE + 2,
          top: row * CELL_SIZE + 2,
        },
        isWinCell && {
          shadowColor: Colors.winGlow,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 8,
          elevation: 8,
        },
        isLastMove &&
          !isWinCell && {
            shadowColor: isBlack ? "#fff" : "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 4,
            elevation: 4,
          },
        animStyle,
      ]}
    >
      {isBlack && (
        <View
          style={{
            position: "absolute",
            top: pieceSize * 0.22,
            left: pieceSize * 0.22,
            width: pieceSize * 0.2,
            height: pieceSize * 0.2,
            borderRadius: pieceSize * 0.1,
            backgroundColor: "rgba(255,255,255,0.15)",
          }}
        />
      )}
      {!isBlack && (
        <View
          style={{
            position: "absolute",
            top: pieceSize * 0.22,
            left: pieceSize * 0.22,
            width: pieceSize * 0.2,
            height: pieceSize * 0.2,
            borderRadius: pieceSize * 0.1,
            backgroundColor: "rgba(255,255,255,0.5)",
          }}
        />
      )}
    </Animated.View>
  );
}

export default function GameBoard({
  board,
  winResult,
  lastMove,
  disabled,
  onCellPress,
}: GameBoardProps) {
  const winCellSet = useMemo(() => {
    if (!winResult) return new Set<string>();
    return new Set(winResult.cells.map((c) => `${c.row}-${c.col}`));
  }, [winResult]);

  const handlePress = useCallback(
    (row: number, col: number) => {
      if (disabled || board[row][col] !== null) return;
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onCellPress(row, col);
    },
    [disabled, board, onCellPress]
  );

  const gridLines = useMemo(() => {
    const lines: React.ReactNode[] = [];
    for (let i = 0; i <= BOARD_SIZE; i++) {
      lines.push(
        <View
          key={`h-${i}`}
          style={{
            position: "absolute",
            top: i * CELL_SIZE,
            left: 0,
            right: 0,
            height: StyleSheet.hairlineWidth,
            backgroundColor: Colors.boardLine,
          }}
        />
      );
      lines.push(
        <View
          key={`v-${i}`}
          style={{
            position: "absolute",
            left: i * CELL_SIZE,
            top: 0,
            bottom: 0,
            width: StyleSheet.hairlineWidth,
            backgroundColor: Colors.boardLine,
          }}
        />
      );
    }
    return lines;
  }, []);

  const pieces = useMemo(() => {
    const result: React.ReactNode[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c]) {
          result.push(
            <GamePiece
              key={`piece-${r}-${c}`}
              row={r}
              col={c}
              value={board[r][c]!}
              isWinCell={winCellSet.has(`${r}-${c}`)}
              isLastMove={lastMove?.row === r && lastMove?.col === c}
            />
          );
        }
      }
    }
    return result;
  }, [board, winCellSet, lastMove]);

  const touchCells = useMemo(() => {
    const cells: React.ReactNode[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        cells.push(
          <Pressable
            key={`touch-${r}-${c}`}
            onPress={() => handlePress(r, c)}
            style={{
              position: "absolute",
              left: c * CELL_SIZE,
              top: r * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          />
        );
      }
    }
    return cells;
  }, [handlePress]);

  return (
    <View style={styles.container}>
      <View style={styles.boardShadow}>
        <View style={styles.board}>
          {gridLines}
          {pieces}
          {touchCells}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  boardShadow: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  board: {
    width: BOARD_WIDTH,
    height: BOARD_WIDTH,
    backgroundColor: Colors.board,
    borderRadius: 10,
    overflow: "hidden",
  },
});
