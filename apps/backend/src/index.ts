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

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin?: string) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (/^https?:\/\/localhost(?::\d+)?$/.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin)) return true;
  return false;
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const validationError = (error: z.ZodError) => {
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

const reconcileMachineStatuses = async () => {
  // Complete test runs that have finished
  await pool.query(
    `UPDATE test_runs
     SET status='completed', finished_at=NOW()
     WHERE status='running'
     AND estimated_duration IS NOT NULL
     AND (started_at + (estimated_duration || ' minutes')::interval) <= NOW()`
  );

  // Activate reservations that have started
  await pool.query(
    `UPDATE reservations
     SET status='active'
     WHERE status='pending' AND start_at <= NOW()`
  );

  // Complete reservations that have ended
  await pool.query(
    `UPDATE reservations
     SET status='completed'
     WHERE status='active' AND end_at <= NOW()`
  );

  await pool.query(
    `UPDATE test_runs
     SET status='completed', finished_at=COALESCE(finished_at, NOW())
     WHERE status='running' AND finished_at IS NOT NULL AND finished_at <= NOW()`
  );

  await pool.query(
    `UPDATE machines m
     SET status = CASE
       WHEN m.status = 'offline' THEN 'offline'
       WHEN EXISTS (
         SELECT 1
         FROM reservations r
         WHERE r.machine_id = m.id
           AND r.status = 'active'
           AND r.start_at <= NOW()
           AND r.end_at > NOW()
           AND r.setup_options @> '{"flags": ["admin-reservation"]}'::jsonb
       ) THEN 'locked'
       WHEN EXISTS (
         SELECT 1
         FROM test_runs tr
         WHERE tr.machine_id = m.id
           AND tr.status = 'running'
       ) THEN 'busy'
       WHEN EXISTS (
         SELECT 1
         FROM reservations r
         WHERE r.machine_id = m.id
           AND r.status = 'active'
           AND r.start_at <= NOW()
           AND r.end_at > NOW()
       ) THEN 'reserved'
       ELSE 'available'
     END`
  );
};

const requireAdmin = async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (!req.userId) return res.status(401).json({ error: "Missing token" });
  const result = await pool.query("SELECT role FROM users WHERE id=$1", [req.userId]);
  if (!result.rowCount) return res.status(401).json({ error: "Invalid user" });
  if (result.rows[0].role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
};

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

app.post("/api/auth/register", async (req: express.Request, res: express.Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(validationError(parsed.error));

  const { name, email, password } = parsed.data;
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rowCount) return res.status(409).json({ error: "Email already used" });

  const passwordHash = await hashPassword(password);
  const result = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id, name, email, role",
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

app.post("/api/auth/login", async (req: express.Request, res: express.Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(validationError(parsed.error));

  const { email, password } = parsed.data;
  const result = await pool.query("SELECT id, name, email, role, password_hash FROM users WHERE email=$1", [email]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user.id);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get("/api/me", requireAuth, async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthRequest;
  const result = await pool.query("SELECT id, name, email, role FROM users WHERE id=$1", [authReq.userId]);
  res.json({ user: result.rows[0] });
});

app.get("/api/machines", async (req: express.Request, res: express.Response) => {
  await reconcileMachineStatuses();
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

app.get("/api/machines/:id", async (req: express.Request, res: express.Response) => {
  await reconcileMachineStatuses();
  const id = Number(req.params.id);
  const result = await pool.query("SELECT * FROM machines WHERE id=$1", [id]);
  if (!result.rowCount) return res.status(404).json({ error: "Not found" });
  const activity = await pool.query(
    "SELECT id, machine_id, user_id, status, tests_count, test_ids, started_at, finished_at, estimated_duration FROM test_runs WHERE machine_id=$1 AND status='running' ORDER BY started_at DESC LIMIT 1",
    [id]
  );
  res.json({ machine: { ...result.rows[0], current_activity: activity.rows[0] || null } });
});

const reservationSchema = z.object({
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  sessionName: z.string().min(2).max(80),
  setupOptions: z.object({
    osVersion: z.string().optional(),
    tools: z.array(z.string()).optional(),
    flags: z.array(z.string()).optional()
  }).optional(),
  testPlan: z.string().optional()
});

app.post("/api/machines/:id/reservations", requireAuth, async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthRequest;
  await reconcileMachineStatuses();
  const machineId = Number(req.params.id);
  const parsed = reservationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(validationError(parsed.error));

  const { startAt, endAt, sessionName, setupOptions, testPlan } = parsed.data;

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

    await client.query(
      `INSERT INTO reservations (user_id, machine_id, session_name, start_at, end_at, setup_options, test_plan)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [authReq.userId, machineId, sessionName, startAt, endAt, setupOptions || {}, testPlan || null]
    );

    await client.query("COMMIT");

    // Update machine statuses so the reservation takes effect immediately if it starts now
    await reconcileMachineStatuses();

    res.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Reservation failed" });
  } finally {
    client.release();
  }
});

app.post("/api/machines/:id/lock", requireAuth, requireAdmin, async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthRequest;
  await reconcileMachineStatuses();
  const machineId = Number(req.params.id);
  const force = String(req.query.force || "false") === "true";

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
    if (machineRes.rows[0].status === "locked") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Machine is already locked" });
    }
    if (machineRes.rows[0].status === "reserved" && !force) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Machine is reserved" });
    }
    if (machineRes.rows[0].status === "busy" && !force) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Machine is busy" });
    }

    if (force) {
      const cancelled = await client.query(
        "UPDATE reservations SET status='cancelled' WHERE machine_id=$1 AND status='active' RETURNING user_id, session_name",
        [machineId]
      );

      for (const row of cancelled.rows) {
        if (!row.user_id) continue;
        await client.query(
          "INSERT INTO notifications (user_id, title, body, status) VALUES ($1,$2,$3,$4)",
          [
            row.user_id,
            "Reservation cancelled",
            `Your reservation '${row.session_name}' was cancelled due to admin lock.`,
            "error"
          ]
        );
      }

      const cancelledRuns = await client.query(
        "UPDATE test_runs SET status='cancelled', finished_at=NOW() WHERE machine_id=$1 AND status='running' RETURNING user_id",
        [machineId]
      );

      for (const row of cancelledRuns.rows) {
        if (!row.user_id) continue;
        await client.query(
          "INSERT INTO notifications (user_id, title, body, status) VALUES ($1,$2,$3,$4)",
          [
            row.user_id,
            "Tests interrupted",
            "Your tests were interrupted by an admin lock.",
            "error"
          ]
        );
      }
    }

    await client.query(
      `INSERT INTO reservations (user_id, machine_id, session_name, start_at, end_at, setup_options, test_plan)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [authReq.userId, machineId, "Admin maintenance", new Date(), new Date(Date.now() + 24 * 3600 * 1000), { flags: ["admin-reservation"] }, null]
    );

    await client.query("UPDATE machines SET status='locked' WHERE id=$1", [machineId]);
    await client.query("COMMIT");

    res.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Locking failed" });
  } finally {
    client.release();
  }
});

app.post("/api/machines/:id/unlock", requireAuth, requireAdmin, async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthRequest;
  await reconcileMachineStatuses();
  const machineId = Number(req.params.id);

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
    const adminRes = await client.query(
      "SELECT id FROM reservations WHERE machine_id=$1 AND user_id=$2 AND status='active' AND setup_options @> $3::jsonb",
      [machineId, authReq.userId, JSON.stringify({ flags: ["admin-reservation"] })]
    );

    if (machineRes.rows[0].status !== "locked" && !adminRes.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Machine is not locked" });
    }

    if (adminRes.rowCount) {
      await client.query("UPDATE reservations SET status='completed' WHERE id=$1", [adminRes.rows[0].id]);
    }

    await client.query("UPDATE machines SET status='available' WHERE id=$1", [machineId]);
    await client.query("COMMIT");

    res.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Unlocking failed" });
  } finally {
    client.release();
  }
});

app.get("/api/reservations", requireAuth, async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthRequest;
  const machineId = req.query.machineId ? Number(req.query.machineId) : null;
  const status = req.query.status ? String(req.query.status) : null;

  const values: Array<number | string> = [authReq.userId as number];
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

app.get("/api/all-reservations", requireAuth, async (_req: express.Request, res: express.Response) => {
  const result = await pool.query(
    `SELECT r.*, m.name AS machine_name FROM reservations r
     JOIN machines m ON m.id=r.machine_id
     WHERE r.status IN ('pending', 'active')
     ORDER BY r.start_at ASC`
  );
  res.json({ reservations: result.rows });
});

app.post("/api/reservations/:id/complete", requireAuth, async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthRequest;
  const reservationId = Number(req.params.id);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const resv = await client.query(
      "SELECT * FROM reservations WHERE id=$1 AND user_id=$2 FOR UPDATE",
      [reservationId, authReq.userId]
    );
    if (!resv.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Reservation not found" });
    }

    const reservation = resv.rows[0];
    await client.query("UPDATE reservations SET status='completed' WHERE id=$1", [reservationId]);
    await client.query("COMMIT");

    // Update machine statuses considering all reservations and tests
    await reconcileMachineStatuses();

    await pool.query(
      "INSERT INTO notifications (user_id, title, body, status) VALUES ($1,$2,$3,$4)",
      [authReq.userId, "Job completed", `Session '${reservation.session_name}' finished on ${reservation.end_at}`, "success"]
    );

    res.json({ ok: true });
  } catch {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Completion failed" });
  } finally {
    client.release();
  }
});

