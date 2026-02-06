import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiMachine, apiCreateReservation, apiReservations, apiCompleteReservation, apiNotifications } from "../../services/api";
import { Machine, Reservation } from "../../types";
import { useAuth } from "../../state/auth";
import { useNotifications } from "../../state/notifications";
import BookingWizard, { BookingPayload } from "../../components/BookingWizard/BookingWizard";
import styles from "./MachinePage.module.scss";
import StatusBadge from "../../components/StatusBadge/StatusBadge";

export default function MachinePage() {
  const { id } = useParams();
  const { token } = useAuth();
  const { setNotifications, pushToast } = useNotifications();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showModal, setShowModal] = useState(false);
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
  }, [id, token]);

  const handleReserve = async (payload: BookingPayload) => {
    if (!token || !machine) return;
    await apiCreateReservation(token, machine.id, payload);
    await loadMachine();
    await loadReservations();
    setShowModal(false);
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
            {machine.status === "reserved" ? "Machine reserved" : "Reserve this machine"}
          </button>
        </div>
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
                  <StatusBadge status={resv.status} />
                  {resv.status === "active" && (
                    <button className={styles.machinePage__reservations__complete} onClick={() => handleComplete(resv.id)}>
                      Complete job
                    </button>
                  )}
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
    </div>
  );
}
