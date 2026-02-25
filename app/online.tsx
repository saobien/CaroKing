import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import GameBoard from "@/components/GameBoard";
import {
  createInitialGameState,
  makeMove,
  type GameState,
  type Player,
} from "@/lib/game-logic";
import GameOverModal from "@/components/GameOverModal";
import { getUsername, saveUsername } from "@/lib/storage";
import { getWsUrl } from "@/lib/server-url";

type Status =
  | "idle"
  | "connecting"
  | "waiting"
  | "playing"
  | "game_over";

export default function OnlineScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [myColor, setMyColor] = useState<Player>("black");
  const [opponentName, setOpponentName] = useState("");
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [gameId, setGameId] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [modalWinner, setModalWinner] = useState<Player | null>(null);
  const [modalReason, setModalReason] = useState("");

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    getUsername().then((name) => {
      if (name) setUsername(name);
    });
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const connectAndJoin = useCallback(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      Alert.alert("Thiếu tên", "Nhập tên hiển thị để chơi online");
      return;
    }
    saveUsername(trimmed);
    setStatus("connecting");
    setStatusMsg("Đang kết nối...");

    const url = getWsUrl();
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch (e) {
      setStatus("idle");
      Alert.alert("Lỗi kết nối", "Không thể kết nối tới server");
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join_lobby", username: trimmed }));
    };

    ws.onerror = () => {
      setStatus("idle");
      setStatusMsg("");
      Alert.alert("Lỗi kết nối", "Không thể kết nối tới máy chủ. Chơi online cần kết nối web.");
    };

    ws.onclose = () => {
      if (status === "playing") {
        setStatusMsg("Mất kết nối");
      }
    };

    ws.onmessage = (event) => {
      let msg: { type: string; [key: string]: unknown };
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      if (msg.type === "waiting") {
        setStatus("waiting");
        setStatusMsg("Đang tìm đối thủ...");
        return;
      }

      if (msg.type === "game_start") {
        setMyColor(msg.color as Player);
        setOpponentName(String(msg.opponent));
        setGameId(String(msg.gameId));
        setGameState(createInitialGameState());
        setStatus("playing");
        setStatusMsg("");
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return;
      }

      if (msg.type === "opponent_move") {
        const row = Number(msg.row);
        const col = Number(msg.col);
        setGameState((prev) => {
          const newState = makeMove(prev, row, col);
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          if (newState.winner || newState.isDraw) {
            const winner = newState.winner?.winner ?? null;
            setTimeout(() => {
              setModalWinner(winner);
              setModalReason(newState.winner ? "five_in_row" : "draw");
              setShowModal(true);
              setStatus("game_over");
            }, 400);
          }
          return newState;
        });
        return;
      }

      if (msg.type === "move_ok") {
        return;
      }

      if (msg.type === "game_over") {
        const winner = msg.winner as Player | null;
        const reason = String(msg.reason);
        const reasonMsg =
          reason === "opponent_resigned"
            ? "Đối thủ đã đầu hàng!"
            : reason === "opponent_disconnected"
            ? "Đối thủ mất kết nối!"
            : "";
        setModalWinner(winner);
        setModalReason(reasonMsg);
        setShowModal(true);
        setStatus("game_over");
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(
            winner === myColor
              ? Haptics.NotificationFeedbackType.Success
              : Haptics.NotificationFeedbackType.Error
          );
        }
        return;
      }

      if (msg.type === "error") {
        console.warn("[WS] Error from server:", msg.message);
        return;
      }
    };
  }, [username, myColor, status]);

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (
        status !== "playing" ||
        gameState.winner ||
        gameState.isDraw ||
        gameState.currentPlayer !== myColor
      )
        return;

      const newState = makeMove(gameState, row, col);
      if (newState === gameState) return;

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      wsRef.current?.send(
        JSON.stringify({ type: "move", gameId, row, col })
      );

      setGameState(newState);

      if (newState.winner || newState.isDraw) {
        const winner = newState.winner?.winner ?? null;
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(
            winner === myColor
              ? Haptics.NotificationFeedbackType.Success
              : Haptics.NotificationFeedbackType.Error
          );
        }
        if (newState.winner) {
          wsRef.current?.send(
            JSON.stringify({ type: "game_over_notify", gameId, winner })
          );
        }
        setTimeout(() => {
          setModalWinner(winner);
          setModalReason("five_in_row");
          setShowModal(true);
          setStatus("game_over");
        }, 400);
      }
    },
    [status, gameState, myColor, gameId]
  );

  const handleResign = useCallback(() => {
    if (status !== "playing") return;
    Alert.alert("Đầu hàng?", "Bạn sẽ thua ván này.", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đầu hàng",
        style: "destructive",
        onPress: () => {
          wsRef.current?.send(JSON.stringify({ type: "resign", gameId }));
          const winnerColor: Player = myColor === "black" ? "white" : "black";
          setModalWinner(winnerColor);
          setModalReason("Bạn đã đầu hàng");
          setShowModal(true);
          setStatus("game_over");
        },
      },
    ]);
  }, [status, myColor, gameId]);

  const handleNewSearch = useCallback(() => {
    setShowModal(false);
    setStatus("idle");
    setGameState(createInitialGameState());
    setModalWinner(null);
    disconnect();
  }, [disconnect]);

  const gameOver = !!gameState.winner || gameState.isDraw;
  const myTurn = status === "playing" && gameState.currentPlayer === myColor && !gameOver;

  const wonThisGame =
    modalWinner !== null ? modalWinner === myColor : null;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + webTopInset },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => { disconnect(); router.back(); }}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Chơi Online</Text>
        {status === "playing" ? (
          <Pressable
            onPress={handleResign}
            style={({ pressed }) => [styles.resignBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.resignText}>Đầu hàng</Text>
          </Pressable>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>

      {status === "idle" && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.lobbyContainer}>
          <View style={styles.lobbyCard}>
            <Ionicons name="globe-outline" size={48} color={Colors.accent} />
            <Text style={styles.lobbyTitle}>Chơi Online</Text>
            <Text style={styles.lobbyDesc}>
              Ghép cặp ngẫu nhiên với người chơi khác. Nhập tên để bắt đầu.
            </Text>
            <TextInput
              style={styles.nameInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Tên hiển thị của bạn"
              placeholderTextColor={Colors.textSecondary}
              maxLength={24}
              autoCapitalize="words"
              returnKeyType="done"
            />
            <Pressable
              onPress={connectAndJoin}
              style={({ pressed }) => [
                styles.findBtn,
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Ionicons name="search" size={18} color="#fff" />
              <Text style={styles.findBtnText}>Tìm Đối Thủ</Text>
            </Pressable>
            {Platform.OS !== "web" && (
              <Text style={styles.webNote}>
                * Chơi online hoạt động tốt nhất trên nền tảng web
              </Text>
            )}
          </View>
        </Animated.View>
      )}

      {status === "connecting" && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.waitingText}>Đang kết nối...</Text>
        </View>
      )}

      {status === "waiting" && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.waitingText}>Đang tìm đối thủ...</Text>
          <Text style={styles.waitingSubText}>Xin chờ trong giây lát</Text>
          <Pressable
            onPress={() => { disconnect(); setStatus("idle"); }}
            style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.cancelText}>Huỷ</Text>
          </Pressable>
        </Animated.View>
      )}

      {(status === "playing" || status === "game_over") && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.gameContainer}>
          <View style={styles.playerRow}>
            <View style={styles.playerBadge}>
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: myColor === "black" ? "#1A1A1A" : "#F5F0E8" },
                ]}
              />
              <Text style={styles.playerName}>{username || "Bạn"}</Text>
              <Text style={styles.colorLabel}>
                {myColor === "black" ? "Đen" : "Trắng"}
              </Text>
            </View>
            <Text style={styles.vsText}>vs</Text>
            <View style={styles.playerBadge}>
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: myColor === "black" ? "#F5F0E8" : "#1A1A1A" },
                ]}
              />
              <Text style={styles.playerName}>{opponentName}</Text>
              <Text style={styles.colorLabel}>
                {myColor === "black" ? "Trắng" : "Đen"}
              </Text>
            </View>
          </View>

          <View style={styles.turnBadge}>
            {myTurn ? (
              <Text style={[styles.turnText, { color: Colors.accent }]}>
                Lượt của bạn
              </Text>
            ) : status === "playing" ? (
              <Text style={styles.turnText}>
                {opponentName} đang suy nghĩ...
              </Text>
            ) : null}
          </View>

          <GameBoard
            board={gameState.board}
            winResult={gameState.winner}
            lastMove={gameState.lastMove}
            disabled={!myTurn}
            onCellPress={handleCellPress}
          />

          <View style={styles.moveInfo}>
            <Text style={styles.moveCount}>Nước {gameState.moveCount}</Text>
          </View>
        </Animated.View>
      )}

      <GameOverModal
        visible={showModal}
        winner={modalWinner}
        isDraw={gameState.isDraw}
        capturedByBlack={gameState.capturedByBlack}
        capturedByWhite={gameState.capturedByWhite}
        onNewGame={handleNewSearch}
        onDismiss={() => {
          setShowModal(false);
          setStatus("idle");
          disconnect();
        }}
        customMessage={
          wonThisGame === true
            ? "Bạn thắng! 🎉"
            : wonThisGame === false
            ? "Bạn thua!"
            : modalReason || undefined
        }
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
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  resignBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(232,93,93,0.15)",
    borderWidth: 1,
    borderColor: "rgba(232,93,93,0.3)",
  },
  resignText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.danger,
  },
  lobbyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  lobbyCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 28,
    alignItems: "center",
    gap: 16,
    width: "100%",
    maxWidth: 380,
  },
  lobbyTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  lobbyDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  nameInput: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },
  findBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 8,
    width: "100%",
  },
  findBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  webNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
  waitingText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  waitingSubText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  gameContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
    paddingTop: 4,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
    gap: 8,
  },
  playerBadge: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 4,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  playerName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    textAlign: "center",
  },
  colorLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  vsText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  turnBadge: {
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  turnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  moveInfo: {
    paddingVertical: 4,
  },
  moveCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
});