app.get("/api/notifications", requireAuth, async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthRequest;
  const result = await pool.query(
    "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC",
    [authReq.userId]
  );
  res.json({ notifications: result.rows });
});

const notificationSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  status: z.enum(["info", "warning", "error", "success"]).optional()
});

app.post("/api/notifications", requireAuth, async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthRequest;
  const parsed = notificationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(validationError(parsed.error));

  const { title, body, status } = parsed.data;
  const result = await pool.query(
    "INSERT INTO notifications (user_id, title, body, status) VALUES ($1,$2,$3,$4) RETURNING *",
    [authReq.userId, title, body, status || "info"]
  );
  res.json({ notification: result.rows[0] });
});

app.get("/api/tests", async (_req: express.Request, res: express.Response) => {
  const result = await pool.query("SELECT * FROM tests ORDER BY suite DESC");
  res.json({ tests: result.rows });
});

const testRunSchema = z.object({
  machineId: z.number().int().positive(),
  testIds: z.array(z.number().int()).default([]),
  estimatedDuration: z.number().int().positive().optional()
});

app.post("/api/tests/run", requireAuth, async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthRequest;
  await reconcileMachineStatuses();
  const parsed = testRunSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(validationError(parsed.error));

  const { machineId, testIds, estimatedDuration } = parsed.data;
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
    if (machineRes.rows[0].status !== "available") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Machine is not available" });
    }

    await client.query("UPDATE machines SET status='busy' WHERE id=$1", [machineId]);
    const runRes = await client.query(
      "INSERT INTO test_runs (machine_id, user_id, status, tests_count, test_ids, estimated_duration) VALUES ($1,$2,'running',$3,$4,$5) RETURNING *",
      [machineId, authReq.userId, testIds.length, testIds, estimatedDuration]
    );
    await client.query("COMMIT");
    res.json({ run: runRes.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Test run failed" });
  } finally {
    client.release();
  }
});

app.get("/api/test-runs", async (_req: express.Request, res: express.Response) => {
  await reconcileMachineStatuses();
  try {
    const result = await pool.query(
      `SELECT * FROM test_runs 
       ORDER BY started_at DESC 
       LIMIT 1000`
    );
    res.json({ runs: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch test runs" });
  }
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});

// Periodically update machine statuses (every 30 seconds)
setInterval(async () => {
  try {
    await reconcileMachineStatuses();
  } catch (error) {
    console.error("Failed to reconcile machine statuses:", error);
  }
}, 30000);
