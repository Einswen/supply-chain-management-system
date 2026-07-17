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
  name: string;
  email: string;
  titleRole: string;
  status: UserStatus;
  phoneNumber: string;
  country: string;
  stateRegion: string;
  city: string;
  address: string;
  zipCode: string;
  company: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  status: AuthStatus;
  message: string;
  user?: AuthUser;
  token?: string;
  errors?: string[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001";

export type UserStatus = "active" | "pending" | "inactive" | "suspended" | "banned";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  titleRole: string;
  status: UserStatus;
  phoneNumber: string;
  country: string;
  stateRegion: string;
  city: string;
  address: string;
  zipCode: string;
  company: string;
  createdAt: string;
  updatedAt: string;
};

export type UserInput = {
  name: string;
  email: string;
  titleRole: string;
  status: UserStatus;
  phoneNumber: string;
  country: string;
  stateRegion: string;
  city: string;
  address: string;
  zipCode: string;
  company: string;
};

export type Company = {
  companyCode: string;
  companyName: string;
  level: number;
  country: string;
  city: string;
  foundedYear: number;
  annualRevenue: number;
  employees: number;
  revenueEfficiency: number;
  parentCompanyCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CompanyInput = {
  companyCode: string;
  companyName: string;
  level: number;
  country: string;
  city: string;
  foundedYear: number;
  annualRevenue: number;
  employees: number;
  parentCompanyCode?: string | null;
};

type ApiErrorResponse = {
  message?: string;
  errors?: string[];
};

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

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers
      }
    });
  } catch {
    throw new Error("Cannot connect to the backend service. Please make sure it is running.");
  }

  const payload = (await response.json().catch(() => null)) as ApiErrorResponse | T | null;

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse | null;
    throw new Error(errorPayload?.errors?.[0] ?? errorPayload?.message ?? "The request failed.");
  }

  return payload as T;
}

export function listUsers() {
  return requestJson<AdminUser[]>("/users");
}

export function createUser(input: UserInput) {
  return requestJson<AdminUser>("/users", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateUser(id: number, input: UserInput) {
  return requestJson<AdminUser>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function deleteUser(id: number) {
  return requestJson<{ status: string; id: number }>(`/users/${id}`, { method: "DELETE" });
}

export function deleteUsers(ids: number[]) {
  return requestJson<{ status: string; ids: number[] }>("/users/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids })
  });
}

export function listCompanies() {
  return requestJson<Company[]>("/companies");
}

export function createCompany(input: CompanyInput) {
  return requestJson<Company>("/companies", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateCompany(companyCode: string, input: Omit<CompanyInput, "companyCode">) {
  return requestJson<Company>(`/companies/${encodeURIComponent(companyCode)}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function deleteCompany(companyCode: string) {
  return requestJson<{ status: string; companyCode: string }>(
    `/companies/${encodeURIComponent(companyCode)}`,
    { method: "DELETE" }
  );
}
