"use client";

import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { type AdminUser, type UserInput, type UserStatus } from "@/lib/api";
import { FormEvent, useEffect, useMemo, useState } from "react";

const statusOptions: { value: UserStatus; label: string; notice: string }[] = [
  { value: "pending", label: "Pending", notice: "Account is waiting for confirmation" },
  { value: "active", label: "Active", notice: "Account is active" },
  { value: "inactive", label: "Inactive", notice: "Account is inactive" },
  { value: "suspended", label: "Suspended", notice: "Account access is suspended" },
  { value: "banned", label: "Banned", notice: "Account access is banned" }
];

const countries = [
  { value: "", label: "Not set", flag: "" },
  { value: "USA", label: "USA", flag: "🇺🇸" },
  { value: "Sweden", label: "Sweden", flag: "🇸🇪" },
  { value: "China", label: "China", flag: "🇨🇳" },
  { value: "Japan", label: "Japan", flag: "🇯🇵" },
  { value: "Canada", label: "Canada", flag: "🇨🇦" },
  { value: "Germany", label: "Germany", flag: "🇩🇪" },
  { value: "France", label: "France", flag: "🇫🇷" },
  { value: "UK", label: "UK", flag: "🇬🇧" },
  { value: "India", label: "India", flag: "🇮🇳" }
];

export const emptyUserForm: UserInput = {
  name: "",
  email: "",
  phoneNumber: "",
  country: "",
  stateRegion: "",
  city: "",
  address: "",
  zipCode: "",
  company: "",
  titleRole: "",
  status: "pending"
};

type UserQuickUpdateDialogProps = {
  open: boolean;
  user: AdminUser | null;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: UserInput) => Promise<void> | void;
};

export function UserQuickUpdateDialog({
  open,
  user,
  saving,
  error,
  onClose,
  onSubmit
}: UserQuickUpdateDialogProps) {
  const [form, setForm] = useState<UserInput>(emptyUserForm);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(user ? userToInput(user) : emptyUserForm);
  }, [open, user]);

  const selectedStatus = useMemo(
    () => statusOptions.find((status) => status.value === form.status) ?? statusOptions[0],
    [form.status]
  );
  const selectedCountry = countries.find((country) => country.value === form.country);
  const canSave = Boolean(form.name.trim() && form.email.trim() && form.titleRole.trim());

  function updateField<Key extends keyof UserInput>(key: Key, value: UserInput[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSave || saving) {
      return;
    }

    await onSubmit({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      titleRole: form.titleRole.trim(),
      phoneNumber: form.phoneNumber.trim(),
      country: form.country.trim(),
      stateRegion: form.stateRegion.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      zipCode: form.zipCode.trim(),
      company: form.company.trim()
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      aria-labelledby="user-quick-update-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            maxWidth: 960
          }
        }
      }}
    >
      <DialogTitle
        id="user-quick-update-title"
        sx={{ px: { xs: 2.5, sm: 4 }, pt: { xs: 2.5, sm: 4 }, pb: 1 }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Typography component="span" variant="h1" sx={{ fontSize: 28, flex: 1 }}>
            Quick update
          </Typography>
          <IconButton aria-label="Close quick update" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, pb: 0 }}>
          <Stack spacing={2.5}>
            <Alert
              severity="info"
              icon={<InfoOutlinedIcon />}
              sx={{
                alignItems: "center",
                border: "1px solid rgba(2, 132, 199, 0.20)",
                bgcolor: "rgba(14, 165, 233, 0.08)",
                color: "rgb(2, 92, 138)",
                "& .MuiAlert-message": {
                  fontSize: 18,
                  fontWeight: 650
                }
              }}
            >
              {selectedStatus.notice}
            </Alert>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 2
              }}
            >
              <TextField
                select
                label="Status"
                value={form.status}
                onChange={(event) => updateField("status", event.target.value as UserStatus)}
                sx={{ maxWidth: { md: 460 } }}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ display: { xs: "none", md: "block" } }} />

              <TextField
                label="Full name"
                value={form.name}
                required
                onChange={(event) => updateField("name", event.target.value)}
              />
              <TextField
                label="Email address"
                type="email"
                value={form.email}
                required
                onChange={(event) => updateField("email", event.target.value)}
              />
              <TextField
                label="Phone number"
                value={form.phoneNumber}
                onChange={(event) => updateField("phoneNumber", event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box component="span" sx={{ fontSize: 22, lineHeight: 1 }}>
                          {selectedCountry?.flag || "☎"}
                        </Box>
                      </InputAdornment>
                    ),
                    endAdornment: form.phoneNumber ? (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Clear phone number"
                          edge="end"
                          onClick={() => updateField("phoneNumber", "")}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : undefined
                  }
                }}
              />
              <TextField
                select
                label="Country"
                value={form.country}
                onChange={(event) => updateField("country", event.target.value)}
              >
                {countries.map((country) => (
                  <MenuItem key={country.value || "empty"} value={country.value}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      {country.flag ? <Box component="span">{country.flag}</Box> : null}
                      <span>{country.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="State/region"
                value={form.stateRegion}
                onChange={(event) => updateField("stateRegion", event.target.value)}
              />
              <TextField
                label="City"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
              />
              <TextField
                label="Address"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
              <TextField
                label="Zip/code"
                value={form.zipCode}
                onChange={(event) => updateField("zipCode", event.target.value)}
              />
              <TextField
                label="Company"
                value={form.company}
                onChange={(event) => updateField("company", event.target.value)}
              />
              <TextField
                label="Role"
                value={form.titleRole}
                required
                onChange={(event) => updateField("titleRole", event.target.value)}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
          <Button variant="outlined" color="inherit" onClick={onClose} sx={{ minWidth: 112 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={!canSave || saving} sx={{ minWidth: 112 }}>
            {saving ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

function userToInput(user: AdminUser): UserInput {
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    phoneNumber: user.phoneNumber ?? "",
    country: user.country ?? "",
    stateRegion: user.stateRegion ?? "",
    city: user.city ?? "",
    address: user.address ?? "",
    zipCode: user.zipCode ?? "",
    company: user.company ?? "",
    titleRole: user.titleRole ?? "",
    status: user.status ?? "pending"
  };
}
