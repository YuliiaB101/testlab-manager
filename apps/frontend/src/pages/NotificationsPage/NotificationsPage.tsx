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
    <div className={styles.notificationsPage}>
      <h2>Notifications</h2>
      {loading ? (
        <div className={styles.notificationsPage__loading}>Loading notifications...</div>
      ) : items.length === 0 ? (
        <div className={styles.notificationsPage__empty}>No notifications yet.</div>
      ) : (
        <div className={styles.notificationsPage__list}>
          {items.map((item) => {
            return (
              <div key={item.id} className={`${styles.notificationsPage__card} ${styles[`notificationsPage__card--${item.status}`]}`}>
                <div className={styles.notificationsPage__card__title}>{item.title}</div>
                <div className={styles.notificationsPage__card__body}>{item.body}</div>
                <div className={styles.notificationsPage__card__time}>{new Date(item.created_at).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
