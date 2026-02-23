import { useMemo } from "react";
import { Machine, Reservation, TestRun } from "../../types";
import { STATUS_CONFIG } from "../../constants/status";
import styles from "./TimelineRow.module.scss";
import { Link } from "react-router-dom";

type TimelineRowProps = {
    machine: Machine;
    reservations: Reservation[];
    testRuns: TestRun[];
};

const START_OFFSET_HOURS = -1;
const END_OFFSET_HOURS = 6;
const TOTAL_SEGMENTS = END_OFFSET_HOURS - START_OFFSET_HOURS;
const HOUR_MS = 60 * 60 * 1000;

const formatHour = (date: Date) =>
    date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
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
    statusColor: keyof typeof STATUS_CONFIG;
};

const testRunToStatus = (run: TestRun): keyof typeof STATUS_CONFIG => {
    if (run.status === "cancelled") return "cancelled";
    return "busy";
};

export default function TimelineRow({ machine, reservations, testRuns }: TimelineRowProps) {
    const timeline = useMemo(() => {
        const now = new Date();
        const alignedNow = new Date(now);
        alignedNow.setMinutes(0, 0, 0);
        const windowStart = new Date(alignedNow);
        windowStart.setHours(alignedNow.getHours() + START_OFFSET_HOURS, 0, 0, 0);
        const windowStartMs = windowStart.getTime();
        const windowEndMs = windowStartMs + TOTAL_SEGMENTS * HOUR_MS;

        const labels = Array.from({ length: TOTAL_SEGMENTS + 1 }, (_, index) => {
            const point = new Date(windowStartMs + index * HOUR_MS);
            return formatHour(point);
        });

        const defaultStatusInterval: Interval = {
            startMs: now.getTime(),
            endMs: windowEndMs,
            statusColor: machine.status
        };

        const reservationIntervals: Interval[] = reservations.flatMap((reservation) => {
                const start = parseDateSafe(reservation.start_at);
                const end = parseDateSafe(reservation.end_at);
                if (!start || !end) return [];
                return [{
                    startMs: start.getTime(),
                    endMs: end.getTime(),
                    statusColor: reservation.status
                } satisfies Interval];
            });

        const testRunIntervals: Interval[] = testRuns.flatMap((run) => {
                const start = parseDateSafe(run.started_at);
                if (!start) return [];
                const finished = parseDateSafe(run.finished_at);
                return [{
                    startMs: start.getTime(),
                    endMs: finished ? finished.getTime() : windowEndMs,
                    statusColor: testRunToStatus(run)
                } satisfies Interval];
            });

        const allIntervals = [defaultStatusInterval, ...reservationIntervals, ...testRunIntervals];

        const segments = Array.from({ length: TOTAL_SEGMENTS }, (_, index) => {
            const segmentStartMs = windowStartMs + index * HOUR_MS;
            const segmentEndMs = segmentStartMs + HOUR_MS;

            const pastWidth = clamp01((Math.min(now.getTime(), segmentEndMs) - segmentStartMs) / HOUR_MS);

            const overlays = allIntervals
                .map((interval, overlayIndex) => {
                    const overlapStart = Math.max(segmentStartMs, interval.startMs);
                    const overlapEnd = Math.min(segmentEndMs, interval.endMs);
                    if (overlapEnd <= overlapStart) return null;

                    return {
                        key: `${index}-${overlayIndex}-${interval.statusColor}`,
                        left: clamp01((overlapStart - segmentStartMs) / HOUR_MS),
                        width: clamp01((overlapEnd - overlapStart) / HOUR_MS),
                        statusColor: interval.statusColor
                    };
                })
                .filter((overlay): overlay is { key: string; left: number; width: number; statusColor: keyof typeof STATUS_CONFIG } => Boolean(overlay));

            return {
                pastWidth,
                overlays
            };
        });

        const nowOffsetHours = (now.getTime() - windowStartMs) / HOUR_MS;
        const nowPosition = clamp01(nowOffsetHours / TOTAL_SEGMENTS);

        return {
            labels,
            segments,
            nowPosition
        };
    }, [machine, reservations, testRuns]);

    const statusConfig = STATUS_CONFIG[machine.status] ?? STATUS_CONFIG.offline;

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
                <div className={styles.timelineRow__labels}>
                    {timeline.labels.map((label, index) => (
                        <span key={`${machine.id}-${label || "empty"}-${index}`} className={styles.timelineRow__label}>
                            {label}
                        </span>
                    ))}
                </div>
                <div className={styles.timelineRow__track} aria-label={`Machine status timeline: ${statusConfig.label}`}>
                    {timeline.segments.map((segment, index) => (
                        <div
                            key={`${machine.id}-segment-${index}`}
                            className={styles.timelineRow__segment}
                        >
                            {segment.pastWidth > 0 && (
                                <span
                                    className={styles.timelineRow__segmentPast}
                                    style={{ width: `${segment.pastWidth * 100}%` }}
                                />
                            )}
                            {segment.overlays.map((overlay) => (
                                <span
                                    key={overlay.key}
                                    className={`${styles.timelineRow__segmentStatus} ${styles[`timelineRow__segmentStatus--${STATUS_CONFIG[overlay.statusColor].color}`]}`}
                                    style={{
                                        left: `${overlay.left * 100}%`,
                                        width: `${overlay.width * 100}%`
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
