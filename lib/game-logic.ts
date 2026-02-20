export type Player = "black" | "white";
export type Cell = Player | null;
export type Board = Cell[][];

export const BOARD_SIZE = 13;
export const WIN_LENGTH = 5;

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
}

export interface WinResult {
  winner: Player;
  cells: { row: number; col: number }[];
}

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

const NEIGHBORS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function checkWin(board: Board, row: number, col: number): WinResult | null {
  const player = board[row][col];
  if (!player) return null;

  for (const [dr, dc] of DIRECTIONS) {
    const cells: { row: number; col: number }[] = [{ row, col }];

    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
      if (board[r][c] !== player) break;
      cells.push({ row: r, col: c });
    }

    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
      if (board[r][c] !== player) break;
      cells.push({ row: r, col: c });
    }

    if (cells.length >= WIN_LENGTH) {
      return { winner: player, cells };
    }
  }

  return null;
}

function getGroup(
  board: Board,
  row: number,
  col: number
): { cells: { row: number; col: number }[]; liberties: number } {
  const player = board[row][col];
  if (!player) return { cells: [], liberties: 0 };

  const visited = new Set<string>();
  const group: { row: number; col: number }[] = [];
  const libertySet = new Set<string>();
  const stack = [{ row, col }];

  while (stack.length > 0) {
    const { row: r, col: c } = stack.pop()!;
    const key = `${r}-${c}`;
    if (visited.has(key)) continue;
    visited.add(key);
    group.push({ row: r, col: c });

    for (const [dr, dc] of NEIGHBORS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
      const nKey = `${nr}-${nc}`;
      if (board[nr][nc] === null) {
        libertySet.add(nKey);
      } else if (board[nr][nc] === player && !visited.has(nKey)) {
        stack.push({ row: nr, col: nc });
      }
    }
  }

  return { cells: group, liberties: libertySet.size };
}

export function captureStones(
  board: Board,
  lastRow: number,
  lastCol: number
): { newBoard: Board; captured: { row: number; col: number }[] } {
  const player = board[lastRow][lastCol];
  if (!player) return { newBoard: board, captured: [] };

  const opponent: Player = player === "black" ? "white" : "black";
  const newBoard = board.map((r) => [...r]);
  const captured: { row: number; col: number }[] = [];
  const checked = new Set<string>();

  for (const [dr, dc] of NEIGHBORS) {
    const nr = lastRow + dr;
    const nc = lastCol + dc;
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
    if (newBoard[nr][nc] !== opponent) continue;
    const key = `${nr}-${nc}`;
    if (checked.has(key)) continue;

    const group = getGroup(newBoard, nr, nc);
    for (const cell of group.cells) {
      checked.add(`${cell.row}-${cell.col}`);
    }

    if (group.liberties === 0) {
      for (const cell of group.cells) {
        newBoard[cell.row][cell.col] = null;
        captured.push(cell);
      }
    }
  }

  return { newBoard, captured };
}

export function isBoardFull(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== null));
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: WinResult | null;
  isDraw: boolean;
  moveCount: number;
  lastMove: { row: number; col: number } | null;
  capturedByBlack: number;
  capturedByWhite: number;
  isThinking: boolean;
}

export function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPlayer: "black",
    winner: null,
    isDraw: false,
    moveCount: 0,
    lastMove: null,
    capturedByBlack: 0,
    capturedByWhite: 0,
    isThinking: false,
  };
}

export function makeMove(state: GameState, row: number, col: number): GameState {
  if (state.board[row][col] !== null || state.winner || state.isDraw) {
    return state;
  }

  const newBoard = state.board.map((r) => [...r]);
  newBoard[row][col] = state.currentPlayer;

  const { newBoard: afterCapture, captured } = captureStones(newBoard, row, col);

  const winResult = checkWin(afterCapture, row, col);
  const moveCount = state.moveCount + 1;
  const isDraw = !winResult && isBoardFull(afterCapture);

  let capturedByBlack = state.capturedByBlack;
  let capturedByWhite = state.capturedByWhite;
  if (captured.length > 0) {
    if (state.currentPlayer === "black") {
      capturedByBlack += captured.length;
    } else {
      capturedByWhite += captured.length;
    }
  }

  return {
    board: afterCapture,
    currentPlayer: state.currentPlayer === "black" ? "white" : "black",
    winner: winResult,
    isDraw,
    moveCount,
    lastMove: { row, col },
    capturedByBlack,
    capturedByWhite,
    isThinking: false,
  };
}

