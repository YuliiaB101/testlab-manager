import { Link } from "react-router-dom";
import { Machine } from "../types";
import styles from "./MachineCard.module.css";

export default function MachineCard({ machine }: { machine: Machine }) {
  return (
    <Link to={`/machines/${machine.id}`} className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.name}>{machine.name}</div>
          <div className={styles.meta}>{machine.type} - {machine.os}</div>
        </div>
        <span className={`${styles.status} ${machine.status === "locked" ? styles.locked : styles.available}`}>
          {machine.status}
        </span>
      </div>
      <div className={styles.body}>
        <div><strong>CPU:</strong> {machine.cpu}</div>
        <div><strong>RAM:</strong> {machine.ram_gb} GB</div>
        <div><strong>GPU:</strong> {machine.gpu || "-"}</div>
        <div><strong>Location:</strong> {machine.location}</div>
      </div>
      <div className={styles.tags}>
        {machine.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </Link>
  );
}
