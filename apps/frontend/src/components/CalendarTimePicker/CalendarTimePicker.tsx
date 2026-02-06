import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./CalendarTimePicker.module.scss";

const hourOptions = Array.from({ length: 24 }, (_, i) => i);
const minuteOptions = [0, 15, 30, 45];
const durationOptions = [1, 2, 4, 8, 12, 24];

type CalendarTimePickerChange = {
    startAt: Date;
    endAt: Date;
    durationHours: number;
};

export default function CalendarTimePicker({
    startAt,
    endAt,
    durationHours,
    onChange
}: {
    startAt: Date;
    endAt: Date;
    durationHours: number;
    onChange: (next: CalendarTimePickerChange) => void;
}) {
    const [startHour, setStartHour] = useState(startAt.getHours());
    const [startMinute, setStartMinute] = useState(startAt.getMinutes() - (startAt.getMinutes() % 15));
    const [endHour, setEndHour] = useState(endAt.getHours());
    const [endMinute, setEndMinute] = useState(endAt.getMinutes() - (endAt.getMinutes() % 15));
    const [fromNow, setFromNow] = useState(false);

    useEffect(() => {
        setStartHour(startAt.getHours());
        setStartMinute(startAt.getMinutes() - (startAt.getMinutes() % 15));
    }, [startAt]);

    useEffect(() => {
        setEndHour(endAt.getHours());
        setEndMinute(endAt.getMinutes() - (endAt.getMinutes() % 15));
    }, [endAt]);

    const applyTime = (date: Date, hours: number, minutes: number) => {
        const next = new Date(date);
        next.setHours(hours, minutes, 0, 0);
        return next;
    };

    const updateRange = (nextStart: Date, nextEnd: Date) => {
        const nextDuration = Math.max(1, Math.round((nextEnd.getTime() - nextStart.getTime()) / (1000 * 60 * 60)));
        onChange({ startAt: nextStart, endAt: nextEnd, durationHours: nextDuration });
    };

    return (
        <div className={styles.calendarTimePicker}>
            <div className={styles.calendarTimePicker__grid}>
                {durationOptions.map((hours) => (
                    <button
                        type="button"
                        key={hours}
                        className={`${styles.calendarTimePicker__option} ${durationHours === hours ? styles.calendarTimePicker__option_selected : ""}`}
                        onClick={() => {
                            const nextEnd = new Date(startAt.getTime() + hours * 3600 * 1000);
                            onChange({ startAt, endAt: nextEnd, durationHours: hours });
                        }}
                    >
                        {hours}h
                    </button>
                ))}
            </div>
            <div className={styles.calendarTimePicker__row}>
                <div className={styles.calendarTimePicker__field}>
                    <label className={styles.calendarTimePicker__label}>Start</label>
                    <div className={styles.calendarTimePicker__timeRow}>
                        <div className={styles.calendarTimePicker__timeSelects}>
                            <select
                                className={styles.calendarTimePicker__select}
                                value={startHour}
                                onChange={(event) => {
                                    const nextHour = Number(event.target.value);
                                    setStartHour(nextHour);
                                    const nextStart = applyTime(startAt, nextHour, startMinute);
                                    const nextEnd = new Date(nextStart.getTime() + durationHours * 3600 * 1000);
                                    updateRange(nextStart, nextEnd);
                                }}
                            >
                                {hourOptions.map((h) => (
                                    <option key={h} value={h}>
                                        {String(h).padStart(2, "0")}
                                    </option>
                                ))}
                            </select>
                            <select
                                className={styles.calendarTimePicker__select}
                                value={startMinute}
                                onChange={(event) => {
                                    const nextMinute = Number(event.target.value);
                                    setStartMinute(nextMinute);
                                    const nextStart = applyTime(startAt, startHour, nextMinute);
                                    const nextEnd = new Date(nextStart.getTime() + durationHours * 3600 * 1000);
                                    updateRange(nextStart, nextEnd);
                                }}
                            >
                                {minuteOptions.map((m) => (
                                    <option key={m} value={m}>
                                        {String(m).padStart(2, "0")}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <label className={styles.calendarTimePicker__checkbox}>
                            <input
                                type="checkbox"
                                checked={fromNow}
                                onChange={(event) => {
                                    const next = event.target.checked;
                                    setFromNow(next);
                                    if (next) {
                                        const now = new Date();
                                        const roundedMinutes = now.getMinutes() - (now.getMinutes() % 15);
                                        const nextStart = applyTime(now, now.getHours(), roundedMinutes);
                                        const nextEnd = new Date(nextStart.getTime() + durationHours * 3600 * 1000);
                                        updateRange(nextStart, nextEnd);
                                    }
                                }}
                            />
                            <span>From now</span>
                        </label>
                    </div>
                    <DatePicker
                        selected={startAt}
                        onChange={(date) => {
                            if (!date) return;
                            const nextStart = applyTime(date, startHour, startMinute);
                            const nextEnd = new Date(nextStart.getTime() + durationHours * 3600 * 1000);
                            updateRange(nextStart, nextEnd);
                        }}
                        inline
                        dateFormat="P"
                    />
                </div>

                <div className={styles.calendarTimePicker__field}>
                    <label className={styles.calendarTimePicker__label}>End</label>
                    <div className={styles.calendarTimePicker__timeField}>
                        <div className={styles.calendarTimePicker__timeSelects}>
                            <select
                                className={styles.calendarTimePicker__select}
                                value={endHour}
                                onChange={(event) => {
                                    const nextHour = Number(event.target.value);
                                    setEndHour(nextHour);
                                    const nextEnd = applyTime(endAt, nextHour, endMinute);
                                    updateRange(startAt, nextEnd);
                                }}
                            >
                                {hourOptions.map((h) => (
                                    <option key={h} value={h}>
                                        {String(h).padStart(2, "0")}
                                    </option>
                                ))}
                            </select>
                            <select
                                className={styles.calendarTimePicker__select}
                                value={endMinute}
                                onChange={(event) => {
                                    const nextMinute = Number(event.target.value);
                                    setEndMinute(nextMinute);
                                    const nextEnd = applyTime(endAt, endHour, nextMinute);
                                    updateRange(startAt, nextEnd);
                                }}
                            >
                                {minuteOptions.map((m) => (
                                    <option key={m} value={m}>
                                        {String(m).padStart(2, "0")}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <DatePicker
                        selected={endAt}
                        onChange={(date) => {
                            if (!date) return;
                            const nextEnd = applyTime(date, endHour, endMinute);
                            updateRange(startAt, nextEnd);
                        }}
                        inline
                        dateFormat="P"
                    />
                </div>
            </div>
        </div>
    );
}
