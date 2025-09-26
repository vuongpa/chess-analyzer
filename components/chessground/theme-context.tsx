import React, { createContext, useState } from 'react';
import store from 'store2';
const local = store.local;

const defaultTheme = {
  board: 'brown',
  pieces: 'neo',
  coordinates: true,
  highlight: true,
  playSounds: true,
  sounds: 'piano',
};

export type ChessTheme = {
  board: string;
  pieces: string;
  coordinates: boolean;
  highlight: boolean;
  playSounds: boolean;
  sounds: string;
};

const ThemeContext = createContext<{theme: ChessTheme; setTheme: React.Dispatch<React.SetStateAction<ChessTheme>>}>({
  theme: defaultTheme as ChessTheme,
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const storedTheme = {
    board: local.get('chessground.board', defaultTheme.board),
    pieces: local.get('chessground.pieces', defaultTheme.pieces),
    coordinates: local.get('chessground.coordinates', defaultTheme.coordinates),
    highlight: local.get('chessground.highlight', defaultTheme.highlight),
    playSounds: local.get('chessground.playSounds', defaultTheme.playSounds),
    sounds: local.get('chessground.sounds', defaultTheme.sounds),
  };

  const [theme, setTheme] = useState(storedTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;