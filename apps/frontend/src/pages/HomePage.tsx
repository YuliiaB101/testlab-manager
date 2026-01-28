import { useEffect, useState } from "react";
import { apiMachines } from "../services/api";
import { Machine } from "../types";
import MachineCard from "../components/MachineCard";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const [search, setSearch] = useState("");
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

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Find a test system in seconds.</h1>
        <p>Search by name, OS, or location. Lock machines and start validation in minutes.</p>
        <div className={styles.searchRow}>
          <input
            placeholder="Search by machine name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button onClick={() => load(search)}>Search</button>
        </div>
      </section>

      <section className={styles.grid}>
        {loading ? (
          <div className={styles.loading}>Loading machines...</div>
        ) : (
          machines.map((machine) => <MachineCard key={machine.id} machine={machine} />)
        )}
      </section>
    </div>
  );
}
