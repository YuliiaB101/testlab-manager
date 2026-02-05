export interface User {
  id: number;
  name: string;
  email: string;
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
  status: "available" | "locked" | "offline" | "reserved";
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
}
