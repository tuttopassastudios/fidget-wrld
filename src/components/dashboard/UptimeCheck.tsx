'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './UptimeCheck.module.css';

interface HealthCheck {
  name: string;
  url: string;
  status: 'up' | 'down' | 'slow';
  responseTime: number;
  statusCode: number | null;
}

interface HealthData {
  overall: 'healthy' | 'degraded' | 'slow';
  timestamp: string;
  checks: HealthCheck[];
}

const STATUS_CONFIG = {
  up: { label: 'Up', color: '#22c55e' },
  slow: { label: 'Slow', color: '#f59e0b' },
  down: { label: 'Down', color: '#ef4444' },
} as const;

const OVERALL_CONFIG = {
  healthy: { label: 'All Systems Operational', color: '#22c55e' },
  slow: { label: 'Performance Degraded', color: '#f59e0b' },
  degraded: { label: 'Partial Outage', color: '#ef4444' },
} as const;

export function UptimeCheck() {
  const { user } = useAuth();
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const runCheck = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/health', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // Health check failed
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  if (loading) {
    return <div className={styles.loading}>Running health checks&hellip;</div>;
  }

  if (!data) {
    return <div className={styles.empty}>Unable to run health checks</div>;
  }

  const overall = OVERALL_CONFIG[data.overall];

  return (
    <div className={styles.wrapper}>
      <div className={styles.overallBar} style={{ borderColor: overall.color }}>
        <span className={styles.dot} style={{ background: overall.color }} />
        <span className={styles.overallLabel}>{overall.label}</span>
        <span className={styles.timestamp}>
          {new Date(data.timestamp).toLocaleTimeString()}
        </span>
        <button type="button" className={styles.refreshBtn} onClick={runCheck} aria-label="Re-run health checks">
          ↻
        </button>
      </div>

      <div className={styles.checks}>
        {data.checks.map((check) => {
          const cfg = STATUS_CONFIG[check.status];
          return (
            <div key={check.name} className={styles.checkRow}>
              <span className={styles.dot} style={{ background: cfg.color }} />
              <span className={styles.checkName}>{check.name}</span>
              <span className={styles.checkStatus} style={{ color: cfg.color }}>
                {cfg.label}
              </span>
              <span className={styles.responseTime}>
                {check.responseTime > 0 ? `${check.responseTime}ms` : '—'}
              </span>
              {check.statusCode && (
                <span className={styles.statusCode}>{check.statusCode}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
