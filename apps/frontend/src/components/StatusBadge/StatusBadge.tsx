import styles from "./StatusBadge.module.scss";
import { STATUS_CONFIG, StatusKey } from "../../constants/status";

export interface StatusBadgeProps {
  status: StatusKey;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] || { label: 'Unknown', color: 'black' };
    return (
        <span className={`${styles.statusBadge} ${styles[`statusBadge--${config.color}`]}`}>
            {config.label}
        </span>
    );
}