import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import ChartCard from "../ChartCard/ChartCard";
import styles from "./MachineTypesCard.module.scss";
import { Machine } from "../../types";

type MachineTypesCardProps = {
  machines: Machine[];
  loading?: boolean;
  typeField?: "type" | "tags";
};

const COLORS = [
  'var(--color-available)',
  'var(--color-reserved)',
  'var(--color-locked)',
  'var(--color-busy)',
  'var(--color-offline)',
];

type Row = { type: string; count: number, fill: string };

function inferType(m: Machine, mode: MachineTypesCardProps["typeField"]): string {
  if (mode === "type") return (m.type ?? "Unknown").trim() || "Unknown";
  return (m.tags?.[0] ?? "Unknown").trim() || "Unknown";
}

const MachineTypesCard: React.FC<MachineTypesCardProps> = ({
  machines,
  loading = false,
  typeField = "type",
}) => {
  const data: Row[] = useMemo(() => {
    const map = new Map<string, number>();

    for (const m of machines) {
      const key = inferType(m, typeField);
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .map(([type, value], index) => ({
        type,
        count: value,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [machines, typeField]);

  const topType = data[0]?.type ?? "—";

  return (
    <ChartCard
      title="Machine types"
      subtitle="Distribution of machines grouped by type."
      kpi={{ label: "Top:", value: topType, hint: "Most common machine type" }}
      loading={loading}
      empty={!loading && machines.length === 0}
      emptyText="No machines found."
    >
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="type"
              innerRadius={66}
              outerRadius={100}
              paddingAngle={4}
              cornerRadius={8}
              label={({ payload }) => `${payload.type}: ${payload.count}`}
            />
            <Tooltip
              formatter={(value: number | undefined) => [`${value ?? 0}`, "Machines"]}
            />
          </PieChart>

          <div className={styles.centerLabel}>
            <div className={styles.centerValue}>{machines.length}</div>
            <div className={styles.centerText}>Total</div>
          </div>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default MachineTypesCard;
