import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const users = [
  {
    name: "user",
    email: "user@user.com",
    password_hash: "$2a$10$xEL9XD4GODxARi33hcsfQOgiZmwzxI.pyTrR1S7drGZXeSqHl9BaW",
    created_at: "2026-01-28 20:17:19.099727+01",
    role: "user"
  },
  {
    name: "admin",
    email: "admin@admin.com",
    password_hash: "$2a$10$/Vwuq1byD6XKAjPaTgEUduP4byB1l/9EsqxIUFTT4GSubPArQpzMS",
    created_at: "2026-02-06 20:39:32.961433+01",
    role: "admin"
  }
] as const;

const machines = [
  {
    name: "Atlas-01",
    type: "Desktop",
    os: "Windows 11 Pro 23H2",
    cpu: "Intel Core i9-13900K",
    ram_gb: 64,
    gpu: "NVIDIA RTX 4090",
    storage_gb: 2000,
    location: "Lab A",
    tags: ["cuda", "win11", "high-perf"],
    status: "offline"
  },
  {
    name: "Nimbus-02",
    type: "Desktop",
    os: "Ubuntu 22.04 LTS",
    cpu: "AMD Ryzen 9 7950X",
    ram_gb: 128,
    gpu: "NVIDIA RTX 4080",
    storage_gb: 4000,
    location: "Lab A",
    tags: ["linux", "cuda", "ai"],
    status: "offline"
  },
  {
    name: "Orion-03",
    type: "Laptop",
    os: "Windows 10 22H2",
    cpu: "Intel Core i7-12700H",
    ram_gb: 32,
    gpu: "NVIDIA RTX 3070",
    storage_gb: 1000,
    location: "Lab B",
    tags: ["mobile", "win10"]
  },
  {
    name: "Vega-04",
    type: "Desktop",
    os: "Windows 11 Pro 23H2",
    cpu: "Intel Core i7-13700K",
    ram_gb: 32,
    gpu: "NVIDIA RTX 4070",
    storage_gb: 2000,
    location: "Lab B",
    tags: ["win11", "graphics"]
  },
  {
    name: "Helios-05",
    type: "Server",
    os: "Ubuntu 20.04 LTS",
    cpu: "Dual Xeon Gold",
    ram_gb: 256,
    gpu: "NVIDIA A10",
    storage_gb: 8000,
    location: "Lab C",
    tags: ["server", "linux", "ci"],
    status: "offline"
  },
  {
    name: "Zephyr-06",
    type: "Desktop",
    os: "Windows 11 Pro 23H2",
    cpu: "AMD Ryzen 7 7700X",
    ram_gb: 32,
    gpu: "NVIDIA RTX 3060",
    storage_gb: 1000,
    location: "Lab C",
    tags: ["win11", "qa"]
  },
  {
    name: "Aurora-07",
    type: "Laptop",
    os: "macOS Sonoma",
    cpu: "Apple M2 Pro",
    ram_gb: 16,
    gpu: "Apple GPU",
    storage_gb: 512,
    location: "Lab D",
    tags: ["mac", "ios"]
  },
  {
    name: "Quartz-08",
    type: "Desktop",
    os: "Ubuntu 22.04 LTS",
    cpu: "AMD Ryzen 5 7600",
    ram_gb: 16,
    gpu: "NVIDIA RTX 3050",
    storage_gb: 1000,
    location: "Lab D",
    tags: ["linux", "smoke"]
  },
  {
    name: "Drift-09",
    type: "Device",
    os: "Android 14",
    cpu: "Qualcomm Snapdragon",
    ram_gb: 8,
    gpu: "Adreno",
    storage_gb: 256,
    location: "Lab E",
    tags: ["android", "mobile"]
  },
  {
    name: "Pulse-10",
    type: "Device",
    os: "iOS 17",
    cpu: "Apple A16",
    ram_gb: 6,
    gpu: "Apple GPU",
    storage_gb: 256,
    location: "Lab E",
    tags: ["ios", "mobile"]
  },
  {
    name: "Triton-11",
    type: "Server",
    os: "Ubuntu 22.04 LTS",
    cpu: "AMD EPYC 7B13",
    ram_gb: 512,
    gpu: "NVIDIA L40",
    storage_gb: 12000,
    location: "Lab F",
    tags: ["server", "linux", "gpu"],
    status: "offline"
  },
  {
    name: "Boreal-12",
    type: "Desktop",
    os: "Windows 11 Pro 23H2",
    cpu: "Intel Core i5-13600K",
    ram_gb: 32,
    gpu: "NVIDIA RTX 4060",
    storage_gb: 1000,
    location: "Lab F",
    tags: ["win11", "builds"]
  },
  {
    name: "Comet-13",
    type: "Laptop",
    os: "Windows 11 Pro 23H2",
    cpu: "Intel Core i7-1360P",
    ram_gb: 16,
    gpu: "Intel Iris Xe",
    storage_gb: 512,
    location: "Lab A",
    tags: ["mobile", "win11"]
  },
  {
    name: "Lyra-14",
    type: "Desktop",
    os: "Ubuntu 22.04 LTS",
    cpu: "AMD Ryzen 7 7800X3D",
    ram_gb: 64,
    gpu: "NVIDIA RTX 4070 Ti",
    storage_gb: 2000,
    location: "Lab A",
    tags: ["linux", "cuda", "perf"]
  },
  {
    name: "Iris-15",
    type: "Device",
    os: "Android 13",
    cpu: "Qualcomm Snapdragon",
    ram_gb: 6,
    gpu: "Adreno",
    storage_gb: 128,
    location: "Lab B",
    tags: ["android", "mobile", "smoke"]
  },
  {
    name: "Sable-16",
    type: "Desktop",
    os: "Windows 10 22H2",
    cpu: "Intel Core i5-12600K",
    ram_gb: 32,
    gpu: "NVIDIA RTX 3060 Ti",
    storage_gb: 1000,
    location: "Lab B",
    tags: ["win10", "regression"]
  },
  {
    name: "Astra-17",
    type: "Server",
    os: "Ubuntu 22.04 LTS",
    cpu: "AMD EPYC 7513",
    ram_gb: 256,
    gpu: "NVIDIA A40",
    storage_gb: 16000,
    location: "Lab C",
    tags: ["server", "linux", "gpu"]
  },
  {
    name: "Cobalt-18",
    type: "Laptop",
    os: "Ubuntu 22.04 LTS",
    cpu: "AMD Ryzen 7 7840U",
    ram_gb: 32,
    gpu: "Radeon 780M",
    storage_gb: 1000,
    location: "Lab C",
    tags: ["linux", "mobile"]
  },
  {
    name: "Mistral-19",
    type: "Desktop",
    os: "Windows 11 Pro 23H2",
    cpu: "Intel Core i9-14900K",
    ram_gb: 64,
    gpu: "NVIDIA RTX 4080 Super",
    storage_gb: 4000,
    location: "Lab D",
    tags: ["win11", "graphics", "perf"]
  },
  {
    name: "Echo-20",
    type: "Device",
    os: "iOS 16",
    cpu: "Apple A15",
    ram_gb: 6,
    gpu: "Apple GPU",
    storage_gb: 128,
    location: "Lab D",
    tags: ["ios", "mobile"]
  },
  {
    name: "Nova-21",
    type: "Desktop",
    os: "Ubuntu 20.04 LTS",
    cpu: "Intel Core i7-12700",
    ram_gb: 32,
    gpu: "NVIDIA RTX 3060",
    storage_gb: 1000,
    location: "Lab E",
    tags: ["linux", "ci"]
  },
  {
    name: "Vortex-22",
    type: "Server",
    os: "Ubuntu 22.04 LTS",
    cpu: "Dual Xeon Gold",
    ram_gb: 384,
    gpu: "NVIDIA L40S",
    storage_gb: 20000,
    location: "Lab E",
    tags: ["server", "linux", "ai"]
  },
  {
    name: "Pioneer-23",
    type: "Desktop",
    os: "Windows 11 Pro 23H2",
    cpu: "AMD Ryzen 5 7600X",
    ram_gb: 16,
    gpu: "NVIDIA RTX 3050",
    storage_gb: 1000,
    location: "Lab F",
    tags: ["win11", "smoke"]
  },
  {
    name: "Solar-24",
    type: "Laptop",
    os: "macOS Ventura",
    cpu: "Apple M1 Pro",
    ram_gb: 16,
    gpu: "Apple GPU",
    storage_gb: 512,
    location: "Lab F",
    tags: ["mac", "ios", "mobile"]
  },
  {
    name: "Raven-25",
    type: "Desktop",
    os: "Ubuntu 22.04 LTS",
    cpu: "Intel Core i5-12400F",
    ram_gb: 16,
    gpu: "NVIDIA GTX 1660 Super",
    storage_gb: 512,
    location: "Lab A",
    tags: ["linux", "qa"]
  },
  {
    name: "Titan-26",
    type: "Server",
    os: "Ubuntu 20.04 LTS",
    cpu: "AMD EPYC 7543",
    ram_gb: 512,
    gpu: "NVIDIA A100",
    storage_gb: 24000,
    location: "Lab B",
    tags: ["server", "linux", "ml"]
  },
  {
    name: "Glint-27",
    type: "Device",
    os: "Android 12",
    cpu: "MediaTek Dimensity",
    ram_gb: 4,
    gpu: "Mali",
    storage_gb: 64,
    location: "Lab B",
    tags: ["android", "low-end"]
  },
  {
    name: "Quartz-28",
    type: "Desktop",
    os: "Windows 11 Pro 23H2",
    cpu: "Intel Core i7-13700",
    ram_gb: 64,
    gpu: "NVIDIA RTX 4070",
    storage_gb: 2000,
    location: "Lab C",
    tags: ["win11", "graphics"]
  },
  {
    name: "Nimbus-29",
    type: "Laptop",
    os: "Windows 10 22H2",
    cpu: "Intel Core i5-1135G7",
    ram_gb: 8,
    gpu: "Intel Iris Xe",
    storage_gb: 256,
    location: "Lab C",
    tags: ["win10", "legacy"]
  },
  {
    name: "Orchid-30",
    type: "Desktop",
    os: "Ubuntu 22.04 LTS",
    cpu: "AMD Ryzen 9 7900",
    ram_gb: 64,
    gpu: "NVIDIA RTX 4090",
    storage_gb: 4000,
    location: "Lab D",
    tags: ["linux", "cuda", "ai"]
  },
  {
    name: "Kestrel-31",
    type: "Device",
    os: "iOS 17",
    cpu: "Apple A17",
    ram_gb: 8,
    gpu: "Apple GPU",
    storage_gb: 256,
    location: "Lab D",
    tags: ["ios", "mobile", "smoke"]
  },
  {
    name: "Sierra-32",
    type: "Server",
    os: "Ubuntu 22.04 LTS",
    cpu: "Intel Xeon Silver",
    ram_gb: 192,
    gpu: "NVIDIA T4",
    storage_gb: 12000,
    location: "Lab E",
    tags: ["server", "linux", "ci"],
    status: "offline"
  }
];

