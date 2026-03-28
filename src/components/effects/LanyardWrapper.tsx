'use client';

import dynamic from 'next/dynamic';

const Lanyard = dynamic(() => import('./Lanyard'), { ssr: false });

export function LanyardWrapper() {
  return <Lanyard position={[0, 0, 30]} gravity={[0, -40, 0]} fov={20} transparent />;
}
