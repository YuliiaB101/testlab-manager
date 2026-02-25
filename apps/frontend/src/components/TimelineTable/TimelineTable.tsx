import React, { useEffect, useMemo, useState } from "react";
import { Machine, Reservation, TestRun } from "../../types";
import TimelineRow from "../TimelineRow/TimelineRow";
import styles from "./TimelineTable.module.scss";
import { apiAllReservations, apiTestRuns } from "../../services/api";
import { useAuth } from "../../state/auth";

type TimelineTableProps = {
  machines: Machine[];
  statusFilter: string[];
};

const TimelineTable: React.FC<TimelineTableProps> = ({ machines, statusFilter }) => {
  const { token } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [timeOffset, setTimeOffset] = useState(0);

  useEffect(() => {
    let active = true;

    const loadTimelineData = async () => {
      if (!token) {
        setReservations([]);
        setTestRuns([]);
        return;
      }

      try {
        const [reservationsData, runsData] = await Promise.all([
          apiAllReservations(token),
          apiTestRuns()
        ]);

        if (!active) return;
        setReservations(reservationsData.reservations);
        setTestRuns(runsData.runs);
      } catch {
        if (!active) return;
        setReservations([]);
        setTestRuns([]);
      }
    };

    void loadTimelineData();

    const intervalId = window.setInterval(() => {
      void loadTimelineData();
    }, 30000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  const filteredMachines = useMemo(
    () =>
      machines.filter((machine) => {
        if (!statusFilter.length) return true;
        return statusFilter.includes(machine.status);
      }),
    [machines, statusFilter]
  );

  const reservationsByMachine = useMemo(() => {
    const map = new Map<number, Reservation[]>();
    for (const reservation of reservations) {
      const current = map.get(reservation.machine_id) ?? [];
      current.push(reservation);
      map.set(reservation.machine_id, current);
    }
    return map;
  }, [reservations]);

  const testRunsByMachine = useMemo(() => {
    const map = new Map<number, TestRun[]>();
    for (const run of testRuns) {
      const current = map.get(run.machine_id) ?? [];
      current.push(run);
      map.set(run.machine_id, current);
    }
    return map;
  }, [testRuns]);

  return (
    <>
      <table className={styles.timelineTable}>
        <thead>
          <tr>
            <th><div className={styles.timelineTable__header}>Name</div></th>
            <th>
              <div className={styles.timelineTable__header}>
                <span>Timeline</span>
                <div className={styles.timelineTable__headerContent}>
                  <button
                    className={styles.timelineTable__navButton}
                    onClick={() => setTimeOffset((prev) => prev - 2)}
                    aria-label="Shift timeline 2 hours back"
                  >
                    ← 2h
                  </button>
                  <span className={styles.timelineTable__timeOffset}>
                    {timeOffset > 0 ? `+${timeOffset}h` : timeOffset < 0 ? `${timeOffset}h` : "Now"}
                  </span>
                  <button
                    className={styles.timelineTable__navButton}
                    onClick={() => setTimeOffset((prev) => prev + 2)}
                    aria-label="Shift timeline 2 hours forward"
                  >
                    2h →
                  </button>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredMachines.map((m) => (
            <TimelineRow
              key={m.id}
              machine={m}
              reservations={reservationsByMachine.get(m.id) ?? []}
              testRuns={testRunsByMachine.get(m.id) ?? []}
              timeOffsetHours={timeOffset}
            />
          ))}
        </tbody>
      </table>
    </>
  );
};

export default TimelineTable;
