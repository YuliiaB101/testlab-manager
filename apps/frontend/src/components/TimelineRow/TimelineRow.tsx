import { useMemo } from "react";
import { Machine, Reservation, TestRun } from "../../types";
import { STATUS_CONFIG, StatusColor } from "../../constants/status";
import styles from "./TimelineRow.module.scss";
import { Link } from "react-router-dom";

type TimelineRowProps = {
    machine: Machine;
    reservations: Reservation[];
    testRuns: TestRun[];
};

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 22;
const TOTAL_SEGMENTS = DAY_END_HOUR - DAY_START_HOUR;
const HOUR_MS = 60 * 60 * 1000;

const formatHour = (date: Date) =>
    date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const parseDateSafe = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

type Interval = {
    startMs: number;
    endMs: number;
    tone: StatusColor;
};

type TimelinePiece = {
    key: string;
    tone: StatusColor;
    left: number;
    width: number;
    isPast: boolean;
};

const TONE_PRIORITY: Record<StatusColor, number> = {
    green: 1,
    grey: 2,
    yellow: 3,
    red: 4,
    blue: 5,
    black: 6
};

const pickTopTone = (tones: StatusColor[]): StatusColor => {
    return tones.reduce((top, tone) =>
        TONE_PRIORITY[tone] > TONE_PRIORITY[top] ? tone : top
    , tones[0]);
};

const testRunToStatus = (run: TestRun): keyof typeof STATUS_CONFIG => {
    if (run.status === "cancelled") return "cancelled";
    return "busy";
};

const reservationToStatus = (reservation: Reservation): keyof typeof STATUS_CONFIG => {
    const isAdminReservation = reservation.setup_options?.flags?.includes("admin-reservation");
    if (isAdminReservation) return "locked";
    if (reservation.status === "active") return "reserved";
    return reservation.status;
};