const tests = [
  // ─── Smoke ─────────────────────────────────────────────
  {
    suite: "Smoke", 
    name: "Boot & Login Smoke",
    description: "Verifies that the machine boots correctly and a user can log into the system."
  },
  {
    suite: "Smoke",
    name: "Main Screen доступен",
    description: "Checks that the main application screen loads without errors."
  },
  {
    suite: "Smoke",
    name: "API Health Check",
    description: "Performs a basic API health request to ensure backend services are reachable."
  },

  // ─── Core Regression ───────────────────────────────────
  {
    suite: "Core Regression",
    name: "Reservation Creation",
    description: "Ensures a user can successfully create a new machine reservation."
  },
  {
    suite: "Core Regression",
    name: "Reservation Overlap Prevention",
    description: "Validates that overlapping reservations for the same machine are not allowed."
  },
  {
    suite: "Core Regression",
    name: "Role-based Access Control",
    description: "Checks that user permissions and roles are enforced correctly."
  },
  {
    suite: "Core Regression",
    name: "Error Handling Flow",
    description: "Verifies that user-friendly error messages are shown when an operation fails."
  },

  // ─── UI ────────────────────────────────────────────────
  {
    suite: "UI",
    name: "Responsive Layout",
    description: "Ensures the UI adapts correctly to different screen sizes."
  },
  {
    suite: "UI",
    name: "Table Sorting and Filtering",
    description: "Validates sorting and filtering behavior in data tables."
  },
  {
    suite: "UI",
    name: "Form Validation Messages",
    description: "Checks that inline validation messages appear for invalid form inputs."
  },
  {
    suite: "UI",
    name: "Keyboard Navigation",
    description: "Ensures that core UI flows are accessible via keyboard navigation."
  },

  // ─── Media ─────────────────────────────────────────────
  {
    suite: "Media",
    name: "Audio Device Detection",
    description: "Verifies that connected audio input and output devices are detected correctly."
  },
  {
    suite: "Media",
    name: "Video Encode Pipeline",
    description: "Tests video encoding using a standard codec configuration."
  },
  {
    suite: "Media",
    name: "Playback Synchronization",
    description: "Ensures audio and video playback remain synchronized during execution."
  },

  // ─── Performance ───────────────────────────────────────
  {
    suite: "Performance",
    name: "CPU Benchmark",
    description: "Measures CPU performance under sustained computational load."
  },
  {
    suite: "Performance",
    name: "GPU Benchmark",
    description: "Evaluates GPU rendering and compute capabilities under stress."
  },
  {
    suite: "Performance",
    name: "Application Startup Time",
    description: "Measures the time required for the application to fully start."
  },

  // ─── Scheduling / Resource Management ──────────────────
  {
    suite: "Scheduling",
    name: "Run on Any Free Machine",
    description: "Ensures tests can be scheduled on any currently available machine."
  },
  {
    suite: "Scheduling",
    name: "Run on Reserved Machine",
    description: "Validates that a user can run tests on a machine they have reserved."
  },
  {
    suite: "Scheduling",
    name: "Queue When Busy",
    description: "Checks that test runs are queued when no machines are available."
  },

  // ─── Stability / Long-running ──────────────────────────
  {
    suite: "Stability",
    name: "Long-running Test Execution",
    description: "Runs a prolonged test to detect memory leaks or performance degradation."
  },
  {
    suite: "Stability",
    name: "Agent Reconnect",
    description: "Verifies that the test agent reconnects after a temporary network interruption."
  },

  // ─── Observability ─────────────────────────────────────
  {
    suite: "Observability",
    name: "Logs Collection",
    description: "Ensures logs are collected and attached to the test run."
  },
  {
    suite: "Observability",
    name: "Artifacts Upload",
    description: "Validates that test artifacts are uploaded and available after execution."
  },
  {
    suite: "Observability",
    name: "Execution Metrics",
    description: "Checks that execution duration and status metrics are recorded correctly."
  }
]

