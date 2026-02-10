import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MultiDropDown.module.scss";

type MultiDropDownProps = {
    label: string;
    options: string[];
    selected: string[];
    sortMode?: "alpha" | "none";
    onChange: (next: string[]) => void;
};

const MultiDropDown: React.FC<MultiDropDownProps> = ({
    label,
    options,
    selected,
    sortMode = "alpha",
    onChange
}) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const safeOptions = useMemo(() => {
        const next = options.filter(Boolean);
        if (sortMode === "none") return next;
        return next.sort((a, b) => a.localeCompare(b));
    }, [options, sortMode]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const toggleValue = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter((item) => item !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const clearAll = () => onChange([]);

    return (
        <div className={styles.multiDropDown} ref={containerRef}>
            <button
                type="button"
                className={styles.multiDropDown__trigger}
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
            >
                <div className={selected.length > 0 ? styles.multiDropDown__selected : ""}>
                    <span>{label}</span>
                    <span>▾</span>
                </div>
            </button>
            {open && (
                <div className={styles.multiDropDown__menu}>
                    <div className={styles.multiDropDown__menuHeader}>
                        <span>Filter</span>
                        <button type="button" onClick={clearAll} className={styles.multiDropDown__clear}>
                            Clear
                        </button>
                    </div>
                    <ul className={styles.multiDropDown__list}>
                        {safeOptions.length === 0 && (
                            <li className={styles.multiDropDown__empty}>No options</li>
                        )}
                        {safeOptions.map((option) => (
                            <li key={option}>
                                <label className={styles.multiDropDown__item}>
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(option)}
                                        onChange={() => toggleValue(option)}
                                    />
                                    <span>{option}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MultiDropDown;