export default function TimelineRow({ machine, reservations, testRuns }: TimelineRowProps) {
    const statusConfig = STATUS_CONFIG[machine.status] ?? STATUS_CONFIG.offline;
    const baseTone: StatusColor = machine.status === "offline" ? "grey" : "green";

    const timeline = useMemo(() => {
        const now = new Date();
        const windowStart = new Date(now);
        windowStart.setHours(DAY_START_HOUR, 0, 0, 0);
        const windowStartMs = windowStart.getTime();
        const windowEndMs = windowStartMs + TOTAL_SEGMENTS * HOUR_MS;

        const labels = Array.from({ length: TOTAL_SEGMENTS + 1 }, (_, index) => {
            const point = new Date(windowStartMs + index * HOUR_MS);
            const label = point.getHours() % 2 === 0 ? formatHour(point) : "";
            return label;
        });

        const defaultStatusInterval: Interval = {
            startMs: windowStartMs,
            endMs: windowEndMs,
            tone: baseTone
        };

        const reservationIntervals: Interval[] = reservations.flatMap((reservation) => {
                const start = parseDateSafe(reservation.start_at);
                const end = parseDateSafe(reservation.end_at);
                if (!start || !end) return [];
                return [{
                    startMs: start.getTime(),
                    endMs: end.getTime(),
                    tone: STATUS_CONFIG[reservationToStatus(reservation)].color
                } satisfies Interval];
            });

        const availabilityAfterReservationIntervals: Interval[] = (() => {
            if (machine.status !== "reserved" && machine.status !== "locked") return [];

            const activeEndMs = reservations
                .filter((reservation) => reservation.status === "active")
                .map((reservation) => parseDateSafe(reservation.end_at)?.getTime() ?? null)
                .filter((value): value is number => value !== null);

            if (!activeEndMs.length) return [];

            const latestEndMs = Math.max(...activeEndMs);
            if (latestEndMs >= windowEndMs) return [];

            return [{
                startMs: Math.max(latestEndMs, windowStartMs),
                endMs: windowEndMs,
                tone: "green"
            } satisfies Interval];
        })();

        const testRunIntervals: Interval[] = testRuns.flatMap((run) => {
                const start = parseDateSafe(run.started_at);
                if (!start) return [];
                const finished = parseDateSafe(run.finished_at);
                return [{
                    startMs: start.getTime(),
                    endMs: finished ? finished.getTime() : windowEndMs,
                    tone: STATUS_CONFIG[testRunToStatus(run)].color
                } satisfies Interval];
            });

        const allIntervals = [
            defaultStatusInterval,
            ...reservationIntervals,
            ...testRunIntervals,
            ...availabilityAfterReservationIntervals
        ];

        const segments = Array.from({ length: TOTAL_SEGMENTS }, (_, index) => {
            const segmentStartMs = windowStartMs + index * HOUR_MS;
            const segmentEndMs = segmentStartMs + HOUR_MS;

            const nowMs = now.getTime();
            const cutPoints = new Set<number>([segmentStartMs, segmentEndMs]);
            if (nowMs > segmentStartMs && nowMs < segmentEndMs) {
                cutPoints.add(nowMs);
            }

            for (const interval of allIntervals) {
                const overlapStart = Math.max(segmentStartMs, interval.startMs);
                const overlapEnd = Math.min(segmentEndMs, interval.endMs);
                if (overlapEnd <= overlapStart) continue;
                cutPoints.add(overlapStart);
                cutPoints.add(overlapEnd);
            }

            const sortedPoints = Array.from(cutPoints).sort((a, b) => a - b);
            const pieces: TimelinePiece[] = [];

            for (let pointIndex = 0; pointIndex < sortedPoints.length - 1; pointIndex++) {
                const partStart = sortedPoints[pointIndex];
                const partEnd = sortedPoints[pointIndex + 1];
                if (partEnd <= partStart) continue;

                const midPoint = (partStart + partEnd) / 2;
                const activeTones = allIntervals
                    .filter((interval) => interval.startMs <= midPoint && interval.endMs >= midPoint)
                    .map((interval) => interval.tone);

                if (!activeTones.length) continue;

                const tone = pickTopTone(activeTones);
                const left = clamp01((partStart - segmentStartMs) / HOUR_MS);
                const width = clamp01((partEnd - partStart) / HOUR_MS);

                pieces.push({
                    key: `${index}-${pointIndex}-${tone}`,
                    tone,
                    left,
                    width,
                    isPast: partEnd <= nowMs
                });
            }

            return {
                pieces
            };
        });

        const nowOffsetHours = (now.getTime() - windowStartMs) / HOUR_MS;
        const nowPosition = clamp01(nowOffsetHours / TOTAL_SEGMENTS);

        return {
            labels,
            segments,
            nowPosition
        };
    }, [machine, reservations, testRuns, baseTone]);

    return (
        <tr className={styles.timelineRow}>
            <td>
                <div className={styles.timelineRow__titleRow}>
                    <Link to={`/machines/${machine.id}`} className={styles.timelineRow__name}>
                        {machine.name}
                    </Link>
                    <div className={styles.timelineRow__tags}>{machine.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </div>
                <div className={styles.timelineRow__meta}>
                    {machine.type} - {machine.os}
                </div>
            </td>
            <td>
                <div
                    className={styles.timelineRow__labels}
                >
                    {timeline.labels.map((label, index) => (
                        <span
                            key={`${machine.id}-${label || "empty"}-${index}`}
                            className={styles.timelineRow__label}
                            style={{ left: `${(index / (timeline.labels.length - 1)) * 100}%` }}
                        >
                            {label}
                        </span>
                    ))}
                </div>
                <div
                    className={styles.timelineRow__track}
                    style={{ gridTemplateColumns: `repeat(${timeline.segments.length}, minmax(0, 1fr))` }}
                    aria-label={`Machine status timeline: ${statusConfig.label}`}
                >
                    {timeline.segments.map((segment, index) => (
                        <div
                            key={`${machine.id}-segment-${index}`}
                            className={styles.timelineRow__segment}
                        >
                            {segment.pieces.map((piece) => (
                                <span
                                    key={piece.key}
                                    className={`${styles.timelineRow__segmentStatus} ${styles[piece.isPast ? `timelineRow__segmentStatusPast--${piece.tone}` : `timelineRow__segmentStatusFuture--${piece.tone}`]}`}
                                    style={{
                                        left: `${piece.left * 100}%`,
                                        width: `${piece.width * 100}%`
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                    <div className={styles.timelineRow__nowMarker} style={{ left: `${timeline.nowPosition * 100}%` }} aria-hidden />
                </div>
            </td>
        </tr>
    );
}
