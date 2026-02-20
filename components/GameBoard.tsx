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
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import type { Board, WinResult } from "@/lib/game-logic";
import { BOARD_SIZE } from "@/lib/game-logic";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BOARD_PADDING = 20;
const GRID_SIZE = BOARD_SIZE - 1;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - BOARD_PADDING * 2 - 32) / GRID_SIZE);
const BOARD_WIDTH = CELL_SIZE * GRID_SIZE;
const PIECE_SIZE = Math.floor(CELL_SIZE * 0.85);

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
  value: "black" | "white";
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

  const isBlack = value === "black";

  return (
    <Animated.View
      style={[
        {
          width: PIECE_SIZE,
          height: PIECE_SIZE,
          borderRadius: PIECE_SIZE / 2,
          backgroundColor: isBlack ? Colors.pieceBlack : Colors.pieceWhite,
          borderWidth: 1.5,
          borderColor: isBlack ? "rgba(0,0,0,0.8)" : "rgba(200,192,180,0.8)",
          position: "absolute",
          left: col * CELL_SIZE - PIECE_SIZE / 2,
          top: row * CELL_SIZE - PIECE_SIZE / 2,
        },
        isWinCell && {
          shadowColor: Colors.winGlow,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 10,
          elevation: 10,
          borderColor: Colors.winGlow,
          borderWidth: 2,
        },
        isLastMove &&
          !isWinCell && {
            shadowColor: isBlack ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 6,
            elevation: 5,
          },
        animStyle,
      ]}
    >
      {isBlack && (
        <View
          style={{
            position: "absolute",
            top: PIECE_SIZE * 0.2,
            left: PIECE_SIZE * 0.2,
            width: PIECE_SIZE * 0.22,
            height: PIECE_SIZE * 0.22,
            borderRadius: PIECE_SIZE * 0.11,
            backgroundColor: "rgba(255,255,255,0.12)",
          }}
        />
      )}
      {!isBlack && (
        <View
          style={{
            position: "absolute",
            top: PIECE_SIZE * 0.2,
            left: PIECE_SIZE * 0.2,
            width: PIECE_SIZE * 0.22,
            height: PIECE_SIZE * 0.22,
            borderRadius: PIECE_SIZE * 0.11,
            backgroundColor: "rgba(255,255,255,0.6)",
          }}
        />
      )}
      {isLastMove && !isWinCell && (
        <View
          style={{
            position: "absolute",
            top: PIECE_SIZE / 2 - 3,
            left: PIECE_SIZE / 2 - 3,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: isBlack ? Colors.accent : Colors.accentDark,
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
    for (let i = 0; i < BOARD_SIZE; i++) {
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

    const starPoints =
      BOARD_SIZE === 13
        ? [
            [3, 3],
            [3, 9],
            [9, 3],
            [9, 9],
            [6, 6],
          ]
        : BOARD_SIZE === 15
        ? [
            [3, 3],
            [3, 11],
            [11, 3],
            [11, 11],
            [7, 7],
          ]
        : [];

    for (const [r, c] of starPoints) {
      lines.push(
        <View
          key={`star-${r}-${c}`}
          style={{
            position: "absolute",
            left: c * CELL_SIZE - 3,
            top: r * CELL_SIZE - 3,
            width: 6,
            height: 6,
            borderRadius: 3,
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
              left: c * CELL_SIZE - CELL_SIZE / 2,
              top: r * CELL_SIZE - CELL_SIZE / 2,
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
          <View style={styles.gridArea}>
            {gridLines}
            {pieces}
            {touchCells}
          </View>
        </View>
      </View>
    </View>
  );
}

const HALF_CELL = CELL_SIZE / 2;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  boardShadow: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },
  board: {
    width: BOARD_WIDTH + CELL_SIZE,
    height: BOARD_WIDTH + CELL_SIZE,
    backgroundColor: Colors.board,
    borderRadius: 10,
    overflow: "hidden",
    padding: HALF_CELL,
  },
  gridArea: {
    width: BOARD_WIDTH,
    height: BOARD_WIDTH,
    position: "relative",
  },
});
