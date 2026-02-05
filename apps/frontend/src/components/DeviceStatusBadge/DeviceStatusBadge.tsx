import styles from "./DeviceStatusBadge.module.scss";

const STATUS_CONFIG = {
  available: { label: 'Available', color: 'green' },
  reserved: { label: 'Reserved', color: 'yellow' },
  locked: { label: 'Locked', color: 'red' },
  offline: { label: 'Offline', color: 'gray' },
};

export interface DeviceStatusBadgeProps {
  status: keyof typeof STATUS_CONFIG;
}

export default function DeviceStatusBadge({ status }: DeviceStatusBadgeProps) {
    const config = STATUS_CONFIG[status] || { label: 'Unknown', color: 'black' };
    return (
        <span className={`${styles.deviceStatusBadge} ${styles[`deviceStatusBadge--${config.color}`]}`}>
            {config.label}
        </span>
    );
}