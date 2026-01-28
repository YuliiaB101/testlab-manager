import { Machine, Reservation, Notification, User } from "../types";

const API_BASE = "http://localhost:4000/api";

const jsonHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Request failed");
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

export const apiCreateReservation = async (
  token: string,
  machineId: number,
  payload: {
    durationHours: number;
    sessionName: string;
    setupOptions?: { osVersion?: string; tools?: string[]; flags?: string[] };
    testPlan?: string;
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

export const apiCompleteReservation = async (token: string, id: number) => {
  const res = await fetch(`${API_BASE}/reservations/${id}/complete`, {
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
