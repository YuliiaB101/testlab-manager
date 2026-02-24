import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../state/auth";
import { useNotifications } from "../../state/notifications";
import Toast from "../Toast/Toast";
import styles from "./Header.module.scss";

export default function Header() {
    const { user, logout } = useAuth();
    const { toast, clearToast } = useNotifications();

    return (
        <div className={styles.header}>
            <header className={styles.header__header}>
                <Link to="/" className={styles.header__brand}>
                    <span className={styles.header__logo}>TL</span>
                    <div>
                        <div className={styles.header__brandTitle}>TestLab Manager</div>
                        <div className={styles.header__brandSubtitle}>Reserve - Lock - Validate</div>
                    </div>
                </Link>
                <nav className={styles.header__nav}>
                    <NavLink to="/" className={({ isActive }) => (isActive ? styles.header__nav_active : undefined)}>
                        Machines
                    </NavLink>
                    <NavLink to="/tests" className={({ isActive }) => (isActive ? styles.header__nav_active : undefined)}>
                        Tests
                    </NavLink>
                    <NavLink to="/my-reservations" className={({ isActive }) => (isActive ? styles.header__nav_active : undefined)}>
                        My Reservations
                    </NavLink>
                    <NavLink to="/notifications" className={({ isActive }) => (isActive ? styles.header__nav_active : undefined)}>
                        Inbox
                    </NavLink>
                    <NavLink to="/analytics" className={({ isActive }) => (isActive ? styles.header__nav_active : undefined)}>
                        Analytics
                    </NavLink>
                </nav>
                <div className={styles.header__userArea}>
                    <div>
                        <div className={styles.header__userName}>{user?.name}</div>
                        <div className={styles.header__userEmail}>{user?.email}</div>
                    </div>
                    <button className={styles.header__logout} onClick={logout}>
                        Sign out
                    </button>
                </div>
            </header>
            <main className={styles.header__main}>
                <Outlet />
            </main>
            {toast && <Toast notification={toast} onClose={clearToast} />}
        </div>
    );
}
