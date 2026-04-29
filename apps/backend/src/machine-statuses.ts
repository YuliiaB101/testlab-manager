import { pool } from "./db.js";
import { createNotification, createNotificationOnce } from "./utils.js";

export const reconcileMachineStatuses = async () => {
  // Complete test runs that have finished
  const durationCompletedRuns = await pool.query(
    `UPDATE test_runs tr
     SET status='completed', finished_at=NOW()
     FROM machines m
     WHERE tr.status='running'
     AND tr.estimated_duration IS NOT NULL
     AND (tr.started_at + (tr.estimated_duration || ' minutes')::interval) <= NOW()
     AND m.id = tr.machine_id
     RETURNING tr.id, tr.user_id, m.name AS machine_name`
  );

  for (const row of durationCompletedRuns.rows) {
    await createNotification(
      row.user_id,
      "Tests completed",
      `Test run #${row.id} on ${row.machine_name} is completed.`,
      "success"
    );
  }

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

  const finishedAtCompletedRuns = await pool.query(
    `UPDATE test_runs tr
     SET status='completed', finished_at=COALESCE(tr.finished_at, NOW())
     FROM machines m
     WHERE tr.status='running'
     AND tr.finished_at IS NOT NULL
     AND tr.finished_at <= NOW()
     AND m.id = tr.machine_id
     RETURNING tr.id, tr.user_id, m.name AS machine_name`
  );

  for (const row of finishedAtCompletedRuns.rows) {
    await createNotification(
      row.user_id,
      "Tests completed",
      `Test run #${row.id} on ${row.machine_name} is completed.`,
      "success"
    );
  }

  const endingSoonReservations = await pool.query(
    `SELECT r.id, r.user_id, r.session_name, r.end_at, m.name AS machine_name
     FROM reservations r
     JOIN machines m ON m.id = r.machine_id
     WHERE r.status='active'
       AND r.user_id IS NOT NULL
       AND r.end_at > NOW()
       AND r.end_at <= NOW() + INTERVAL '10 minutes'`
  );

  const now = Date.now();
  for (const row of endingSoonReservations.rows) {
    const endAt = new Date(row.end_at).getTime();
    const minutesLeft = Math.ceil((endAt - now) / 60000);
    const warningThreshold = minutesLeft <= 5 ? 5 : 10;

    const title = "Reservation warning";
    const body = `Reservation #${row.id} on ${row.machine_name} ends in about ${warningThreshold} minutes.`;
    await createNotificationOnce(row.user_id, title, body, "warning");
  }

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