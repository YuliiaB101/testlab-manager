import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../state/auth";
import { useNotifications } from "../../state/notifications";
import Toast from "../Toast/Toast";
import styles from "./Layout.module.scss";

export default function Layout() {
  const { user, logout } = useAuth();
  const { toast, clearToast } = useNotifications();

  return (
    <div className={styles.layout}>
      <header className={styles.layout__header}>
        <Link to="/" className={styles.layout__brand}>
          <span className={styles.layout__logo}>TL</span>
          <div>
            <div className={styles.layout__brandTitle}>TestLab Manager</div>
            <div className={styles.layout__brandSubtitle}>Reserve - Lock - Validate</div>
          </div>
        </Link>
        <nav className={styles.layout__nav}>
          <NavLink to="/" className={({ isActive }) => (isActive ? styles.layout__nav_active : undefined)}>
            Machines
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => (isActive ? styles.layout__nav_active : undefined)}>
            Notifications
          </NavLink>
        </nav>
        <div className={styles.layout__userArea}>
          <div>
            <div className={styles.layout__userName}>{user?.name}</div>
            <div className={styles.layout__userEmail}>{user?.email}</div>
          </div>
          <button className={styles.layout__logout} onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <main className={styles.layout__main}>
        <Outlet />
      </main>
      {toast && <Toast notification={toast} onClose={clearToast} />}
    </div>
  );
}
