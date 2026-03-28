import styles from './TopProducts.module.css';

interface TopProduct {
  name: string;
  revenue: number;
  unitsSold: number;
}

interface TopProductsProps {
  data: TopProduct[];
}

export function TopProducts({ data }: TopProductsProps) {
  if (data.length === 0) {
    return <div className={styles.empty}>No product data yet</div>;
  }

  const maxRevenue = data[0]?.revenue || 1;

  return (
    <div className={styles.list}>
      {data.map((product, i) => (
        <div key={product.name} className={styles.row}>
          <span className={styles.rank}>{i + 1}</span>
          <div className={styles.info}>
            <span className={styles.name}>{product.name}</span>
            <div className={styles.bar}>
              <div
                className={styles.barFill}
                style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
              />
            </div>
          </div>
          <div className={styles.metrics}>
            <span className={styles.revenue}>
              ${product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className={styles.units}>{product.unitsSold} sold</span>
          </div>
        </div>
      ))}
    </div>
  );
}
