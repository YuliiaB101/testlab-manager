import { Notification } from "../types";
import styles from "./Toast.module.scss";

export default function Toast({
  notification,
  onClose
}: {
  notification: Notification;
  onClose: () => void;
}) {
  return (
    <div className={styles.toast}>
      <div>
        <div className={styles.title}>{notification.title}</div>
        <div className={styles.body}>{notification.body}</div>
      </div>
      <button className={styles.close} onClick={onClose}>
        Close
      </button>
    </div>
  );
}
