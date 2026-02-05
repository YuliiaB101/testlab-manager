import { useEffect, useState } from "react";
import { apiMachines } from "../../services/api";
import { Machine } from "../../types";
import MachineRow from "../../components/MachineRow/MachineRow";
import styles from "./HomePage.module.scss";

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
          <button onClick={() => load(search)}>Search</button>
        </div>
      </section>

      <section className={styles.homePage__grid}>
        {loading ? (
          <div className={styles.homePage__loading}>Loading machines...</div>
        ) : (
          <table className={styles.homePage__table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>CPU</th>
                <th>RAM</th>
                <th>GPU</th>
                <th>Location</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((m) => (
                <MachineRow key={m.id} machine={m} />
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
