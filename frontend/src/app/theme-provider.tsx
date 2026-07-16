"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "rgb(255, 255, 255)",
      paper: "rgb(247, 248, 250)"
    },
    primary: {
      main: "rgb(47, 82, 166)",
      dark: "rgb(36, 64, 136)",
      contrastText: "rgb(255, 255, 255)"
    },
    secondary: {
      main: "rgb(191, 91, 38)",
      contrastText: "rgb(255, 255, 255)"
    },
    text: {
      primary: "rgb(29, 32, 43)",
      secondary: "rgb(83, 91, 111)"
    },
    error: {
      main: "rgb(194, 63, 38)",
      contrastText: "rgb(255, 255, 255)"
    },
    success: {
      main: "rgb(37, 130, 82)",
      contrastText: "rgb(255, 255, 255)"
    },
    divider: "rgb(220, 224, 232)"
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: "2rem", fontWeight: 720, lineHeight: 1.15, letterSpacing: 0 },
    h2: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.2, letterSpacing: 0 },
    button: { textTransform: "none", fontWeight: 650 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          boxShadow: "none"
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    }
  }
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
