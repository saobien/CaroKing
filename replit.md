# Replit.md

## Overview

Caro+Go is a hybrid board game app combining Caro (Gomoku/Five-in-a-Row) and Go (Weiqi) mechanics, built with Expo/React Native. Players place black stones on intersections (Go style) against an AI opponent (white), aiming to get 5 in a row (Caro win condition). Additionally, surrounding opponent stones removes their liberties and captures them (Go capture mechanic). The app includes game history tracking, score persistence, capture statistics, and a settings screen with rules explanation. It features a dark green Go-board aesthetic with haptic feedback and animations. Vietnamese UI text. The app runs on iOS, Android, and web platforms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo/React Native)
- **Framework**: Expo SDK 54 with expo-router for file-based routing
- **Navigation**: Stack-based navigation with three screens: game (`index`), `history`, and `settings`
- **State Management**: React local state (`useState`) for game state; TanStack React Query available for server data fetching
- **Routing**: File-based routing via `expo-router` in the `app/` directory
- **Animations**: `react-native-reanimated` for piece placement animations and UI transitions
- **Fonts**: Inter font family (400, 500, 600, 700 weights) via `@expo-google-fonts/inter`
- **Styling**: StyleSheet-based with a centralized color theme in `constants/colors.ts` (dark green board theme)

### Game Logic
- Located in `lib/game-logic.ts` — pure functions for board state, win checking, and AI move calculation
- 13x13 board size, pieces placed on intersections (Go style), 5-in-a-row win condition (Caro style)
- Go-style capture: stones with 0 liberties (fully surrounded) are removed from the board
- AI opponent plays as white; player plays as black
- AI uses heuristic evaluation: checks line patterns, capture opportunities, center proximity, and threat detection
- Star points marked on the board at standard Go positions

### Local Storage
- `lib/storage.ts` uses `@react-native-async-storage/async-storage` for persisting game history (up to 50 records) and win/loss/draw scores
- No server-side persistence for game data currently — everything is client-side

### Backend (Express)
- **Location**: `server/` directory
- **Framework**: Express 5 with TypeScript (compiled via `tsx` in dev, `esbuild` for production)
- **Routes**: Registered in `server/routes.ts` — currently minimal, just creates an HTTP server with `/api` prefix convention
- **Storage**: `server/storage.ts` has an in-memory storage implementation (`MemStorage`) with a user CRUD interface — not actively used by the game yet
- **CORS**: Dynamic CORS setup supporting Replit domains and localhost for development
- **Static serving**: In production, serves Expo web build from `dist/` directory; in dev, proxies to Metro bundler

### Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: `shared/schema.ts` defines a `users` table (id, username, password) with Zod validation via `drizzle-zod`
- **Migrations**: Output to `./migrations` directory, pushed via `drizzle-kit push`
- **Current usage**: The database schema exists but isn't actively integrated into the game flow — the game uses AsyncStorage locally. The database infrastructure is ready for future features like user accounts or online multiplayer.

### Build & Development
- **Dev**: Two processes — `expo:dev` for Metro bundler and `server:dev` for Express server
- **Production build**: `expo:static:build` creates a static web bundle; `server:build` bundles the server with esbuild
- **Production run**: `server:prod` serves the built static files and API

### Key Components
- `GameBoard` — Renders the Go-style board grid with animated piece placement
- `PlayerIndicator` — Shows current turn, scores, and captured pieces
- `GameOverModal` — Win/loss/draw overlay with new game option
- `HistoryItem` — Displays individual game records in the history list
- `ErrorBoundary` / `ErrorFallback` — Error handling with restart capability

## External Dependencies

- **PostgreSQL** (via `DATABASE_URL` env var) — Drizzle ORM configured but not yet actively used for game data
- **AsyncStorage** — Primary local data persistence for game history and scores
- **Expo Services** — Splash screen, haptics, image handling, fonts
- **Replit Environment** — Uses `REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, `REPLIT_INTERNAL_APP_DOMAIN` for CORS and URL configuration
- **No external APIs** — Game logic and AI are fully self-contained on the client