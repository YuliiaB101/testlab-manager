import { Link } from "react-router-dom";
import { Machine } from "../../types";
import styles from "./MachineRow.module.scss";
import DeviceStatusBadge from "../DeviceStatusBadge/DeviceStatusBadge";

export default function MachineRow({ machine }: { machine: Machine }) {
  return (
    <tr>
      <td>
        <div className={styles.machineRow__titleRow}>
          <Link to={`/machines/${machine.id}`} className={styles.machineRow__name}>
            {machine.name}
          </Link>
          <div className={styles.machineRow__tags}>{machine.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        </div>
        <div className={styles.machineRow__meta}>{machine.type} - {machine.os}</div>
      </td>
      <td>{machine.cpu}</td>
      <td>{machine.ram_gb} GB</td>
      <td>{machine.gpu ?? "—"}</td>
      <td>{machine.location}</td>
      <td>
        <DeviceStatusBadge status={machine.status} />
      </td>
    </tr>
  );
}
