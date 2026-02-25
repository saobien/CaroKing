import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BOARD_THEMES, DEFAULT_THEME_ID, type BoardTheme } from "@/constants/themes";

const THEME_KEY = "caro_go_board_theme";

interface ThemeContextValue {
  theme: BoardTheme;
  setThemeId: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: BOARD_THEMES[0],
  setThemeId: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState(DEFAULT_THEME_ID);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val && BOARD_THEMES.find((t) => t.id === val)) {
        setThemeIdState(val);
      }
    });
  }, []);

  function setThemeId(id: string) {
    setThemeIdState(id);
    AsyncStorage.setItem(THEME_KEY, id);
  }

  const theme = BOARD_THEMES.find((t) => t.id === themeId) ?? BOARD_THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useBoardTheme() {
  return useContext(ThemeContext);
}
