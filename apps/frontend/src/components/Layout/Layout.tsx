import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../state/auth";
import { useNotifications } from "../../state/notifications";
import Toast from "../Toast/Toast";
import styles from "./Layout.module.css";

export default function Layout() {
  const { user, logout } = useAuth();
  const { toast, clearToast } = useNotifications();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logo}>TL</span>
          <div>
            <div className={styles.brandTitle}>TestLab Manager</div>
            <div className={styles.brandSubtitle}>Reserve - Lock - Validate</div>
          </div>
        </Link>
        <nav className={styles.nav}>
          <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Machines
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Notifications
          </NavLink>
        </nav>
        <div className={styles.userArea}>
          <div>
            <div className={styles.userName}>{user?.name}</div>
            <div className={styles.userEmail}>{user?.email}</div>
          </div>
          <button className={styles.logout} onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      {toast && <Toast notification={toast} onClose={clearToast} />}
    </div>
  );
}