try {
  let inserted = 0;
  for (const user of users) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, created_at, role)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role
       RETURNING id`,
      [user.name, user.email, user.password_hash, user.created_at, user.role]
    );
    if (result.rowCount) inserted += 1;
  }
  console.log(`Seeded users: ${inserted} upserted`);

  inserted = 0;
  for (const m of machines) {
    const result = await pool.query(
      `INSERT INTO machines (name, type, os, cpu, ram_gb, gpu, storage_gb, location, tags, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (name) DO UPDATE
       SET type = EXCLUDED.type,
           os = EXCLUDED.os,
           cpu = EXCLUDED.cpu,
           ram_gb = EXCLUDED.ram_gb,
           gpu = EXCLUDED.gpu,
           storage_gb = EXCLUDED.storage_gb,
           location = EXCLUDED.location,
           tags = EXCLUDED.tags,
           status = EXCLUDED.status
       RETURNING id`,
      [m.name, m.type, m.os, m.cpu, m.ram_gb, m.gpu, m.storage_gb, m.location, m.tags, m.status ?? "available"]
    );
    if (result.rowCount) inserted += 1;
  }

  const names = machines.map((machine) => machine.name);
  const removed = await pool.query(
    "DELETE FROM machines WHERE name <> ALL($1::text[]) RETURNING id",
    [names]
  );

  console.log(`Seeded machines: ${inserted} upserted, ${removed.rowCount ?? 0} removed`);

  inserted = 0;
  for (const t of tests) {
    const result = await pool.query(
      `INSERT INTO tests (suite, name, description, estimated_duration)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (suite, name) DO UPDATE
       SET description = EXCLUDED.description,
           estimated_duration = EXCLUDED.estimated_duration
       RETURNING id`,
      [t.suite, t.name, t.description, 10]
    );
    if (result.rowCount) inserted += 1;
  }
  console.log(`Seeded tests: ${inserted} upserted`);
} finally {
  await pool.end();
}