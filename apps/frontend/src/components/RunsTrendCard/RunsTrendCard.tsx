import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import ChartCard from "../ChartCard/ChartCard";
import styles from "./RunsTrendCard.module.scss";
import { TestRun } from "../../types";

type RunsTrendCardProps = {
  runs: TestRun[];
  loading?: boolean;
  days?: number;
};

type Row = { day: string; total: number; failed: number };

function isoDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const RunsTrendCard: React.FC<RunsTrendCardProps> = ({ runs, loading = false, days = 14 }) => {
  const data: Row[] = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const buckets = new Map<string, Row>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = isoDay(d);
      buckets.set(key, { day: key, total: 0, failed: 0 });
    }

    for (const r of runs) {
      const ts = r.started_at ?? r.started_at;
      if (!ts) continue;
      const dt = new Date(ts);
      if (Number.isNaN(dt.getTime())) continue;

      const key = isoDay(dt);
      const row = buckets.get(key);
      if (!row) continue;

      row.total += 1;
      if ((r.status ?? "").toLowerCase() === "failed") row.failed += 1;
    }

    return Array.from(buckets.values());
  }, [runs, days]);

  const last = data[data.length - 1];
  const todayTotal = last?.total ?? 0;

  return (
    <ChartCard
      title="Runs trend"
      subtitle={`Test runs per day (last ${days} days).`}
      kpi={{ label: "Today:", value: todayTotal, hint: "Total runs for the most recent day bucket" }}
      loading={loading}
      empty={!loading && runs.length === 0}
      emptyText="No runs yet."
    >
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 60, left: 10, bottom: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickMargin={10}
              tickFormatter={(v: string) => v.slice(5)} // show MM-DD
            />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value: number | undefined, name: string | undefined) => [value, name]}
              labelFormatter={(label) => `Day: ${label}`}
            />
            <Line type="monotone" dataKey="total" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="failed" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default RunsTrendCard;
