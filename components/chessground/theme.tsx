import React from 'react';
import { ThemeProvider } from './theme-context';

interface ThemeProps {
  children: React.ReactNode;
}

const Theme = ({ children }: ThemeProps) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

export default Theme;