import styles from './OrderFunnel.module.css';

interface FunnelStage {
  stage: string;
  count: number;
}

interface OrderFunnelProps {
  data: FunnelStage[];
}

const STAGE_COLORS: Record<string, string> = {
  Placed: '#46C8DC',
  Processing: '#2FA4B5',
  Shipped: '#1A7F8E',
  Delivered: '#146E78',
};

export function OrderFunnel({ data }: OrderFunnelProps) {
  if (data.length === 0 || data[0].count === 0) {
    return <div className={styles.empty}>No order data</div>;
  }

  const maxCount = data[0].count;

  return (
    <div className={styles.funnel}>
      {data.map((stage, i) => {
        const widthPct = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
        const dropoff = i > 0 ? data[i - 1].count - stage.count : 0;
        const dropoffPct = i > 0 && data[i - 1].count > 0
          ? Math.round((dropoff / data[i - 1].count) * 100)
          : 0;

        return (
          <div key={stage.stage} className={styles.stage}>
            <div className={styles.labelRow}>
              <span className={styles.stageName}>{stage.stage}</span>
              <span className={styles.stageCount}>{stage.count}</span>
              {i > 0 && dropoff > 0 && (
                <span className={styles.dropoff}>-{dropoff} ({dropoffPct}%)</span>
              )}
            </div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: STAGE_COLORS[stage.stage] || '#46C8DC',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
