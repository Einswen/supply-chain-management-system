"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { AuthResponse, login, signUp } from "@/lib/api";
import { FieldErrors, validateAuthFields } from "@/lib/validation";
import ColorBends from "./ColorBendsClient";

type AuthMode = "login" | "signup";

const apiMessages: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: "This email has already been registered.",
  USER_NOT_FOUND: "No user exists for this email.",
  INVALID_PASSWORD: "The password is incorrect.",
  VALIDATION_ERROR: "Please check the highlighted fields.",
  NETWORK_ERROR: "Cannot connect to the backend service. Please make sure it is running."
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";
  const copy = useMemo(
    () => ({
      title: isSignup ? "Create your account" : "Log in to dashboard",
      subtitle: isSignup
        ? "Register with your company email to begin using the admin workspace."
        : "Use your registered email and password to continue.",
      submit: isSignup ? "Create account" : "Log in",
      switchText: isSignup ? "Already have an account?" : "Need an account?",
      switchHref: isSignup ? "/login" : "/signup",
      switchAction: isSignup ? "Log in" : "Sign up"
    }),
    [isSignup]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");
    setSuccess("");

    const errors = validateAuthFields(email, password, isSignup ? confirmPassword : undefined);
    setFieldErrors(errors);

    if (errors.email || errors.password || errors.confirmPassword) {
      return;
    }

    setLoading(true);
    const result: AuthResponse = isSignup
      ? await signUp(email.trim(), password, confirmPassword)
      : await login(email.trim(), password);
    setLoading(false);

    if (result.status === "REGISTER_SUCCESS") {
      setSuccess(result.message || "Registration succeeded.");
      setPassword("");
      setConfirmPassword("");
      return;
    }

    if (result.status === "LOGIN_SUCCESS" && result.user) {
      window.localStorage.setItem("auth.user", JSON.stringify(result.user));
      window.localStorage.setItem("auth.token", result.token ?? "");
      router.push("/dashboard");
      return;
    }

    setApiError(apiMessages[result.status] ?? result.message ?? "Authentication failed.");
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        bgcolor: "oklch(0.965 0.006 250)",
        px: { xs: 2, sm: 4 },
        py: 5
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none"
        }}
      >
        <ColorBends
          rotation={90}
          speed={0.2}
          colors={["#3B82F6", "#FF9FFC", "#bffbb6"]}
          transparent
          autoRotate={0}
          scale={1.1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.15}
          iterations={1}
          intensity={1.5}
          bandWidth={6}
        />
      </Box>
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(255, 255, 255, 0.62)",
          pointerEvents: "none"
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440
        }}
      >
        <Paper
          component="section"
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 3, sm: 4 },
            border: "1px solid var(--border)",
            borderRadius: 2
          }}
        >
          <Stack spacing={3}>
            <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
              <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
                {isSignup ? <PersonAddAlt1Icon /> : <LockOutlinedIcon />}
              </Avatar>
              <Box>
                <Typography variant="h2">{copy.title}</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.6 }}>
                  {copy.subtitle}
                </Typography>
              </Box>
            </Stack>

            {apiError ? <Alert severity="error">{apiError}</Alert> : null}

            <Box component="form" noValidate onSubmit={handleSubmit}>
              <Stack spacing={2.25}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  required
                  autoComplete="email"
                  error={Boolean(fieldErrors.email)}
                  helperText={fieldErrors.email ?? "Use a valid email format, for example name@company.com."}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFieldErrors((current) => ({ ...current, email: undefined }));
                    setApiError("");
                  }}
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  required
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  error={Boolean(fieldErrors.password)}
                  helperText={fieldErrors.password ?? "At least 8 characters with letters and numbers."}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setFieldErrors((current) => ({ ...current, password: undefined }));
                    setApiError("");
                  }}
                />
                {isSignup ? (
                  <TextField
                    label="Confirm password"
                    type="password"
                    value={confirmPassword}
                    required
                    autoComplete="new-password"
                    error={Boolean(fieldErrors.confirmPassword)}
                    helperText={fieldErrors.confirmPassword ?? "Enter the same password again."}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setFieldErrors((current) => ({ ...current, confirmPassword: undefined }));
                      setApiError("");
                    }}
                  />
                ) : null}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={isSignup ? <PersonAddAlt1Icon /> : <LoginIcon />}
                >
                  {loading ? "Checking..." : copy.submit}
                </Button>
              </Stack>
            </Box>

            <Typography color="text.secondary" sx={{ textAlign: "center" }}>
              {copy.switchText}{" "}
              <Link
                href={copy.switchHref}
                style={{ color: "var(--primary)", fontWeight: 650 }}
              >
                {copy.switchAction}
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Box>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={5000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}
