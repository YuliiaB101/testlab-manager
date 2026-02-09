import { Link } from "react-router-dom";
import { Machine } from "../../types";
import StatusBadge from "../StatusBadge/StatusBadge";
import styles from "./MachineRow.module.scss";

type MachineRowProps = {
  machine: Machine;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: number) => void;
};

export default function MachineRow({ machine, selectable, selected, onSelect }: MachineRowProps) {
  const rowClassName = `${selectable ? styles.machineRow__selectable : ""} ${selected ? styles.machineRow__selected : ""}`.trim();
  return (
    <tr
      className={rowClassName}
      onClick={selectable ? () => onSelect?.(machine.id) : undefined}
      role={selectable ? "button" : undefined}
      tabIndex={selectable ? 0 : undefined}
      onKeyDown={
        selectable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect?.(machine.id);
              }
            }
          : undefined
      }
    >
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
        <StatusBadge status={machine.status} />
      </td>
    </tr>
  );
}
