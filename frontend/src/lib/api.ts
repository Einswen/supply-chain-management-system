export type AuthStatus =
  | "REGISTER_SUCCESS"
  | "LOGIN_SUCCESS"
  | "VALIDATION_ERROR"
  | "EMAIL_ALREADY_EXISTS"
  | "USER_NOT_FOUND"
  | "INVALID_PASSWORD";

export type AuthUser = {
  id: number;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  status: AuthStatus;
  message: string;
  user?: AuthUser;
  token?: string;
  errors?: string[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function requestAuth(
  path: string,
  email: string,
  password: string,
  confirmPassword?: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, ...(confirmPassword ? { confirmPassword } : {}) })
  });
  const data = (await response.json()) as AuthResponse;

  if (!response.ok) {
    return data;
  }

  return data;
}

export function signUp(email: string, password: string, confirmPassword: string) {
  return requestAuth("/users/signup", email, password, confirmPassword);
}

export function login(email: string, password: string) {
  return requestAuth("/users/login", email, password);
}
