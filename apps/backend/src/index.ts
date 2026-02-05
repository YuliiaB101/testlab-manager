import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { z } from "zod";
import { pool } from "./db.js";
import { hashPassword, requireAuth, signToken, verifyPassword, AuthRequest } from "./auth.js";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

app.post("/api/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { name, email, password } = parsed.data;
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rowCount) return res.status(409).json({ error: "Email already used" });

  const passwordHash = await hashPassword(password);
  const result = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id, name, email",
    [name, email, passwordHash]
  );

  const user = result.rows[0];
  const token = signToken(user.id);
  res.json({ token, user });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

app.post("/api/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const result = await pool.query("SELECT id, name, email, password_hash FROM users WHERE email=$1", [email]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user.id);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get("/api/me", requireAuth, async (req: AuthRequest, res) => {
  const result = await pool.query("SELECT id, name, email FROM users WHERE id=$1", [req.userId]);
  res.json({ user: result.rows[0] });
});

app.get("/api/machines", async (req, res) => {
  const search = String(req.query.search || "").trim();
  if (search) {
    const result = await pool.query(
      "SELECT * FROM machines WHERE name ILIKE $1 ORDER BY name",
      [`%${search}%`]
    );
    return res.json({ machines: result.rows });
  }
  const result = await pool.query("SELECT * FROM machines ORDER BY name");
  res.json({ machines: result.rows });
});

app.get("/api/machines/:id", async (req, res) => {
  const id = Number(req.params.id);
  const result = await pool.query("SELECT * FROM machines WHERE id=$1", [id]);
  if (!result.rowCount) return res.status(404).json({ error: "Not found" });
  res.json({ machine: result.rows[0] });
});

const reservationSchema = z.object({
  durationHours: z.number().int().min(1).max(168),
  sessionName: z.string().min(2).max(80),
  setupOptions: z.object({
    osVersion: z.string().optional(),
    tools: z.array(z.string()).optional(),
    flags: z.array(z.string()).optional()
  }).optional(),
  testPlan: z.string().optional()
});

app.post("/api/machines/:id/reservations", requireAuth, async (req: AuthRequest, res) => {
  const machineId = Number(req.params.id);
  const parsed = reservationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { durationHours, sessionName, setupOptions, testPlan } = parsed.data;
  const startAt = new Date();
  const endAt = new Date(startAt.getTime() + durationHours * 3600 * 1000);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const machineRes = await client.query(
      "SELECT id, status FROM machines WHERE id=$1 FOR UPDATE",
      [machineId]
    );
    if (!machineRes.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Machine not found" });
    }
    if (machineRes.rows[0].status === "reserved") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Machine is reserved" });
    }

    const reservationRes = await client.query(
      `INSERT INTO reservations (user_id, machine_id, session_name, start_at, end_at, setup_options, test_plan)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [req.userId, machineId, sessionName, startAt, endAt, setupOptions || {}, testPlan || null]
    );

    await client.query("UPDATE machines SET status='reserved' WHERE id=$1", [machineId]);
    await client.query("COMMIT");

    res.json({ reservation: reservationRes.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Reservation failed" });
  } finally {
    client.release();
  }
});

app.get("/api/reservations", requireAuth, async (req: AuthRequest, res) => {
  const machineId = req.query.machineId ? Number(req.query.machineId) : null;
  const status = req.query.status ? String(req.query.status) : null;

  const values: Array<number | string> = [req.userId as number];
  let where = "user_id=$1";

  if (machineId) {
    values.push(machineId);
    where += ` AND machine_id=$${values.length}`;
  }
  if (status) {
    values.push(status);
    where += ` AND status=$${values.length}`;
  }

  const result = await pool.query(
    `SELECT r.*, m.name AS machine_name FROM reservations r
     JOIN machines m ON m.id=r.machine_id
     WHERE ${where}
     ORDER BY r.created_at DESC`,
    values
  );
  res.json({ reservations: result.rows });
});

app.post("/api/reservations/:id/complete", requireAuth, async (req: AuthRequest, res) => {
  const reservationId = Number(req.params.id);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const resv = await client.query(
      "SELECT * FROM reservations WHERE id=$1 AND user_id=$2 FOR UPDATE",
      [reservationId, req.userId]
    );
    if (!resv.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Reservation not found" });
    }

    const reservation = resv.rows[0];
    await client.query("UPDATE reservations SET status='completed' WHERE id=$1", [reservationId]);
    await client.query("UPDATE machines SET status='available' WHERE id=$1", [reservation.machine_id]);
    await client.query(
      "INSERT INTO notifications (user_id, title, body) VALUES ($1,$2,$3)",
      [req.userId, "Job completed", `Session '${reservation.session_name}' finished on ${reservation.end_at}`]
    );
    await client.query("COMMIT");

    res.json({ ok: true });
  } catch {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Completion failed" });
  } finally {
    client.release();
  }
});

app.get("/api/notifications", requireAuth, async (req: AuthRequest, res) => {
  const result = await pool.query(
    "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC",
    [req.userId]
  );
  res.json({ notifications: result.rows });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
