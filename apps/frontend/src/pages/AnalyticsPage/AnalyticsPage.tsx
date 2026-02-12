import { useState, useEffect } from 'react';
import { Machine } from '../../types';
import styles from './AnalyticsPage.module.scss';
import MachineByLabCard from '../../components/MachinesByLabCard/MachinesByLabCard';
import { apiMachines } from '../../services/api';

export default function AnalyticsPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (term: string) => {
    setLoading(true);
    const data = await apiMachines(term);
    setMachines(data.machines);
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
                <MachineByLabCard machines={machines} loading={loading} />
                {/* <AvailabilityByLabCard machines={machines} /> */}
                {/* <MachineTypesCard machines={machines} /> */}
            </div>
        </div>
    );
}