import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiMachine, apiCreateReservation, apiReservations, apiCompleteReservation, apiNotifications, apiLockMachine, apiUnlockMachine, apiForceLockMachine } from "../../services/api";
import { Machine, Reservation } from "../../types";
import { useIsAdmin, useAuth } from "../../state/auth";
import { useNotifications } from "../../state/notifications";
import BookingWizard, { BookingPayload } from "../../components/BookingWizard/BookingWizard";
import styles from "./MachinePage.module.scss";
import StatusBadge from "../../components/StatusBadge/StatusBadge";

export default function MachinePage() {
  const { id } = useParams();
  const { token } = useAuth();
  const isAdmin = useIsAdmin();
  const { setNotifications, pushToast } = useNotifications();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showForceLockConfirm, setShowForceLockConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMachine = async () => {
    if (!id) return;
    const data = await apiMachine(Number(id));
    setMachine(data.machine);
  };

  const loadReservations = async () => {
    if (!token) return;
    const data = await apiReservations(token);
    const filtered = data.reservations.filter((item) => item.machine_id === Number(id));
    setReservations(filtered);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadMachine(), loadReservations()]).finally(() => setLoading(false));

    const intervalId = window.setInterval(() => {
      void loadMachine();
      void loadReservations();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [id, token]);

  const handleReserve = async (payload: BookingPayload) => {
    if (!token || !machine) return;
    await apiCreateReservation(token, machine.id, payload);
    await loadMachine();
    await loadReservations();
    setShowModal(false);
  };

  const handleLock = async () => {
    if (!token || !machine) return;
    if (machine.status === "locked") {
      await apiUnlockMachine(token, machine.id);
    } else {
      try {
        await apiLockMachine(token, machine.id);
      } catch (error) {
        if (error instanceof Error && (error.message === "Machine is reserved" || error.message === "Machine is busy")) {
          setShowForceLockConfirm(true);
          return;
        }
        throw error;
      }
    }
    await loadMachine();
    await loadReservations();
    setShowModal(false);
  };

  const handleForceLock = async () => {
    if (!token || !machine) return;
    await apiForceLockMachine(token, machine.id);
    await loadMachine();
    await loadReservations();
    setShowForceLockConfirm(false);
  };

  const handleComplete = async (reservationId: number) => {
    if (!token) return;
    await apiCompleteReservation(token, reservationId);
    await loadMachine();
    await loadReservations();
    const latest = await apiNotifications(token);
    const newest = latest.notifications[0];
    if (newest) {
      pushToast(newest);
      setNotifications(latest.notifications);
    }
  };

  if (loading || !machine) {
    return <div className={styles.loading}>Loading machine...</div>;
  }

  return (
    <div className={styles.machinePage}>
      <section className={styles.machinePage__hero}>
        <div>
          <div className={styles.machinePage__hero__title}>{machine.name}</div>
          <div className={styles.machinePage__hero__subtitle}>{machine.type} - {machine.os}</div>
        </div>
        <StatusBadge status={machine.status} />
      </section>

      <section className={styles.machinePage__details}>
        <div>
          <h3>Hardware</h3>
          <div className={styles.machinePage__details__kv}><span>CPU</span><strong>{machine.cpu}</strong></div>
          <div className={styles.machinePage__details__kv}><span>RAM</span><strong>{machine.ram_gb} GB</strong></div>
          <div className={styles.machinePage__details__kv}><span>GPU</span><strong>{machine.gpu || "-"}</strong></div>
          <div className={styles.machinePage__details__kv}><span>Storage</span><strong>{machine.storage_gb} GB</strong></div>
          <div className={styles.machinePage__details__kv}><span>Location</span><strong>{machine.location}</strong></div>
        </div>
        <div>
          <h3>Tags</h3>
          <div className={styles.machinePage__details__tags}>
            {machine.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <button className={styles.machinePage__details__reserve} onClick={() => setShowModal(true)} disabled={machine.status === "reserved"}>
            {machine.status === "reserved" ? "Machine reserved" : "Reserve machine"}
          </button>
          {isAdmin &&
            <button className={`${styles.machinePage__details__reserve} ${styles.machinePage__details__admin}`} onClick={handleLock} >
              {machine.status === "locked" ? "Unlock machine (Admin)" : "Lock machine (Admin)"}
            </button>}
        </div>
      </section>

      <section className={styles.machinePage__activity}>
        <h3>Current activity</h3>
        {machine.current_activity ? (
          <div className={styles.machinePage__activity__card}>
            <div>
              <div className={styles.machinePage__activity__title}>Tests running</div>
              <div className={styles.machinePage__activity__meta}>
                Started {new Date(machine.current_activity.started_at).toLocaleString()}
              </div>
              <div className={styles.machinePage__activity__meta}>
                Estimated end: {new Date(new Date(machine.current_activity.started_at).getTime() + (machine.current_activity.estimated_duration ?? 10) * 60000).toLocaleString()}
              </div>
              <div className={styles.machinePage__activity__meta}>
                Tests: {machine.current_activity.tests_count}
              </div>
            </div>

            <div className={styles.machinePage__activity__progressInfo}>
              <div className={styles.machinePage__activity__progressContainer}>
                {machine.current_activity.estimated_duration && (
                  <>
                    <div className={styles.machinePage__activity__progressBar}>
                      <div
                        className={styles.machinePage__activity__progressFill}
                        style={{
                          width: `${Math.min(100, Math.max(0, (Date.now() - new Date(machine.current_activity.started_at).getTime()) / (machine.current_activity.estimated_duration * 60000) * 100))}%`
                        }}
                      />
                    </div>
                    <div className={styles.machinePage__activity__progressLabel}>
                      {Math.round(Math.min(100, Math.max(0, (Date.now() - new Date(machine.current_activity.started_at).getTime()) / (machine.current_activity.estimated_duration * 60000) * 100)))}%
                    </div>
                  </>
                )}
              </div>
              <StatusBadge status="busy" />
            </div>
          </div>
        ) : (
          <div className={styles.machinePage__activity__empty}>No active tests.</div>
        )}
      </section>

      <section className={styles.machinePage__reservations}>
        <h3>My sessions on this machine</h3>
        {reservations.length === 0 ? (
          <div className={styles.machinePage__reservations__empty}>No reservations yet.</div>
        ) : (
          <div className={styles.machinePage__reservations__list}>
            {reservations.map((resv) => (
              <div key={resv.id} className={styles.machinePage__reservations__card}>
                <div>
                  <div className={styles.machinePage__reservations__sessionName}>{resv.session_name}</div>
                  <div className={styles.machinePage__reservations__sessionMeta}>
                    {new Date(resv.start_at).toLocaleString()} - {new Date(resv.end_at).toLocaleString()}
                  </div>
                </div>
                <div className={styles.machinePage__reservations__sessionActions}>
                  {resv.status === "active" && (
                    <button className={styles.machinePage__reservations__complete} onClick={() => handleComplete(resv.id)}>
                      Complete job
                    </button>
                  )}
                  <StatusBadge status={resv.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <BookingWizard
          machineName={machine.name}
          onClose={() => setShowModal(false)}
          onConfirm={handleReserve}
        />
      )}

      {showForceLockConfirm && (
        <div className={styles.machinePage__confirmOverlay}>
          <div className={styles.machinePage__confirmModal}>
            <div className={styles.machinePage__confirmTitle}>Force lock machine?</div>
            <div className={styles.machinePage__confirmText}>
              This machine is currently reserved or running tests. Locking will cancel active reservations and interrupt running tests.
            </div>
            <div className={styles.machinePage__confirmActions}>
              <button className={styles.machinePage__confirmSecondary} onClick={() => setShowForceLockConfirm(false)}>
                Cancel
              </button>
              <button className={styles.machinePage__confirmPrimary} onClick={handleForceLock}>
                Confirm lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
