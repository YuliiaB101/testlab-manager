import React from "react";
import { Machine } from "../../types";
import MachineRow from "../MachineRow/MachineRow";
import styles from "./MachineTable.module.scss";

type MachineTableProps = {
  machines: Machine[];
  selectable?: boolean;
  selectedId?: string | number;
  onSelect?: (id: string) => void;
};

const MachineTable: React.FC<MachineTableProps> = ({ machines, selectable, selectedId, onSelect }) => {
  return (
    <table className={styles.machineTable}>
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
          <MachineRow
            key={m.id}
            machine={m}
            selectable={selectable}
            selected={selectedId !== undefined && String(m.id) === String(selectedId)}
            onSelect={onSelect ? (id) => onSelect(String(id)) : undefined}
          />
        ))}
      </tbody>
    </table>
  );
};

export default MachineTable;
