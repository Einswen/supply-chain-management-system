"use client";

import BusinessIcon from "@mui/icons-material/Business";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchIcon from "@mui/icons-material/Search";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export const DRAWER_WIDTH = 260;
export const DRAWER_COLLAPSED_WIDTH = 76;
export const APP_BAR_HEIGHT = 64;

type NavigationBarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onToggleMobile: () => void;
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon fontSize="small" /> },
  { label: "Company", href: "/company", icon: <BusinessIcon fontSize="small" /> },
  { label: "Order", href: "/order", icon: <ReceiptLongIcon fontSize="small" /> },
  { label: "User", href: "/user", icon: <GroupIcon fontSize="small" /> }
];

export function NavigationBar({
  collapsed,
  mobileOpen,
  onToggleCollapsed,
  onToggleMobile
}: NavigationBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const current = navItems.find((item) => pathname.startsWith(item.href))?.href ?? "/dashboard";
  const drawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;
  const profileMenuOpen = Boolean(profileAnchor);

  function handleLogout() {
    window.localStorage.removeItem("auth.user");
    window.localStorage.removeItem("auth.token");
    router.push("/login");
  }

  const drawerContent = (isCollapsed: boolean) => (
    <Box sx={{ display: "flex", minHeight: "100%", flexDirection: "column" }}>
      <Toolbar
        sx={{
          minHeight: `${APP_BAR_HEIGHT}px !important`,
          px: isCollapsed ? 1.25 : 2,
          gap: 1.25
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 36,
            height: 36,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            fontWeight: 800
          }}
        >
          SC
        </Avatar>
        {!isCollapsed ? (
          <Typography
            variant="h6"
            sx={{ fontSize: 17, fontWeight: 760, letterSpacing: 0, lineHeight: 1.2 }}
          >
            Supply Chain Management System
          </Typography>
        ) : null}
      </Toolbar>

      <Divider />

      <Box sx={{ px: isCollapsed ? 1 : 2, py: 2 }}>
        {!isCollapsed ? (
          <Typography
            color="text.secondary"
            sx={{ mb: 1, px: 1, fontSize: 13, fontWeight: 650 }}
          >
            Main
          </Typography>
        ) : null}
        <List disablePadding sx={{ display: "grid", gap: 0.5 }}>
          {navItems.map((item) => {
            const selected = current === item.href;
            const button = (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                onClick={mobileOpen ? onToggleMobile : undefined}
                selected={selected}
                sx={{
                  minHeight: 44,
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  borderRadius: 1,
                  px: isCollapsed ? 1 : 1.25,
                  color: selected ? "primary.main" : "text.secondary",
                  "&.Mui-selected": {
                    bgcolor: "rgba(47, 82, 166, 0.10)"
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: "rgba(47, 82, 166, 0.14)"
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isCollapsed ? 0 : 36,
                    color: "inherit",
                    justifyContent: "center"
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed ? (
                  <Typography sx={{ fontSize: 14, fontWeight: selected ? 700 : 600 }}>
                    {item.label}
                  </Typography>
                ) : null}
              </ListItemButton>
            );

            return isCollapsed ? (
              <Tooltip key={item.href} title={item.label} placement="right">
                {button}
              </Tooltip>
            ) : (
              button
            );
          })}
        </List>
      </Box>

      <Box sx={{ flex: 1 }} />
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid var(--border)",
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          transition: (theme) =>
            theme.transitions.create(["margin-left", "width"], {
              duration: theme.transitions.duration.shorter
            })
        }}
      >
        <Toolbar sx={{ minHeight: `${APP_BAR_HEIGHT}px !important`, gap: 1.5 }}>
          <IconButton
            aria-label="Open navigation"
            onClick={onToggleMobile}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            onClick={onToggleCollapsed}
            sx={{ display: { xs: "none", md: "inline-flex" } }}
          >
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<SearchIcon />}
            sx={{
              minHeight: 40,
              px: 1.5,
              color: "text.secondary",
              borderColor: "var(--border)",
              justifyContent: "flex-start",
              width: { xs: 132, sm: 220 }
            }}
          >
            Search
          </Button>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Notifications">
            <IconButton aria-label="Notifications">
              <Badge badgeContent={2} color="primary">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Account menu">
            <IconButton
              aria-label="Open account menu"
              aria-controls={profileMenuOpen ? "account-menu" : undefined}
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen ? "true" : undefined}
              onClick={(event) => setProfileAnchor(event.currentTarget)}
              sx={{ p: 0.25 }}
            >
              <Avatar sx={{ width: 36, height: 36 }}>J</Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            id="account-menu"
            anchorEl={profileAnchor}
            open={profileMenuOpen}
            onClose={() => setProfileAnchor(null)}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 220,
                  border: "1px solid var(--border)",
                  boxShadow: "0 8px 24px rgba(17, 24, 39, 0.10)"
                }
              }
            }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", px: 2, py: 1.25 }}>
              <Avatar sx={{ width: 36, height: 36 }}>U</Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>user</Typography>
                <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                  Supply Chain Operator
                </Typography>
              </Box>
            </Stack>
            <Divider />
            <MenuItem
              onClick={() => {
                setProfileAnchor(null);
                handleLogout();
              }}
              sx={{ minHeight: 44, gap: 1.25 }}
            >
              <LogoutIcon fontSize="small" />
              Log out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" aria-label="Sidebar navigation">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onToggleMobile}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              borderRight: "1px solid var(--border)"
            }
          }}
        >
          {drawerContent(false)}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              overflowX: "hidden",
              borderRight: "1px solid var(--border)",
              transition: (theme) =>
                theme.transitions.create("width", {
                  duration: theme.transitions.duration.shorter
                })
            }
          }}
        >
          {drawerContent(collapsed)}
        </Drawer>
      </Box>
    </>
  );
}
