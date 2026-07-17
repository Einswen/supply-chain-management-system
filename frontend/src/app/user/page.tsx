"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { PageShell } from "@/components/PageShell";
import { UserQuickUpdateDialog } from "@/components/UserQuickUpdateDialog";
import {
  type AdminUser,
  type UserInput,
  type UserStatus,
  createUser,
  deleteUser,
  deleteUsers,
  listUsers,
  updateUser
} from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

const statusColors: Record<UserStatus, "success" | "warning" | "default" | "error"> = {
  active: "success",
  pending: "warning",
  inactive: "default",
  suspended: "error",
  banned: "error"
};

export default function UserPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError(null);

    try {
      setUsers(await listUsers());
      setSelectedIds([]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  const titleRoles = useMemo(
    () => Array.from(new Set(users.map((user) => user.titleRole))).sort(),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter.length === 0 || roleFilter.includes(user.titleRole);
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, search, users]);

  useEffect(() => {
    setPage(0);
  }, [roleFilter, search]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredUsers.length / rowsPerPage) - 1);

    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filteredUsers.length, page, rowsPerPage]);

  const visibleUsers = useMemo(
    () => filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredUsers, page, rowsPerPage]
  );

  const allVisibleSelected =
    visibleUsers.length > 0 && visibleUsers.every((user) => selectedIds.includes(user.id));
  const someVisibleSelected = visibleUsers.some((user) => selectedIds.includes(user.id));

  function openCreateDialog() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function openEditDialog(user: AdminUser) {
    setEditingUser(user);
    setFormOpen(true);
  }

  function closeDialog() {
    setEditingUser(null);
    setFormOpen(false);
  }

  async function handleSave(input: UserInput) {
    setSaving(true);
    setError(null);

    try {
      if (editingUser) {
        const updated = await updateUser(editingUser.id, input);
        setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
      } else {
        const created = await createUser(input);
        setUsers((current) => [created, ...current]);
      }

      closeDialog();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setError(null);

    try {
      await deleteUser(id);
      setUsers((current) => current.filter((user) => user.id !== id));
      setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete user.");
    }
  }

  async function handleBulkDelete() {
    setError(null);

    try {
      await deleteUsers(selectedIds);
      setUsers((current) => current.filter((user) => !selectedIds.includes(user.id)));
      setSelectedIds([]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete users.");
    }
  }

  function toggleVisibleUsers(checked: boolean) {
    const visibleIds = visibleUsers.map((user) => user.id);

    setSelectedIds((current) =>
      checked
        ? Array.from(new Set([...current, ...visibleIds]))
        : current.filter((id) => !visibleIds.includes(id))
    );
  }

  function toggleUser(id: number, checked: boolean) {
    setSelectedIds((current) =>
      checked ? [...current, id] : current.filter((selectedId) => selectedId !== id)
    );
  }

  return (
    <PageShell title="User" description="Manage operators, roles, account status, and user actions.">
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          sx={{ alignItems: { xs: "stretch", lg: "center" } }}
        >
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name"
            aria-label="Search users by name"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }
            }}
            sx={{ maxWidth: { lg: 320 } }}
          />

          <FormControl sx={{ minWidth: { xs: "100%", lg: 280 } }}>
            <InputLabel id="role-filter-label">Title / role</InputLabel>
            <Select
              labelId="role-filter-label"
              multiple
              value={roleFilter}
              onChange={(event) => {
                const value = event.target.value;
                setRoleFilter(typeof value === "string" ? value.split(",") : value);
              }}
              input={<OutlinedInput label="Title / role" />}
              renderValue={(selected) => selected.join(", ")}
            >
              {titleRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  <Checkbox checked={roleFilter.includes(role)} />
                  <ListItemText primary={role} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
            <Tooltip title="Refresh users">
              <IconButton aria-label="Refresh users" onClick={loadUsers}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              disabled={selectedIds.length === 0}
              onClick={handleBulkDelete}
            >
              Delete selected
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
              Add user
            </Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {loading ? <LinearProgress /> : null}

        <TableContainer sx={{ border: "1px solid var(--border)", borderRadius: 1, maxWidth: "100%" }}>
          <Table aria-label="Users table" size="medium">
            <TableHead>
              <TableRow sx={{ bgcolor: "background.paper" }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={someVisibleSelected && !allVisibleSelected}
                    checked={allVisibleSelected}
                    onChange={(event) => toggleVisibleUsers(event.target.checked)}
                    slotProps={{ input: { "aria-label": "Select all visible users" } }}
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Title / role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleUsers.map((user) => (
                <TableRow key={user.id} hover selected={selectedIds.includes(user.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(user.id)}
                      onChange={(event) => toggleUser(user.id, event.target.checked)}
                      slotProps={{ input: { "aria-label": `Select ${user.name}` } }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{user.name}</Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.titleRole}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={statusColors[user.status]}
                      size="small"
                      sx={{ textTransform: "capitalize", minWidth: 78 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit user">
                      <IconButton aria-label={`Edit ${user.name}`} onClick={() => openEditDialog(user)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete user">
                      <IconButton
                        aria-label={`Delete ${user.name}`}
                        color="error"
                        onClick={() => handleDelete(user.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 5, textAlign: "center" }}>
                      <Typography sx={{ fontWeight: 700 }}>No users found</Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                        Adjust the filters or add a new user.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Stack>

      <UserQuickUpdateDialog
        open={formOpen}
        user={editingUser}
        saving={saving}
        error={error}
        onClose={closeDialog}
        onSubmit={handleSave}
      />
    </PageShell>
  );
}
