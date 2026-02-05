import { useEffect, useState } from "react";
import { apiNotifications } from "../../services/api";
import { useAuth } from "../../state/auth";
import { useNotifications } from "../../state/notifications";
import styles from "./NotificationsPage.module.scss";

export default function NotificationsPage() {
  const { token } = useAuth();
  const { items, setNotifications } = useNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiNotifications(token)
      .then((data) => setNotifications(data.notifications))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className={styles.page}>
      <h2>Notifications</h2>
      {loading ? (
        <div className={styles.empty}>Loading notifications...</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>No notifications yet.</div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.title}>{item.title}</div>
              <div className={styles.body}>{item.body}</div>
              <div className={styles.time}>{new Date(item.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