function evaluateLineForPlayer(
  board: Board,
  player: Player,
  row: number,
  col: number,
  dr: number,
  dc: number
): number {
  let count = 0;
  let openEnds = 0;

  let r = row - dr;
  let c = col - dc;
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
    count++;
    r -= dr;
    c -= dc;
  }
  if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === null) {
    openEnds++;
  }

  r = row + dr;
  c = col + dc;
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
    count++;
    r += dr;
    c += dc;
  }
  if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === null) {
    openEnds++;
  }

  count++;

  if (count >= 5) return 100000;
  if (count === 4 && openEnds === 2) return 50000;
  if (count === 4 && openEnds === 1) return 5000;
  if (count === 3 && openEnds === 2) return 5000;
  if (count === 3 && openEnds === 1) return 500;
  if (count === 2 && openEnds === 2) return 500;
  if (count === 2 && openEnds === 1) return 50;
  if (count === 1 && openEnds === 2) return 10;
  return 0;
}

function evaluatePosition(board: Board, row: number, col: number, player: Player): number {
  let score = 0;
  for (const [dr, dc] of DIRECTIONS) {
    score += evaluateLineForPlayer(board, player, row, col, dr, dc);
  }

  const centerDist = Math.abs(row - Math.floor(BOARD_SIZE / 2)) + Math.abs(col - Math.floor(BOARD_SIZE / 2));
  score += Math.max(0, (BOARD_SIZE - centerDist)) * 2;

  return score;
}

function evaluateCaptureValue(board: Board, row: number, col: number, player: Player): number {
  const testBoard = board.map((r) => [...r]);
  testBoard[row][col] = player;
  const { captured } = captureStones(testBoard, row, col);
  return captured.length * 3000;
}

function getThreatenedScore(board: Board, row: number, col: number, player: Player): number {
  const opponent: Player = player === "black" ? "white" : "black";
  const testBoard = board.map((r) => [...r]);
  testBoard[row][col] = opponent;
  const group = getGroup(testBoard, row, col);
  if (group.liberties <= 1) {
    return group.cells.length * 1500;
  }
  return 0;
}

export function getAIMove(state: GameState): { row: number; col: number } | null {
  const aiPlayer: Player = "white";
  const humanPlayer: Player = "black";
  const board = state.board;

  const candidates: { row: number; col: number; score: number }[] = [];

  const hasNeighbor = (r: number, c: number): boolean => {
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] !== null) {
          return true;
        }
      }
    }
    return false;
  };

  if (state.moveCount === 0) {
    const center = Math.floor(BOARD_SIZE / 2);
    return { row: center, col: center };
  }

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) continue;
      if (state.moveCount > 0 && !hasNeighbor(r, c)) continue;

      const testBoard = board.map((row) => [...row]);
      testBoard[r][c] = aiPlayer;
      const { newBoard: afterCapture } = captureStones(testBoard, r, c);
      const aiWin = checkWin(afterCapture, r, c);
      if (aiWin) {
        return { row: r, col: c };
      }

      const testBoard2 = board.map((row) => [...row]);
      testBoard2[r][c] = humanPlayer;
      const { newBoard: afterCapture2 } = captureStones(testBoard2, r, c);
      const humanWin = checkWin(afterCapture2, r, c);

      let score = 0;

      if (humanWin) {
        score += 90000;
      }

      score += evaluatePosition(board, r, c, aiPlayer) * 1.1;
      score += evaluatePosition(board, r, c, humanPlayer) * 1.0;

      score += evaluateCaptureValue(board, r, c, aiPlayer);
      score += getThreatenedScore(board, r, c, aiPlayer);

      candidates.push({ row: r, col: c, score });
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);

  const topScore = candidates[0].score;
  const topCandidates = candidates.filter((c) => c.score >= topScore * 0.95);
  const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)];

  return { row: chosen.row, col: chosen.col };
}

export interface GameRecord {
  id: string;
  date: string;
  winner: Player | "draw";
  moveCount: number;
  capturedByBlack: number;
  capturedByWhite: number;
}

export interface ScoreState {
  playerWins: number;
  aiWins: number;
  draws: number;
}
