import React, { useEffect, useMemo, useState } from "react";
import { apiCreateNotification, apiMachines, apiReservations, apiRunTests, apiTests } from "../../services/api";
import { Machine, Reservation } from "../../types";
import styles from "./TestsPage.module.scss";
import MachineTable from "../../components/MachineTable/MachineTable";
import { useAuth } from "../../state/auth";
import { useNotifications } from "../../state/notifications";
import { useNavigate } from "react-router";

const SYSTEM_SETUP_TIME = 30;

type TestItem = {
    id: number;
    suite: string;
    name: string;
    description?: string;
    duration?: number;    // time in minutes
};

enum Step {
    Selection = "Test Selection",
    Machine = "Machine",
    Commit = "Commit to test"
}

const TestsPage: React.FC = () => {
    const [step, setStep] = useState<Step>(Step.Selection);
    const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
    const [openSuites, setOpenSuites] = useState<Set<string>>(new Set());
    const [machines, setMachines] = useState<Machine[]>([]);
    const [availableMachines, setAvailableMachines] = useState<Machine[]>([]);
    const [machineId, setMachineId] = useState<string>("");
    const [config, setConfig] = useState<string>("");
    const [tests, setTests] = useState<TestItem[]>([]);
    const [suites, setSuites] = useState<string[]>([]);
    const [visibleMachineCount, setVisibleMachineCount] = useState(10);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const navigate = useNavigate();
    const { token } = useAuth();
    const { addNotification, pushToast } = useNotifications();

    useEffect(() => {
        apiMachines("")
            .then((data) => {
                setMachines(data.machines);
                const available = data.machines.filter((m) => m.status === "available");
                setAvailableMachines(available);
                setVisibleMachineCount(5);
                if (available.length) {
                    setMachineId(String(available[0].id));
                    setConfig(available[0].tags?.[0] ?? "");
                }
            })
            .catch(() => {
                setMachines([]);
                setAvailableMachines([]);
            });

        apiTests()
            .then((data) => {
                setTests(data.tests);
                const uniqueSuites = Array.from(
                    new Set(data.tests.map((t) => t.suite).filter(Boolean))
                ).sort((a, b) => a.localeCompare(b));
                setSuites(uniqueSuites);
            })
            .catch(() => {
                setTests([]);
                setSuites([]);
            });
    }, []);

    useEffect(() => {
        if (!token) return;
        apiReservations(token)
            .then((data) => {
                const active = data.reservations.filter((r) => r.status === "active");
                setReservations(active);
            })
            .catch(() => {
                setReservations([]);
            });
    }, [token]);

    const currentMachine = useMemo(
        () => availableMachines.find((m) => String(m.id) === machineId) ?? availableMachines[0],
        [availableMachines, machineId]
    );

    const visibleMachines = useMemo(
        () => availableMachines.slice(0, visibleMachineCount),
        [availableMachines, visibleMachineCount]
    );

    const reservedMachines = useMemo(
        () => machines.filter((m) => reservations.some((r) => r.machine_id === m.id)),
        [machines, reservations]
    );

    const toggleTest = (testId: string) => {
        setSelectedTests((prev) => {
            const next = new Set(prev);
            if (next.has(testId)) next.delete(testId);
            else next.add(testId);
            return next;
        });
    };

    const toggleSuite = (suiteId: string) => {
        setOpenSuites((prev) => {
            const next = new Set(prev);
            if (next.has(suiteId)) next.delete(suiteId);
            else next.add(suiteId);
            return next;
        });
    };

    const testsBySuite = useMemo(() => {
        return suites.map((suite) => ({
            id: suite,
            title: suite,
            tests: tests.filter((t) => t.suite === suite)
        }));
    }, [suites, tests]);

    const totalSelectedCount = useMemo(() => selectedTests.size, [selectedTests]);
    const totalAvailableCount = useMemo(() => tests.length, [tests.length]);

    const totalDuration = useMemo(() => {
        const selected = tests.filter((t) => selectedTests.has(String(t.id)));
        const sum = selected.reduce((acc, t) => acc + (t.duration ?? 10), 0);
        return sum + SYSTEM_SETUP_TIME;
    }, [selectedTests, tests]);

    const onRun = async () => {
        const tests = Array.from(selectedTests);
        const machine = currentMachine?.name ?? "";
        const chosenConfig = config;
        const testIds = tests.map((id) => Number(id)).filter((id) => !Number.isNaN(id));

        if (token && machineId) {
            await apiRunTests(token, { machineId: Number(machineId), testIds, estimatedDuration: totalDuration });
            setMachines((prev) =>
                prev.map((m) => (String(m.id) === machineId ? { ...m, status: "busy" } : m))
            );
            setAvailableMachines((prev) => prev.filter((m) => String(m.id) !== machineId));
        }
        const message = `Queued ${tests.length} test(s)\nMachine: ${machine}\nConfig: ${chosenConfig}`;

        if (token) {
            const result = await apiCreateNotification(token, {
                title: "Tests queued",
                body: message,
                status: "info"
            });
            addNotification(result.notification);
            pushToast(result.notification);
        }
        alert(
            `Queued ${tests.length} test(s)\nMachine: ${machine}\nConfig: ${chosenConfig}`
        );
        navigate(`/machines/${machineId}`);
    };

    const onSelectMachine = (id: string) => {
        setMachineId(id);
        const m = machines.find((x) => String(x.id) === id);
        setConfig(m?.tags?.[0] ?? "");
    };

    const handleNext = () => {
        const currentIndex = Object.values(Step).indexOf(step);
        const nextIndex = Math.min(currentIndex + 1, Object.values(Step).length - 1);
        setStep(Object.values(Step)[nextIndex]);
    };

    const handleSubmit = async () => {
        await onRun();
    };

    const canNext = useMemo(() => {
        if (step === Step.Selection) return selectedTests.size > 0;
        if (step === Step.Machine) return !!machineId;
        if (step === Step.Commit) return config.trim().length > 0;
        return true;
    }, [step, selectedTests, machineId, config]);

    return (
        <div className={styles.testsPage}>
            <h2>Tests</h2>

            <div className={styles.testsPage__stepper}>
                {
                    Object.values(Step).map((label, index) => {
                        const modifierKey = index < Object.values(Step).indexOf(step) ? "testsPage__step--done" : index === Object.values(Step).indexOf(step) ? "testsPage__step--active" : "";
                        const stepClass = `${styles.testsPage__step} ${modifierKey ? styles[modifierKey] : ""}`;
                        return (
                            <div key={label} className={stepClass}>
                                <span>{index + 1}</span>
                                {label}
                            </div>
                        );
                    })
                }
            </div>

            {step === Step.Selection && (
                <div className={styles.testsPage__panel}>
                    <h3>Choose tests to run:</h3>
                    <div className={styles.testsPage__selectAll}>
                        <span>Select all:</span>
                        <input
                            type="checkbox"
                            checked={selectedTests.size === tests.length}
                            onChange={() => {
                                if (selectedTests.size === tests.length) {
                                    setSelectedTests(new Set());
                                } else {
                                    setSelectedTests(new Set(tests.map((t) => String(t.id))));
                                }
                            }}
                        />
                    </div>

                    <ol className={styles.testsPage__suites}>
                        {testsBySuite.map((theme) => {
                            const open = openSuites.has(theme.id);

                            const selectedCount = theme.tests.filter((t) => selectedTests.has(String(t.id))).length;
                            const hasSelected = selectedCount > 0;

                            return (
                                <li key={theme.id}>
                                    <button
                                        type="button"
                                        className={[
                                            styles.testsPage__suite,
                                            hasSelected ? styles.testsPage__suiteHasSelected : "",
                                        ].join(" ")}
                                        onClick={() => toggleSuite(theme.id)}
                                    >
                                        <span className={styles.testsPage__suiteTitle}>
                                            {theme.title} <span className={styles.testsPage__suiteCount}>({selectedCount}/{theme.tests.length})</span>
                                        </span>
                                        <span className={`${styles.testsPage__suiteArrow} ${open ? styles.testsPage__suiteArrowOpen : ""}`}>
                                            ▾
                                        </span>
                                    </button>

                                    {open && (
                                        <>
                                            <ul className={styles.testsPage__caseList}>
                                                {theme.tests.map((t) => (
                                                    <li key={t.id}>
                                                        <label className={styles.testsPage__itemLabel}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedTests.has(String(t.id))}
                                                                onChange={() => toggleTest(String(t.id))}
                                                            />
                                                            <span className={styles.testsPage__itemText}>
                                                                <span className={styles.testsPage__itemName}>{t.name}</span>
                                                                {t.description && (
                                                                    <span className={styles.testsPage__itemDesc}>({t.description})</span>
                                                                )}
                                                            </span>
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                    <div className={styles.testsPage__suiteTotal}>
                        Total selected: {totalSelectedCount} / {totalAvailableCount}
                    </div>
                </div>
            )}

            {step === Step.Machine && (
                <div className={styles.testsPage__panel}>
                    <h3>Select target machine:</h3>
                    {reservedMachines.length !== 0 && (
                        <>
                            <p>Reserved by you:</p>
                            <MachineTable
                                machines={reservedMachines}
                                selectable
                                selectedId={machineId}
                                onSelect={onSelectMachine}
                            />
                        </>
                    )}
                    <div className={styles.testsPage__form}>
                        <p>Available machines:</p>
                        <div className={styles.testsPage__field}>
                            <MachineTable
                                machines={visibleMachines}
                                selectable
                                selectedId={machineId}
                                onSelect={onSelectMachine}
                            />
                            {visibleMachineCount < availableMachines.length && (
                                <button
                                    type="button"
                                    className={styles.testsPage__loadMore}
                                    onClick={() => setVisibleMachineCount((prev) => Math.min(prev + 5, availableMachines.length))}
                                >
                                    Load more ...
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {step === Step.Commit && (
                <div className={styles.testsPage__panel}>
                    <p>Choose commit to test :</p>
                    <label className={styles.testsPage__commitLabel}>
                        Commit
                        <select className={styles.testsPage__commitSelect} value={config} onChange={(e) => setConfig(e.target.value)}>
                            <option value="">Use latest</option>
                            <option value="abc123">abc123</option>
                            <option value="def456">def456</option>
                        </select>
                    </label>
                    <p>Estimated total duration: {totalDuration} minutes</p>
                    <p>End time: {new Date(Date.now() + totalDuration * 60000).toLocaleString()}</p>
                </div>
            )}

            <footer className={styles.testsPage__footer}>
                <button className={styles.testsPage__footer__secondary} onClick={() => setStep(Step.Selection)}>
                    Cancel
                </button>
                <div className={styles.testsPage__footer__actions}>
                    <button
                        className={styles.testsPage__footer__secondary}
                        onClick={() => {
                            const currentIndex = Object.values(Step).indexOf(step);
                            const prevIndex = Math.max(currentIndex - 1, 0);
                            setStep(Object.values(Step)[prevIndex]);
                        }}
                        disabled={step === Step.Selection}
                    >
                        Back
                    </button>
                    {Object.values(Step).indexOf(step) < Object.values(Step).indexOf(Step.Commit) ? (
                        <button className={styles.testsPage__footer__primary} onClick={handleNext} disabled={!canNext}>
                            Next
                        </button>
                    ) : (
                        <button className={styles.testsPage__footer__primary} onClick={handleSubmit}>
                            Submit
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default TestsPage;