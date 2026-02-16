import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import ChartCard from "../ChartCard/ChartCard";
import styles from "./AvailabilityByLabCard.module.scss";
import { Machine } from '../../types';

export type AvailabilityByLabCardProps = {
  machines: Machine[];
  loading?: boolean;
};

type Row = {
  lab: string;
  available: number;
  reserved: number;
  locked: number;
  busy: number;
  offline: number;
  total: number;
};

type StatusCounts = Omit<Row, "lab" | "total">;
type StatusKey = keyof StatusCounts;

enum MachineStatus {
  Available = "available",
  Reserved = "reserved",
  Locked = "locked",
  Busy = "busy",
  Offline = "offline",
}

const normalizeStatus = (status?: string): MachineStatus => {
  const s = (status ?? "").toLowerCase();
  if (s === MachineStatus.Available) return MachineStatus.Available;
  if (s === MachineStatus.Reserved) return MachineStatus.Reserved;
  if (s === MachineStatus.Locked) return MachineStatus.Locked;
  if (s === MachineStatus.Busy) return MachineStatus.Busy;
  return MachineStatus.Offline;
};

const incrementStatus = (counts: StatusCounts, status: MachineStatus) => {
  counts[status as StatusKey] += 1;
};

const AvailabilityByLabCard: React.FC<AvailabilityByLabCardProps> = ({
  machines,
  loading = false,
}) => {
  const data: Row[] = useMemo(() => {
    const map = new Map<string, Omit<Row, "lab">>();

    for (const m of machines) {
      const raw = (m.location ?? "Unknown").trim();
      const lab = raw.length ? raw : "Unknown";

      if (!map.has(lab)) {
        map.set(lab, { available: 0, reserved: 0, busy: 0, locked: 0, offline: 0, total: 0 });
      }

      const row = map.get(lab)!;
      const status = normalizeStatus(m.status);
      incrementStatus(row, status);

      row.total += 1;
    }

    return Array.from(map.entries())
      .map(([lab, r]) => ({ lab, ...r }))
      .sort((a, b) => b.total - a.total);
  }, [machines]);

  const totals = useMemo(() => {
    const totals: StatusCounts = {
      available: 0,
      reserved: 0,
      locked: 0,
      busy: 0,
      offline: 0,
    };
    for (const m of machines) {
      const status = normalizeStatus(m.status);
      incrementStatus(totals, status);
    }
    return totals;
  }, [machines]);

  return (
    <ChartCard
      title="Availability by location"
      subtitle="Stacked view of machine availability grouped by location."
      kpi={{ label: "Available", value: totals.available, hint: "Currently available machines" }}
      loading={loading}
      empty={!loading && machines.length === 0}
      emptyText="No machines found."
    >
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="lab" tickMargin={10} />
            <YAxis allowDecimals={false} />
            <Tooltip
              cursor={{ fillOpacity: 0.06 }}
              formatter={(value: number | undefined, name: string | undefined) => [value, name]}
              labelFormatter={(label) => `Location: ${label}`}
            />
            <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '40px' }}/>
            <Bar dataKey={MachineStatus.Available} stackId="a" fill="var(--color-available)" radius={[4, 4, 4, 4]} />
            <Bar dataKey={MachineStatus.Reserved} stackId="a" fill="var(--color-reserved)" radius={[4, 4, 4, 4]} />
            <Bar dataKey={MachineStatus.Locked} stackId="a" fill="var(--color-locked)" radius={[4, 4, 4, 4]} />
            <Bar dataKey={MachineStatus.Busy} stackId="a" fill="var(--color-busy)" radius={[4, 4, 4, 4]} />
            <Bar dataKey={MachineStatus.Offline} stackId="a" fill="var(--color-offline)" radius={[4, 4, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default AvailabilityByLabCard;
