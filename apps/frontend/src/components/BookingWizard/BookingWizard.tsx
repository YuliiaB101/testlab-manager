import React, { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./BookingWizard.module.scss";

const durationOptions = [1, 2, 4, 8, 12, 24, 48];
const toolOptions = ["Docker", "Chrome", "Node.js LTS", "Python 3.12", "CUDA 12", "Android SDK"];
const flagOptions = ["Enable debug ports", "Clear temp before start", "Allow remote desktop", "Disable auto-updates"];
const osPresets = ["Windows 11 23H2", "Windows 10 22H2", "Ubuntu 22.04", "Ubuntu 20.04", "macOS Sonoma"];

export interface BookingPayload {
  durationHours: number;
  sessionName: string;
  setupOptions?: { osVersion?: string; tools?: string[]; flags?: string[] };
  testPlan?: string;
}

export default function BookingWizard({
  onClose,
  onConfirm,
  machineName
}: {
  onClose: () => void;
  onConfirm: (payload: BookingPayload) => Promise<void>;
  machineName: string;
}) {
  const [step, setStep] = useState(0);
  const [durationHours, setDurationHours] = useState(2);
  const [startAt, setStartAt] = useState<Date>(() => new Date());
  const [endAt, setEndAt] = useState<Date>(() => new Date(Date.now() + 2 * 3600 * 1000));
  const [sessionName, setSessionName] = useState("");
  const [osVersion, setOsVersion] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [testPlan, setTestPlan] = useState("");
  const [loading, setLoading] = useState(false);

  // react-datepicker types can sometimes confuse TS setup; cast to a generic component type
  const DatePickerAny = DatePicker as unknown as React.ComponentType<any>;

  const canNext = useMemo(() => {
    if (step === 0) return !!startAt && !!endAt && endAt.getTime() > startAt.getTime();
    if (step === 1) return sessionName.trim().length >= 2;
    return true;
  }, [step, durationHours, sessionName, startAt, endAt]);

  const toggle = (value: string, list: string[], setList: (next: string[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    await onConfirm({
      durationHours,
      sessionName,
      setupOptions: {
        osVersion: osVersion || undefined,
        tools,
        flags
      },
      testPlan: testPlan || undefined
    });
    setLoading(false);
  };

  const handleNext = () => {
    if (step === 0) {
      const hours = Math.max(1, Math.round((endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60)));
      setDurationHours(hours);
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  return (
    <div className={styles.bookingWizard__overlay}>
      <div className={styles.bookingWizard__modal}>
        <header className={styles.bookingWizard__header}>
          <div>
            <div className={styles.bookingWizard__title}>Lock {machineName}</div>
            <div className={styles.bookingWizard__subtitle}>Configure the session in a few steps.</div>
          </div>
          <button className={styles.bookingWizard__close} onClick={onClose}>
            Close
          </button>
        </header>

        <div className={styles.bookingWizard__stepper}>
          {[
            "Duration",
            "Session",
            "Setup",
            "Test",
            "Review"
          ].map((label, index) => (
            <div key={label} className={`${styles.step} ${index <= step ? styles.active : ""}`}>
              <span>{index + 1}</span>
              {label}
            </div>
          ))}
        </div>

        <div className={styles.bookingWizard__content}>
          {step === 0 && (
            <div className={styles.bookingWizard__panel}>
              <h3>How long do you need the machine?</h3>
                <div className={styles.bookingWizard__calendarRow}>
                  <div>
                    <label className={styles.bookingWizard__label}>Start</label>
                    <DatePickerAny
                      selected={startAt}
                      onChange={(date) => date && setStartAt(date)}
                      showTimeSelect
                      inline
                      timeIntervals={15}
                      dateFormat="Pp"
                    />
                  </div>

                  <div>
                    <label className={styles.bookingWizard__label}>End</label>
                    <DatePickerAny
                      selected={endAt}
                      onChange={(date) => date && setEndAt(date)}
                      showTimeSelect
                      inline
                      timeIntervals={15}
                      dateFormat="Pp"
                    />
                  </div>
                </div>
                <div className={styles.bookingWizard__help}>
                  Duration: {Math.max(1, Math.round((endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60)))}h
                </div>
            </div>
          )}

          {step === 1 && (
            <div className={styles.bookingWizard__panel}>
              <h3>Name your session</h3>
              <input
                className={styles.bookingWizard__input}
                placeholder="e.g. Android smoke run"
                value={sessionName}
                onChange={(event) => setSessionName(event.target.value)}
              />
              <p className={styles.bookingWizard__help}>This will appear in reservations and notifications.</p>
            </div>
          )}

          {step === 2 && (
            <div className={styles.bookingWizard__panel}>
              <h3>Setup options</h3>
              <label className={styles.bookingWizard__label}>OS preset</label>
              <select className={styles.bookingWizard__select} value={osVersion} onChange={(event) => setOsVersion(event.target.value)}>
                <option value="">Keep current OS</option>
                {osPresets.map((os) => (
                  <option key={os} value={os}>{os}</option>
                ))}
              </select>
              <label className={styles.bookingWizard__label}>Tools</label>
              <div className={styles.bookingWizard__badges}>
                {toolOptions.map((tool) => (
                  <button
                    type="button"
                    key={tool}
                    className={`${styles.bookingWizard__badge} ${tools.includes(tool) ? styles.bookingWizard__badge_selected : ""}`}
                    onClick={() => toggle(tool, tools, setTools)}
                  >
                    {tool}
                  </button>
                ))}
              </div>
              <label className={styles.bookingWizard__label}>Flags</label>
              <div className={styles.bookingWizard__badges}>
                {flagOptions.map((flag) => (
                  <button
                    type="button"
                    key={flag}
                    className={`${styles.bookingWizard__badge} ${flags.includes(flag) ? styles.bookingWizard__badge_selected : ""}`}
                    onClick={() => toggle(flag, flags, setFlags)}
                  >
                    {flag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.bookingWizard__panel}>
              <h3>Test plan</h3>
              <textarea
                className={styles.bookingWizard__textarea}
                placeholder="Describe the validation or job to run..."
                value={testPlan}
                onChange={(event) => setTestPlan(event.target.value)}
              />
            </div>
          )}

          {step === 4 && (
            <div className={styles.bookingWizard__panel}>
              <h3>Review</h3>
              <div className={styles.bookingWizard__review}>
                <div><strong>Duration:</strong> {durationHours} hours</div>
                <div><strong>Session:</strong> {sessionName}</div>
                <div><strong>OS:</strong> {osVersion || "Keep current"}</div>
                <div><strong>Tools:</strong> {tools.length ? tools.join(", ") : "None"}</div>
                <div><strong>Flags:</strong> {flags.length ? flags.join(", ") : "None"}</div>
                <div><strong>Test plan:</strong> {testPlan || "Not provided"}</div>
              </div>
            </div>
          )}
        </div>

        <footer className={styles.bookingWizard__footer}>
          <button className={styles.bookingWizard__secondary} onClick={onClose}>
            Cancel
          </button>
          <div className={styles.bookingWizard__actions}>
            <button
              className={styles.bookingWizard__secondary}
              onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
              disabled={step === 0}
            >
              Back
            </button>
            {step < 4 ? (
              <button className={styles.bookingWizard__primary} onClick={handleNext} disabled={!canNext}>
                Next
              </button>
            ) : (
              <button className={styles.bookingWizard__primary} onClick={handleSubmit} disabled={loading}>
                {loading ? "Locking..." : "Lock machine"}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
