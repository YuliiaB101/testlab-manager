import { Machine, Reservation, Notification, User, TestRun } from "../types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "http://localhost:4000/api";

const jsonHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

const extractErrorMessage = (data: unknown): string => {
  if (!data || typeof data !== "object") return "Request failed";

  const maybeData = data as {
    error?: unknown;
    message?: unknown;
    details?: { fieldErrors?: Record<string, string[]> };
  };

  if (typeof maybeData.error === "string" && maybeData.error.trim()) {
    return maybeData.error;
  }

  if (typeof maybeData.message === "string" && maybeData.message.trim()) {
    return maybeData.message;
  }

  const fieldErrors = maybeData.details?.fieldErrors;
  if (fieldErrors) {
    for (const [field, messages] of Object.entries(fieldErrors)) {
      const first = messages?.[0];
      if (first) return `${field}: ${first}`;
    }
  }

  return "Request failed";
};

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(data));
  }
  return res.json();
}

export const apiRegister = async (name: string, email: string, password: string) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ name, email, password })
  });
  return handle<{ token: string; user: User }>(res);
};

export const apiLogin = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password })
  });
  return handle<{ token: string; user: User }>(res);
};

export const apiMe = async (token: string) => {
  const res = await fetch(`${API_BASE}/me`, { headers: jsonHeaders(token) });
  return handle<{ user: User }>(res);
};

export const apiMachines = async (search: string) => {
  const url = new URL(`${API_BASE}/machines`);
  if (search) url.searchParams.set("search", search);
  const res = await fetch(url.toString());
  return handle<{ machines: Machine[] }>(res);
};

export const apiMachine = async (id: number) => {
  const res = await fetch(`${API_BASE}/machines/${id}`);
  return handle<{ machine: Machine }>(res);
};

export const apiRunTests = async (token: string, payload: { machineId: number; testIds: number[]; estimatedDuration: number }) => {
  const res = await fetch(`${API_BASE}/tests/run`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload)
  });
  return handle<{ run: { id: number } }>(res);
};

export const apiCreateReservation = async (
  token: string,
  machineId: number,
  payload: {
    startAt: string;
    endAt: string;
    sessionName: string;
    setupOptions?: { osVersion?: string; tools?: string[]; flags?: string[] };
    testPlan?: string | null;
  }
) => {
  const res = await fetch(`${API_BASE}/machines/${machineId}/reservations`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload)
  });
  return handle<{ reservation: Reservation }>(res);
};

export const apiReservations = async (token: string) => {
  const res = await fetch(`${API_BASE}/reservations`, {
    headers: jsonHeaders(token)
  });
  return handle<{ reservations: Reservation[] }>(res);
};

export const apiAllReservations = async (token: string) => {
  const res = await fetch(`${API_BASE}/all-reservations`, {
    headers: jsonHeaders(token)
  });
  return handle<{ reservations: Reservation[] }>(res);
};

export const apiCompleteReservation = async (token: string, id: number) => {
  const res = await fetch(`${API_BASE}/reservations/${id}/complete`, {
    method: "POST",
    headers: jsonHeaders(token)
  });
  return handle<{ ok: boolean }>(res);
};

export const apiLockMachine = async (token: string, id: number) => {
  const res = await fetch(`${API_BASE}/machines/${id}/lock`, {
    method: "POST",
    headers: jsonHeaders(token)
  });
  return handle<{ ok: boolean }>(res);
};

export const apiForceLockMachine = async (token: string, id: number) => {
  const res = await fetch(`${API_BASE}/machines/${id}/lock?force=true`, {
    method: "POST",
    headers: jsonHeaders(token)
  });
  return handle<{ ok: boolean }>(res);
};

export const apiUnlockMachine = async (token: string, id: number) => {
  const res = await fetch(`${API_BASE}/machines/${id}/unlock`, {
    method: "POST",
    headers: jsonHeaders(token)
  });
  return handle<{ ok: boolean }>(res);
};

export const apiNotifications = async (token: string) => {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: jsonHeaders(token)
  });
  return handle<{ notifications: Notification[] }>(res);
};

export const apiCreateNotification = async (
  token: string,
  payload: { title: string; body: string; status?: Notification["status"] }
) => {
  const res = await fetch(`${API_BASE}/notifications`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload)
  });
  return handle<{ notification: Notification }>(res);
};

export const apiTests = async () => {
  const res = await fetch(`${API_BASE}/tests`);
  return handle<{ tests: { id: number; suite: string; name: string; description?: string }[] }>(res);
};

export const apiTestRuns = async () => {
  const res = await fetch(`${API_BASE}/test-runs`);
  return handle<{ runs: TestRun[] }>(res);
};
