import { useEffect, useMemo, useState } from "react";
import { apiMachines, apiReservations } from "../../services/api";
import { Machine, Reservation } from "../../types";
import TimelineTable from "../../components/TimelineTable/TimelineTable";
import { useAuth } from "../../state/auth";
import styles from "./ReservationsPage.module.scss";

const ReservationsPage = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    // const [machineId, setMachineId] = useState<number | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        if (!token) return;
        apiReservations(token)
            .then((data) => {
                console.log("Reservations loaded:", data);
                setReservations(data.reservations);
            })
            .catch((err) => {
                console.error("Failed to load reservations:", err);
                setReservations([]);
            });
    }, [token]);

    useEffect(() => {
        if (!token) return;
        apiMachines("")
            .then((data) => {
                console.log("Machines loaded:", data);
                setMachines(data.machines);
            })
            .catch((err) => {
                console.error("Failed to load machines:", err);
                setMachines([]);
            });
    }, [token]);

    const activeReservations = useMemo(
        () => reservations.filter((r) => r.status === "active"),
        [reservations]
    );

    const pendingReservations = useMemo(
        () => reservations.filter((r) => r.status === "pending"),
        [reservations]
    );

    const activeMachines = useMemo(
        () => machines.filter((m) => activeReservations.some((r) => r.machine_id === m.id)),
        [machines, activeReservations]
    );

    const pendingMachines = useMemo(
        () => machines.filter((m) => pendingReservations.some((r) => r.machine_id === m.id)),
        [machines, pendingReservations]
    );


    return (
        <div className={styles.reservationsPage}>
            <section className={styles.reservationsPage__section}>
                <h2 className={styles.reservationsPage__title}>Active reservations:</h2>
                {activeMachines.length > 0 ? (
                    <TimelineTable machines={activeMachines} statusFilter={[]} />
                ) : (
                    <div className={styles.reservationsPage__empty}>No active reservations</div>
                )}
            </section>

            <section className={styles.reservationsPage__section}>
                <h2 className={styles.reservationsPage__title}>Pending reservations:</h2>
                {pendingMachines.length > 0 ? (
                    <TimelineTable machines={pendingMachines} statusFilter={[]} />
                ) : (
                    <div className={styles.reservationsPage__empty}>No pending reservations</div>
                )}
            </section>
        </div>
    );
}

export default ReservationsPage;