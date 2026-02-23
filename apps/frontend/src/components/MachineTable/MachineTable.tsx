import React, { useMemo, useState } from "react";
import { Machine } from "../../types";
import MachineRow from "../MachineRow/MachineRow";
import styles from "./MachineTable.module.scss";
import MultiDropDown from "../MultiDropDown/MultiDropDown";

type MachineTableProps = {
  machines: Machine[];
  selectable?: boolean;
  selectedId?: string | number;
  onSelect?: (id: string) => void;
};

const MachineTable: React.FC<MachineTableProps> = ({ machines, selectable, selectedId, onSelect }) => {
  const [cpuFilter, setCpuFilter] = useState<string[]>([]);
  const [ramFilter, setRamFilter] = useState<string[]>([]);
  const [gpuFilter, setGpuFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const options = useMemo(() => {
    const firstWord = (value: string) => value.split(" ")[0];
    const uniq = (values: string[]) => Array.from(new Set(values)).sort();
    const uniqNumeric = (values: number[]) =>
      Array.from(new Set(values)).sort((a, b) => a - b).map((value) => `${value} GB`);
    return {
      cpu: uniq(machines.map((m) => firstWord(m.cpu))),
      ram: uniqNumeric(machines.map((m) => m.ram_gb)),
      gpu: uniq(machines.map((m) => firstWord(m.gpu ?? "—"))),
      location: uniq(machines.map((m) => m.location)),
      status: uniq(machines.map((m) => m.status))
    };
  }, [machines]);

  const filteredMachines = useMemo(() => {
    const firstWord = (value: string) => value.split(" ")[0];
    return machines.filter((m) => {
      if (cpuFilter.length && !cpuFilter.includes(firstWord(m.cpu))) return false;
      if (ramFilter.length && !ramFilter.includes(`${m.ram_gb} GB`)) return false;
      if (gpuFilter.length && !gpuFilter.includes(firstWord(m.gpu ?? "—"))) return false;
      if (locationFilter.length && !locationFilter.includes(m.location)) return false;
      if (statusFilter.length && !statusFilter.includes(m.status)) return false;
      return true;
    });
  }, [machines, cpuFilter, ramFilter, gpuFilter, locationFilter, statusFilter]);

  return (
    <table className={styles.machineTable}>
      <thead>
        <tr>
          <th><div className={styles.machineTable__header}>Name</div></th>
          <th><div className={styles.machineTable__header}><MultiDropDown label="CPU" options={options.cpu} selected={cpuFilter} onChange={setCpuFilter} /></div></th>
          <th><div className={styles.machineTable__header}><MultiDropDown label="RAM" options={options.ram} selected={ramFilter} onChange={setRamFilter} sortMode="none" /></div></th>
          <th><div className={styles.machineTable__header}><MultiDropDown label="GPU" options={options.gpu} selected={gpuFilter} onChange={setGpuFilter} /></div></th>
          <th><div className={styles.machineTable__header}><MultiDropDown label="Location" options={options.location} selected={locationFilter} onChange={setLocationFilter} /></div></th>
          <th><div className={styles.machineTable__header}><MultiDropDown label="Status" options={options.status} selected={statusFilter} onChange={setStatusFilter} /></div></th>
        </tr>
      </thead>
      <tbody>
        {filteredMachines.map((m) => (
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
