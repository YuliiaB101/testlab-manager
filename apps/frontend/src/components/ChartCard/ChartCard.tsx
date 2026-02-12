import React from 'react';
import styles from './ChartCard.module.scss';

type KPI = {
    label: string;
    value: React.ReactNode;
    hint?: string;
};

export type ChartCardProps = {
    title: string;
    subtitle?: string;
    kpi?: KPI;
    actions?: React.ReactNode;
    loading?: boolean;
    empty?: boolean;
    emptyText?: string;
    children: React.ReactNode;
};

const ChartCard: React.FC<ChartCardProps> = ({
    title,
    subtitle,
    kpi,
    actions,
    loading = false,
    empty = false,
    emptyText = "No data to display.",
    children,
}) => {
    return (
        <section className={styles.chartCard}>
            <header className={styles.header}>
                <div className={styles.headLeft}>
                    <h3 className={styles.title}>{title}</h3>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>

                <div className={styles.headRight}>
                    {actions && <div className={styles.actions}>{actions}</div>}

                    {kpi && (
                        <div className={styles.kpi} title={kpi.hint ?? ""}>
                            <div className={styles.kpiLabel}>{kpi.label}</div>
                            <div className={styles.kpiValue}>{kpi.value}</div>
                        </div>
                    )}
                </div>
            </header>

            <div className={styles.content}>
                {loading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : empty ? (
                    <div className={styles.empty}>{emptyText}</div>
                ) : (
                    children
                )}
            </div>
        </section>
    );
};

export default ChartCard;