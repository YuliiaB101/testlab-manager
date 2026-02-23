import { Machine, Reservation } from "../types";

export type StatusColor = "green" | "red" | "grey" | "yellow" | "blue" | "black";

export type StatusKey = Machine["status"] | Reservation["status"];

export const STATUS_CONFIG: Record<StatusKey, { label: string; color: StatusColor }> = {
  available: { label: "Available", color: "green" },
  reserved: { label: "Reserved", color: "yellow" },
  locked: { label: "Locked", color: "red" },
  offline: { label: "Offline", color: "black" },
  busy: { label: "Busy", color: "blue" },
  active: { label: "Active", color: "yellow" },
  completed: { label: "Completed", color: "green" },
  cancelled: { label: "Cancelled", color: "red" }
};
