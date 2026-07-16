export type AuthStatus =
  | "REGISTER_SUCCESS"
  | "LOGIN_SUCCESS"
  | "VALIDATION_ERROR"
  | "EMAIL_ALREADY_EXISTS"
  | "USER_NOT_FOUND"
  | "INVALID_PASSWORD"
  | "NETWORK_ERROR";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001";

async function requestAuth(
  path: string,
  email: string,
  password: string,
  confirmPassword?: string
): Promise<AuthResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, ...(confirmPassword ? { confirmPassword } : {}) })
    });
  } catch {
    return {
      status: "NETWORK_ERROR",
      message: "Cannot connect to the backend service. Please make sure it is running."
    };
  }

  try {
    return (await response.json()) as AuthResponse;
  } catch {
    return {
      status: "NETWORK_ERROR",
      message: "The backend returned an unreadable response."
    };
  }
}

export function signUp(email: string, password: string, confirmPassword: string) {
  return requestAuth("/users/signup", email, password, confirmPassword);
}

export function login(email: string, password: string) {
  return requestAuth("/users/login", email, password);
}
