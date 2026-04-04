'use client';

import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, useProgress, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';

export interface STLViewerProps {
  stlPath: string;
  color?: string;
  materialType?: 'standard' | 'translucent' | 'gradient';
}

function LoadingOverlay({ progress }: { progress: number }) {
  return (
    <Html center>
      <div style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', fontFamily: 'sans-serif' }}>
        <style>{`
          @keyframes stl-spin {
            to { transform: rotate(360deg); }
          }
          .stl-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #333;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: stl-spin 0.8s linear infinite;
            margin: 0 auto 8px;
          }
          @media (prefers-reduced-motion: reduce) {
            .stl-spinner { animation: none; border-top-color: #3b82f6; }
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

function STLModel({
  stlPath,
  color,
  materialType,
}: {
  stlPath: string;
  color: string;
  materialType: 'standard' | 'translucent' | 'gradient';
}) {
  const geometry = useLoader(STLLoader, stlPath);

  // Normalize to fit in a 2-unit bounding sphere
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? 2 / maxDim : 1;

  // Build vertex colors for gradient mode (pink bottom → blue top along Y after centering)
  const gradientGeometry = useMemo(() => {
    if (materialType !== 'gradient') return null;
    const geo = geometry.clone();
    geo.computeBoundingBox();
    const yMin = geo.boundingBox!.min.y;
    const yMax = geo.boundingBox!.max.y;
    const positions = geo.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    const colorBottom = new THREE.Color('#EC4899');
    const colorTop    = new THREE.Color('#3B82F6');
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const t = yMax > yMin ? (y - yMin) / (yMax - yMin) : 0.5;
      const c = colorBottom.clone().lerp(colorTop, t);
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [geometry, materialType]);

  if (materialType === 'gradient' && gradientGeometry) {
    return (
      <Center>
        <mesh geometry={gradientGeometry} castShadow receiveShadow scale={scale}>
          <meshStandardMaterial vertexColors roughness={0.65} metalness={0} />
        </mesh>
      </Center>
    );
  }

  if (materialType === 'translucent') {
    return (
      <Center>
        <mesh geometry={geometry} scale={scale}>
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.78}
            roughness={0.05}
            metalness={0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Center>
    );
  }

  return (
    <Center>
      <mesh geometry={geometry} castShadow receiveShadow scale={scale}>
        <meshStandardMaterial color={color} roughness={0.65} metalness={0} />
      </mesh>
    </Center>
  );
}

function Scene({
  stlPath,
  color,
  materialType,
  autoRotate,
}: {
  stlPath: string;
  color: string;
  materialType: 'standard' | 'translucent' | 'gradient';
  autoRotate: boolean;
}) {
  return (
    <>
      {/* Studio four-point lighting rig against dark background */}
      <ambientLight intensity={0.15} />
      {/* Key — bright, front-right-above */}
      <directionalLight position={[4, 6, 3]}  intensity={3.8} castShadow color="#ffffff" />
      {/* Fill — cool, left */}
      <directionalLight position={[-5, 2, 2]} intensity={1.4}            color="#c8d8ff" />
      {/* Rim — behind-top, separates model from dark bg */}
      <directionalLight position={[0, 4, -5]} intensity={2.6}            color="#ffffff" />
      {/* Top fill — prevents top surfaces going dark */}
      <directionalLight position={[0, 8, 0]}  intensity={1.0}            color="#ffffff" />

      <Suspense fallback={<ProgressTracker />}>
        <STLModel stlPath={stlPath} color={color} materialType={materialType} />
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

export function STLViewer({ stlPath, color = '#3B82F6', materialType = 'standard' }: STLViewerProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div style={{ width: '100%', height: '400px', position: 'relative', background: '#0f0f0f', borderRadius: '12px', overflow: 'hidden' }}>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => { gl.setClearColor('#0f0f0f'); }}
      >
        <Scene stlPath={stlPath} color={color} materialType={materialType} autoRotate={!reducedMotion} />
      </Canvas>
    </div>
  );
}
