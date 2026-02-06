import styles from "./StatusBadge.module.scss";

const STATUS_CONFIG = {
  available: { label: 'Available', color: 'green' },
  reserved: { label: 'Reserved', color: 'yellow' },
  locked: { label: 'Locked', color: 'red' },
  offline: { label: 'Offline', color: 'grey' },
  active: { label: 'Active', color: 'yellow' },
  completed: { label: 'Completed', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
};

export interface StatusBadgeProps {
  status: keyof typeof STATUS_CONFIG;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] || { label: 'Unknown', color: 'black' };
    return (
        <span className={`${styles.statusBadge} ${styles[`statusBadge--${config.color}`]}`}>
            {config.label}
        </span>
    );
}