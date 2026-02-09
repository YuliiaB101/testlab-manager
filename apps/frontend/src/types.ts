export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface Machine {
  id: number;
  name: string;
  type: string;
  os: string;
  cpu: string;
  ram_gb: number;
  gpu: string | null;
  storage_gb: number;
  location: string;
  tags: string[];
  status: "available" | "locked" | "offline" | "reserved" | "busy";
  current_activity?: TestRun | null;
}

export interface Reservation {
  id: number;
  user_id: number;
  machine_id: number;
  machine_name?: string;
  session_name: string;
  start_at: string;
  end_at: string;
  status: "active" | "completed" | "cancelled";
  setup_options: {
    osVersion?: string;
    tools?: string[];
    flags?: string[];
  };
  test_plan?: string | null;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
  status: "info" | "warning" | "error" | "success";
}

export interface Tests {
  id: string;
  suite: string;
  name: string;
  description?: string;
}

export interface TestRun {
  id: number;
  machine_id: number;
  user_id: number | null;
  status: "running" | "completed" | "cancelled";
  tests_count: number;
  test_ids: number[];
  started_at: string;
  finished_at: string | null;
}
