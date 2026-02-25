import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";
import { BOARD_SIZE } from "../lib/game-logic-shared";

interface Player {
  ws: WebSocket;
  username: string;
  gameId: string | null;
}

interface GameRoom {
  id: string;
  black: Player;
  white: Player;
  board: (string | null)[][];
  currentTurn: "black" | "white";
  moveCount: number;
}

const lobby: Player[] = [];
const games = new Map<string, GameRoom>();
const players = new Map<WebSocket, Player>();

function createBoard(): (string | null)[][] {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function sendTo(ws: WebSocket, data: object) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function sendError(ws: WebSocket, message: string) {
  sendTo(ws, { type: "error", message });
}

function matchPlayers(p1: Player, p2: Player) {
  const gameId = generateId();
  const board = createBoard();

  const room: GameRoom = {
    id: gameId,
    black: p1,
    white: p2,
    board,
    currentTurn: "black",
    moveCount: 0,
  };

  p1.gameId = gameId;
  p2.gameId = gameId;
  games.set(gameId, room);

  sendTo(p1.ws, {
    type: "game_start",
    gameId,
    color: "black",
    opponent: p2.username,
  });

  sendTo(p2.ws, {
    type: "game_start",
    gameId,
    color: "white",
    opponent: p1.username,
  });

  console.log(`[WS] Game started: ${gameId} | ${p1.username} vs ${p2.username}`);
}

function handleMessage(ws: WebSocket, raw: string) {
  let msg: { type: string; [key: string]: unknown };
  try {
    msg = JSON.parse(raw);
  } catch {
    return sendError(ws, "Invalid JSON");
  }

  const player = players.get(ws);

  if (msg.type === "join_lobby") {
    const username = String(msg.username || "Player").slice(0, 24).trim() || "Player";

    const newPlayer: Player = {
      ws,
      username,
      gameId: null,
    };
    players.set(ws, newPlayer);

    const waiting = lobby.findIndex(
      (p) => p.ws !== ws && p.ws.readyState === WebSocket.OPEN
    );

    if (waiting !== -1) {
      const opponent = lobby.splice(waiting, 1)[0];
      matchPlayers(opponent, newPlayer);
    } else {
      lobby.push(newPlayer);
      sendTo(ws, { type: "waiting" });
    }
    return;
  }

  if (!player) {
    return sendError(ws, "Not joined lobby");
  }

  if (msg.type === "move") {
    const { gameId, row, col } = msg as { type: string; gameId: string; row: number; col: number };
    const game = games.get(gameId);
    if (!game) return sendError(ws, "Game not found");

    const isBlack = game.black.ws === ws;
    const isWhite = game.white.ws === ws;
    if (!isBlack && !isWhite) return sendError(ws, "Not in this game");

    const myColor = isBlack ? "black" : "white";
    if (game.currentTurn !== myColor) return sendError(ws, "Not your turn");

    const r = Number(row);
    const c = Number(col);
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return sendError(ws, "Invalid position");
    if (game.board[r][c] !== null) return sendError(ws, "Cell occupied");

    game.board[r][c] = myColor;
    game.currentTurn = myColor === "black" ? "white" : "black";
    game.moveCount++;

    const opponent = isBlack ? game.white : game.black;
    sendTo(opponent.ws, { type: "opponent_move", row: r, col: c, color: myColor });
    sendTo(ws, { type: "move_ok", row: r, col: c });
    return;
  }

  if (msg.type === "resign") {
    const { gameId } = msg as { type: string; gameId: string };
    const game = games.get(gameId);
    if (!game) return;

    const isBlack = game.black.ws === ws;
    const opponent = isBlack ? game.white : game.black;
    const myColor = isBlack ? "black" : "white";
    const winnerColor = isBlack ? "white" : "black";

    sendTo(ws, { type: "game_over", reason: "resign", winner: winnerColor, loser: myColor });
    sendTo(opponent.ws, { type: "game_over", reason: "opponent_resigned", winner: winnerColor, loser: myColor });

    game.black.gameId = null;
    game.white.gameId = null;
    games.delete(gameId);
    console.log(`[WS] Game ${gameId} ended: ${myColor} resigned`);
    return;
  }

  if (msg.type === "game_over_notify") {
    const { gameId, winner } = msg as { type: string; gameId: string; winner: string };
    const game = games.get(gameId);
    if (!game) return;

    const isBlack = game.black.ws === ws;
    const opponent = isBlack ? game.white : game.black;

    sendTo(opponent.ws, { type: "game_over", reason: "five_in_row", winner });

    game.black.gameId = null;
    game.white.gameId = null;
    games.delete(gameId);
    console.log(`[WS] Game ${gameId} ended: ${winner} wins by five`);
    return;
  }
}

function handleClose(ws: WebSocket) {
  const player = players.get(ws);
  if (!player) return;

  const lobbyIdx = lobby.findIndex((p) => p.ws === ws);
  if (lobbyIdx !== -1) lobby.splice(lobbyIdx, 1);

  if (player.gameId) {
    const game = games.get(player.gameId);
    if (game) {
      const isBlack = game.black.ws === ws;
      const opponent = isBlack ? game.white : game.black;
      const winnerColor = isBlack ? "white" : "black";

      sendTo(opponent.ws, {
        type: "game_over",
        reason: "opponent_disconnected",
        winner: winnerColor,
        loser: isBlack ? "black" : "white",
      });

      game.black.gameId = null;
      game.white.gameId = null;
      games.delete(player.gameId);
    }
  }

  players.delete(ws);
  console.log(`[WS] Player disconnected: ${player.username}`);
}

export function setupGameWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("[WS] New connection");

    ws.on("message", (data) => {
      handleMessage(ws, data.toString());
    });

    ws.on("close", () => {
      handleClose(ws);
    });

    ws.on("error", (err) => {
      console.error("[WS] Error:", err.message);
    });
  });

  console.log("[WS] Game WebSocket server ready at /ws");
}
