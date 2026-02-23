import { useEffect, useMemo, useState } from "react";
import { apiMachines } from "../../services/api";
import { Machine } from "../../types";
import MachineTable from "../../components/MachineTable/MachineTable";
import TimelineTable from "../../components/TimelineTable/TimelineTable";
import MultiDropDown from "../../components/MultiDropDown/MultiDropDown";
import styles from "./HomePage.module.scss";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMachineTable, setIsMachineTable] = useState(true);
  const [timelineStatusFilter, setTimelineStatusFilter] = useState<string[]>([]);
  const [activeSearchTerm, setActiveSearchTerm] = useState("");

  const timelineStatusOptions = useMemo(
    () => Array.from(new Set(machines.map((machine) => machine.status))).sort(),
    [machines]
  );

  const load = async (term: string) => {
    setLoading(true);
    const data = await apiMachines(term);
    setMachines(data.machines);
    setLoading(false);
  };

  useEffect(() => {
    void load(activeSearchTerm);

    const intervalId = window.setInterval(() => {
      void load(activeSearchTerm);
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeSearchTerm]);

  return (
    <div className={styles.homePage}>
      <section className={styles.homePage__hero}>
        <h1>Find a test system in seconds.</h1>
        <p>Search by name, OS, or location. Lock machines and start validation in minutes.</p>
        <div className={styles.homePage__searchRow}>
          <input
            placeholder="Search by machine name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button onClick={() => setActiveSearchTerm(search)}>Search</button>
        </div>
      </section>

      <section className={styles.homePage__grid}>
        {loading ? (
          <div className={styles.homePage__loading}>Loading machines...</div>
        ) : (
          <>
            <div className={styles.homePage__infoRow}>
              <div className={styles.homePage__infoRow__buttons}>
                <button className={`${styles.homePage__infoRow__button} ${isMachineTable ? styles.homePage__infoRow__button_active : ""}`}
                  onClick={() => {
                    setIsMachineTable(true);
                    setTimelineStatusFilter([]);
                  }}
                >
                  Machines list
                </button>

                <button className={`${styles.homePage__infoRow__button} ${!isMachineTable ? styles.homePage__infoRow__button_active : ""}`}
                  onClick={() => setIsMachineTable(false)}
                >
                  Timeline
                </button>
                {!isMachineTable && (
                  <div className={styles.homePage__infoRow__filter}>
                    <MultiDropDown
                      label="Status Filter"
                      options={timelineStatusOptions}
                      selected={timelineStatusFilter}
                      onChange={setTimelineStatusFilter}
                    />
                  </div>
                )}
              </div>
              <h3>Total machines found: {machines.length}</h3>
            </div>
            {isMachineTable ? (
              <MachineTable machines={machines} />
            ) : (
              <TimelineTable machines={machines} statusFilter={timelineStatusFilter} />
            )}
          </>
        )}
      </section>
    </div>
  );
}
