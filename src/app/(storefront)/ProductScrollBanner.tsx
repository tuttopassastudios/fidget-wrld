'use client';
import { useRef } from 'react';
import { useScroll, useTransform, motion, type MotionValue } from 'motion/react';
import Image from 'next/image';
import styles from './ProductScrollBanner.module.css';

type Item = { slug: string; color: string };

const TRACK_1: Item[] = [
  { slug: 'rocktopus',               color: 'blue'              },
  { slug: 'cute-octopus',            color: 'silver'            },
  { slug: 'cute-snakey',             color: 'pink-blue-gradient'},
  { slug: 'flex-slug',               color: 'blue'              },
  { slug: 'octopus-long-tentacles',  color: 'silver'            },
  { slug: 'click-clack-swoosh',      color: 'pink-blue-gradient'},
  { slug: 'flexi-mecha-dragon',      color: 'blue'              },
  { slug: 'infinity-cube',           color: 'silver'            },
  { slug: 'spiral-cone-fidget',      color: 'pink-blue-gradient'},
];

const TRACK_2: Item[] = [
  { slug: 'cute-octopus',            color: 'blue'              },
  { slug: 'cute-snakey',             color: 'silver'            },
  { slug: 'rocktopus',               color: 'pink-blue-gradient'},
  { slug: 'infinity-cube',           color: 'blue'              },
  { slug: 'flex-slug',               color: 'pink-blue-gradient'},
  { slug: 'flexi-mecha-dragon',      color: 'silver'            },
  { slug: 'click-clack-swoosh',      color: 'blue'              },
  { slug: 'octopus-long-tentacles',  color: 'pink-blue-gradient'},
  { slug: 'spiral-cone-fidget',      color: 'blue'              },
];

const TRACK_3: Item[] = [
  { slug: 'flex-slug',               color: 'silver'            },
  { slug: 'rocktopus',               color: 'dark-purple'       },
  { slug: 'cute-snakey',             color: 'blue'              },
  { slug: 'octopus-long-tentacles',  color: 'dark-purple'       },
  { slug: 'cute-octopus',            color: 'pink-blue-gradient'},
  { slug: 'flexi-mecha-dragon',      color: 'dark-purple'       },
  { slug: 'infinity-cube',           color: 'pink-blue-gradient'},
  { slug: 'click-clack-swoosh',      color: 'silver'            },
  { slug: 'spiral-cone-fidget',      color: 'dark-purple'       },
];

function Track({ items, x }: { items: Item[]; x: MotionValue<string> }) {
  // Duplicate for seamless visual fill
  const doubled = [...items, ...items];
  return (
    <div className={styles.trackWrap} aria-hidden="true">
      <motion.ul className={styles.track} style={{ x }}>
        {doubled.map((item, i) => (
          <li key={i} className={styles.item}>
            <Image
              src={`/images/products/${item.slug}-${item.color}.jpg`}
              alt=""
              width={220}
              height={220}
              className={styles.img}
              draggable={false}
            />
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

export function ProductScrollBanner() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Track 1 → left (slow)
  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-28%']);
  // Track 2 → right (medium)
  const x2 = useTransform(scrollYProgress, [0, 1], ['-14%', '14%']);
  // Track 3 → left (faster)
  const x3 = useTransform(scrollYProgress, [0, 1], ['0%', '-38%']);

  return (
    <section ref={ref} className={styles.banner}>
      <div className={styles.fade} />
      <Track items={TRACK_1} x={x1} />
      <Track items={TRACK_2} x={x2} />
      <Track items={TRACK_3} x={x3} />
      <div className={styles.fadeRight} />
    </section>
  );
}
