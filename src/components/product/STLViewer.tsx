'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, useProgress, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';

export interface STLViewerProps {
  stlPath: string;
  color?: string;
}

function LoadingOverlay({ progress }: { progress: number }) {
  return (
    <Html center>
      <div style={{ textAlign: 'center', color: '#555', fontSize: '14px', fontFamily: 'sans-serif' }}>
        <style>{`
          @keyframes stl-spin {
            to { transform: rotate(360deg); }
          }
          .stl-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #ddd;
            border-top-color: #0ea5e9;
            border-radius: 50%;
            animation: stl-spin 0.8s linear infinite;
            margin: 0 auto 8px;
          }
          @media (prefers-reduced-motion: reduce) {
            .stl-spinner { animation: none; border-top-color: #0ea5e9; }
          }
        `}</style>
        <div className="stl-spinner" />
        <div>Loading model&hellip; {Math.round(progress)}%</div>
      </div>
    </Html>
  );
}

function ProgressTracker() {
  const { progress } = useProgress();
  return <LoadingOverlay progress={progress} />;
}

function STLModel({ stlPath, color }: { stlPath: string; color: string }) {
  const geometry = useLoader(STLLoader, stlPath);

  // Normalize the model to fit in a 2-unit bounding sphere regardless of STL units (mm, cm, in)
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? 2 / maxDim : 1;

  return (
    <Center>
      <mesh geometry={geometry} castShadow receiveShadow scale={scale}>
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
    </Center>
  );
}

function Scene({ stlPath, color, autoRotate }: { stlPath: string; color: string; autoRotate: boolean }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 7]} intensity={1.4} castShadow />
      <directionalLight position={[-5, -5, -5]} intensity={0.4} />
      <directionalLight position={[0, -10, 0]} intensity={0.2} />
      <Suspense fallback={<ProgressTracker />}>
        <STLModel stlPath={stlPath} color={color} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={8}
        autoRotate={autoRotate}
        autoRotateSpeed={1.5}
      />
    </>
  );
}

export function STLViewer({ stlPath, color = '#F8F8F8' }: STLViewerProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      <Canvas
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        shadows
      >
        <Scene stlPath={stlPath} color={color} autoRotate={!reducedMotion} />
      </Canvas>
    </div>
  );
}
