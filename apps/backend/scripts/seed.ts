import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
    tags: ["cuda", "win11", "high-perf"]
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
    tags: ["linux", "cuda", "ai"]
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
    tags: ["server", "linux", "ci"]
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
    tags: ["server", "linux", "gpu"]
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
  }
];

try {
  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM machines");
  if (rows[0].count > 0) {
    console.log("Machines already seeded");
  } else {
    for (const m of machines) {
      await pool.query(
        `INSERT INTO machines (name, type, os, cpu, ram_gb, gpu, storage_gb, location, tags)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [m.name, m.type, m.os, m.cpu, m.ram_gb, m.gpu, m.storage_gb, m.location, m.tags]
      );
    }
    console.log("Seeded machines");
  }
} finally {
  await pool.end();
}
