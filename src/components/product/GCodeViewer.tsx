'use client';

import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useProgress, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface GCodeViewerProps {
  toolpathUrl: string;
  color?: string;
}

interface ToolpathLayer {
  z: number;
  verts: number[];
}

interface ToolpathJSON {
  layerCount: number;
  layers: ToolpathLayer[];
}

// ─── Loading overlay (matches STLViewer exactly) ────────────────────────────

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
        <div>Loading toolpath&hellip; {Math.round(progress)}%</div>
      </div>
    </Html>
  );
}

function ProgressTracker() {
  const { progress } = useProgress();
  return <LoadingOverlay progress={progress} />;
}

// ─── Scene inner component ───────────────────────────────────────────────────

interface ToolpathSceneProps {
  toolpath: ToolpathJSON | null;
  color: string;
  selectedLayer: number;
}

function ToolpathScene({ toolpath, color, selectedLayer }: ToolpathSceneProps) {
  // Store all materials in a ref so we can update color reactively
  const materialsRef = useRef<THREE.LineBasicMaterial[]>([]);

  // Build geometries and materials from toolpath data
  const { geometries, scale, offset } = useMemo(() => {
    if (!toolpath || toolpath.layers.length === 0) {
      return { geometries: [], scale: 1, offset: [0, 0, 0] as [number, number, number] };
    }

    // Compute bounding box across all verts and z heights
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (const layer of toolpath.layers) {
      const z = layer.z;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
      const verts = layer.verts;
      for (let i = 0; i < verts.length; i += 2) {
        const x = verts[i];
        const y = verts[i + 1];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const rangeZ = maxZ - minZ;
    const maxDim = Math.max(rangeX, rangeY, rangeZ) || 1;
    const computedScale = 2 / maxDim;

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cz = (minZ + maxZ) / 2;
    // In THREE.js Y-up: point (x, y) at layer z → Vector3(x, z, y)
    // So world center = (cx, cz, cy)
    const computedOffset: [number, number, number] = [-cx * computedScale, -cz * computedScale, -cy * computedScale];

    // Build BufferGeometry per layer
    const builtGeometries: THREE.BufferGeometry[] = [];

    for (const layer of toolpath.layers) {
      const { z, verts } = layer;
      // Each segment = 4 values in verts: [ax, ay, bx, by]
      // Each segment emits 2 3D points: (ax, z, ay) and (bx, z, by)
      const segmentCount = Math.floor(verts.length / 4);
      const positions = new Float32Array(segmentCount * 6); // 2 points × 3 coords per segment

      for (let s = 0; s < segmentCount; s++) {
        const ax = verts[s * 4];
        const ay = verts[s * 4 + 1];
        const bx = verts[s * 4 + 2];
        const by = verts[s * 4 + 3];
        const base = s * 6;
        positions[base]     = ax;
        positions[base + 1] = z;
        positions[base + 2] = ay;
        positions[base + 3] = bx;
        positions[base + 4] = z;
        positions[base + 5] = by;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      builtGeometries.push(geo);
    }

    return { geometries: builtGeometries, scale: computedScale, offset: computedOffset };
  }, [toolpath]);

  // Rebuild materials array when geometries change
  useEffect(() => {
    // Dispose old materials
    for (const mat of materialsRef.current) {
      mat.dispose();
    }
    materialsRef.current = geometries.map(
      () => new THREE.LineBasicMaterial({ color, linewidth: 1 })
    );
    // Cleanup on unmount or when geometries change
    return () => {
      for (const mat of materialsRef.current) {
        mat.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometries]);

  // Update material color when color prop changes
  useEffect(() => {
    for (const mat of materialsRef.current) {
      mat.color.set(color);
    }
  }, [color]);

  // Dispose geometries on unmount
  useEffect(() => {
    return () => {
      for (const geo of geometries) {
        geo.dispose();
      }
    };
  }, [geometries]);

  if (!toolpath || geometries.length === 0) return null;

  return (
    <group scale={scale} position={offset}>
      {geometries.map((geo, i) => {
        const mat = materialsRef.current[i];
        if (!mat) return null;
        return (
          <lineSegments
            key={i}
            geometry={geo}
            material={mat}
            visible={i < selectedLayer}
          />
        );
      })}
    </group>
  );
}

// ─── Wrapper scene with lights + controls ───────────────────────────────────

interface SceneWrapperProps {
  toolpath: ToolpathJSON | null;
  color: string;
  selectedLayer: number;
  autoRotate: boolean;
}

function SceneWrapper({ toolpath, color, selectedLayer, autoRotate }: SceneWrapperProps) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 10, 7]} intensity={1.2} />
      <Suspense fallback={<ProgressTracker />}>
        <ToolpathScene toolpath={toolpath} color={color} selectedLayer={selectedLayer} />
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

// ─── Public component ────────────────────────────────────────────────────────

export function GCodeViewer({ toolpathUrl, color = '#22d3ee' }: GCodeViewerProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [toolpath, setToolpath] = useState<ToolpathJSON | null>(null);
  const [layerCount, setLayerCount] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState(1);

  // Reduced-motion detection
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Fetch toolpath JSON
  useEffect(() => {
    if (!toolpathUrl) return;
    fetch(toolpathUrl)
      .then((r) => r.json())
      .then((data: ToolpathJSON) => {
        setToolpath(data);
        setLayerCount(data.layerCount);
        setSelectedLayer(data.layerCount); // start fully built
      })
      .catch(console.error);
  }, [toolpathUrl]);

  const shouldAutoRotate = autoRotate && !reducedMotion;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div
        style={{ width: '100%', height: '400px', position: 'relative' }}
        onPointerDown={() => setAutoRotate(false)}
      >
        <Canvas
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          camera={{ position: [0, 0, 5], fov: 45 }}
          shadows={false}
        >
          <SceneWrapper
            toolpath={toolpath}
            color={color}
            selectedLayer={selectedLayer}
            autoRotate={shouldAutoRotate}
          />
        </Canvas>
      </div>

      {layerCount > 0 && (
        <div style={{ padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            htmlFor="gcode-layer-slider"
            style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}
          >
            Layer{' '}
            <span style={{ fontVariantNumeric: 'tabular-nums', color: '#0f172a', fontWeight: 600 }}>
              {selectedLayer}
            </span>
            {' / '}
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{layerCount}</span>
          </label>
          <input
            id="gcode-layer-slider"
            type="range"
            min={1}
            max={layerCount || 1}
            value={selectedLayer}
            onChange={(e) => setSelectedLayer(Number(e.target.value))}
            style={{ width: '100%', accentColor: color || '#22d3ee', cursor: 'pointer' }}
            aria-label={`Show layers 1 through ${selectedLayer} of ${layerCount}`}
          />
        </div>
      )}
    </div>
  );
}
