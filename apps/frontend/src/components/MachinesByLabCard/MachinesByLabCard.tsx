import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import ChartCard from '../ChartCard/ChartCard';
import styles from './MachinesByLabCard.module.scss';

import { Machine } from '../../types';

export type MachinesByLabCardProps = {
    machines: Machine[];
    loading?: boolean;
};

const MachineByLabCard: React.FC<MachinesByLabCardProps> = ({ machines, loading = false }) => {
    // Count machines by laboratories
    const labCounts = machines.reduce((acc, machine) => {
        const lab = machine.location || 'Unknown';
        acc[lab] = (acc[lab] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const chartData = useMemo(
        () => Object.entries(labCounts).map(([lab, count]) => ({ lab, count })),
        [labCounts]
    );

    return (
        <ChartCard
            title="Machines by Laboratory"
            subtitle="Distribution of machines across different labs"
            kpi={{ label: "Total:", value: machines.length }}
            loading={loading}
            empty={!loading && machines.length === 0}
            emptyText="No machines found."
        >
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 60, left: 10, bottom: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="lab" tickMargin={10} />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                            cursor={{ fillOpacity: 0.06 }}
                            formatter={(value: number | undefined) => [value ?? 0, "Machines"]}
                            labelFormatter={(label) => `Lab: ${label}`}
                        />
                        <Bar dataKey="count" radius={[8, 8, 8, 8]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </ChartCard>
    )

};

export default MachineByLabCard;