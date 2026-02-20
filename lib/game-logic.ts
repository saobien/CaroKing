export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = Cell[][];

export const BOARD_SIZE = 15;
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
}

export function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPlayer: "X",
    winner: null,
    isDraw: false,
    moveCount: 0,
    lastMove: null,
  };
}

export function makeMove(state: GameState, row: number, col: number): GameState {
  if (state.board[row][col] !== null || state.winner || state.isDraw) {
    return state;
  }

  const newBoard = state.board.map((r) => [...r]);
  newBoard[row][col] = state.currentPlayer;

  const winResult = checkWin(newBoard, row, col);
  const moveCount = state.moveCount + 1;
  const isDraw = !winResult && isBoardFull(newBoard);

  return {
    board: newBoard,
    currentPlayer: state.currentPlayer === "X" ? "O" : "X",
    winner: winResult,
    isDraw,
    moveCount,
    lastMove: { row, col },
  };
}

export interface GameRecord {
  id: string;
  date: string;
  winner: Player | "draw";
  moveCount: number;
  playerXName: string;
  playerOName: string;
}

export interface ScoreState {
  playerX: number;
  playerO: number;
  draws: number;
}
