import { useState, useEffect } from 'react';
import { Machine, TestRun } from '../../types';
import styles from './AnalyticsPage.module.scss';
import { apiMachines, apiTestRuns } from '../../services/api';
import MachineByLabCard from '../../components/MachinesByLabCard/MachinesByLabCard';
import AvailabilityByLabCard from '../../components/AvailabilityByLabCard/AvailabilityByLabCard';
import MachineTypesCard from '../../components/MachinesTypeCard/MachinesTypeCard';
import RunsTrendCard from '../../components/RunsTrendCard/RunsTrendCard';

export default function AnalyticsPage() {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [runs, setRuns] = useState<TestRun[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async (term: string) => {
        setLoading(true);
        const data = await apiMachines(term);
        setMachines(data.machines);
        const runsData = await apiTestRuns();
        setRuns(runsData.runs);
        setLoading(false);
    };

    useEffect(() => {
        load("");
    }, []);

    if (loading) {
        return (
            <div className={styles.analyticsPage}>
                <h2>Analytics</h2>
                <div className={styles.loading}>Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className={styles.analyticsPage}>
            <h2>Analytics</h2>
            <div className={styles.analyticsGrid}>
                <AvailabilityByLabCard machines={machines} loading={loading} />
                <RunsTrendCard runs={runs} days={14} loading={loading} />
                <MachineTypesCard machines={machines} loading={loading} />
                <MachineByLabCard machines={machines} loading={loading} />
            </div>
        </div>
    );
}