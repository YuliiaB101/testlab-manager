import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth";
import styles from "./AuthPage.module.css";

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
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.brand}>
          <div className={styles.logo}>TL</div>
          <div>
            <div className={styles.title}>TestLab Manager</div>
            <div className={styles.subtitle}>Book, lock, and run validation on test systems.</div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === "login" ? styles.active : ""}`}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            className={`${styles.tab} ${mode === "register" ? styles.active : ""}`}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === "register" && (
            <label>
              Full name
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
          )}
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.submit} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
      <div className={styles.hero}>
        <h1>Reserve test machines without back-and-forth.</h1>
        <p>
          Lock hardware for focused sessions, preconfigure the environment, and keep validation pipelines
          visible to the whole team.
        </p>
        <ul>
          <li>Search across OS, GPU, and lab locations</li>
          <li>Step-by-step reservation flow with setup options</li>
          <li>Instant completion notifications</li>
        </ul>
      </div>
    </div>
  );
}
