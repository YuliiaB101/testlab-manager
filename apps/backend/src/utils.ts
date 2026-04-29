import { pool } from "./db.js";
import { z } from "zod";

export const validationError = (error: z.ZodError) => {
  const firstIssue = error.issues[0];
  if (!firstIssue) {
    return { error: "Validation failed", details: error.flatten() };
  }

  const path = firstIssue.path.length ? `${firstIssue.path.join(".")}: ` : "";
  return {
    error: `${path}${firstIssue.message}`,
    details: error.flatten()
  };
};

export const createNotification = async (
  userId: number | undefined,
  title: string,
  body: string,
  status: "info" | "warning" | "error" | "success" = "info"
) => {
  if (!userId) return;
  const result = await pool.query(
    "INSERT INTO notifications (user_id, title, body, status) VALUES ($1,$2,$3,$4) RETURNING *",
    [userId, title, body, status]
  );
  return result.rows[0];
};

export const createNotificationOnce = async (
  userId: number | undefined,
  title: string,
  body: string,
  status: "info" | "warning" | "error" | "success" = "info"
) => {
  if (!userId) return;
  const existing = await pool.query(
    "SELECT id FROM notifications WHERE user_id=$1 AND title=$2 AND body=$3 LIMIT 1",
    [userId, title, body]
  );
  if (existing.rowCount) return;
  return createNotification(userId, title, body, status);
};
