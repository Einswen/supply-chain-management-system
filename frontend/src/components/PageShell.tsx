"use client";

import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  APP_BAR_HEIGHT,
  DRAWER_COLLAPSED_WIDTH,
  DRAWER_WIDTH,
  NavigationBar
} from "./NavigationBar";

export function PageShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "rgb(248, 249, 251)" }}>
      <NavigationBar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
        onToggleMobile={() => setMobileOpen((value) => !value)}
      />
      <Container
        maxWidth="xl"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          pt: { xs: `${APP_BAR_HEIGHT + 24}px`, md: `${APP_BAR_HEIGHT + 32}px` },
          pb: { xs: 3, md: 4 },
          transition: (theme) =>
            theme.transitions.create(["margin-left", "width"], {
              duration: theme.transitions.duration.shorter
            })
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h1">{title}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 680, lineHeight: 1.6 }}>
              {description}
            </Typography>
          </Box>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              border: "1px solid var(--border)",
              borderRadius: 2,
              minHeight: 260
            }}
          >
            {children}
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
