import { Link } from "react-router-dom";
import { Machine } from "../../types";
import styles from "./MachineRow.module.css";

export default function MachineRow({ machine }: { machine: Machine }) {
  return (
    <tr>
      <td>
        <Link to={`/machines/${machine.id}`} className={styles.name}>
          {machine.name}
        </Link>
        <div className={styles.meta}>{machine.type} - {machine.os}</div>
      </td>
      <td>{machine.cpu}</td>
      <td>{machine.ram_gb} GB</td>
      <td>{machine.gpu ?? "—"}</td>
      <td>{machine.location}</td>
      <td>
        <span className={`${styles.status} ${machine.status === "locked" ? styles.locked : styles.available}`}>
          {machine.status === "available" ? "Available" : "Locked"}
        </span>
      </td>
    </tr>
  );
}
