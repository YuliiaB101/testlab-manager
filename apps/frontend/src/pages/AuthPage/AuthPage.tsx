import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth";
import styles from "./AuthPage.module.scss";

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authPage__hero}>
        <span className={styles.authPage__hero__logo}>TL</span>
        <h1>TestLab Manager</h1>
        <h3>Book, lock, and run validation on test systems.</h3>
      </div>

      <div className={styles.authPage__form}>
        <div className={styles.authPage__form__tabs}>
          <button
            className={`${styles.authPage__form__tab} ${mode === "login" ? styles.authPage__form__tab_active : ""}`}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            className={`${styles.authPage__form__tab} ${mode === "register" ? styles.authPage__form__tab_active : ""}`}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Full name
              <input className={styles.authPage__form__input} value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
          )}
          <label>
            Email
            <input className={styles.authPage__form__input} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Password
            <input className={styles.authPage__form__input} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <div className={styles.authPage__form__error}>{error}</div>}

          <button className={styles.authPage__form__submit} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
