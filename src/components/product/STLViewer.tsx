'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, useProgress, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';

export interface STLViewerProps {
  stlPath: string;
  color?: string;
  materialType?: 'standard' | 'translucent' | 'gradient';
}

// ---------------------------------------------------------------------------
// PLA layer-line GLSL shader
// Simulates the horizontal banding of FDM 3D printing.
// Lights are specified in world space; viewMatrix (Three.js built-in) rotates
// them to view space so they stay fixed as the user orbits the model.
// ---------------------------------------------------------------------------

const PLA_VERT = /* glsl */ `
varying vec3 vObjectPos;   // object-space position for layer-line Z lookup
varying vec3 vViewNormal;  // view-space normal for lighting

void main() {
  vObjectPos  = position;
  vViewNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const PLA_FRAG = /* glsl */ `
// Three.js provides viewMatrix automatically in ShaderMaterial
uniform mat4 viewMatrix;

uniform vec3  u_baseColor;
uniform float u_layerScale; // ~60 — controls how many layer lines visible
uniform float u_seamDark;   // 0.76 — darkest point at a layer seam
uniform int   u_isGradient; // 1 = pink→blue gradient, 0 = solid
uniform vec3  u_colorBottom;
uniform vec3  u_colorTop;
uniform float u_yMin;       // geometry Y bounds for gradient normalisation
uniform float u_yMax;

varying vec3 vObjectPos;
varying vec3 vViewNormal;

// Diffuse contribution from a world-space light direction
float diffuse(vec3 n, vec3 worldDir, float intensity) {
  vec3 viewDir = normalize(mat3(viewMatrix) * normalize(worldDir));
  return max(dot(n, viewDir), 0.0) * intensity;
}

void main() {
  vec3 n = normalize(vViewNormal);

  // --- PLA layer-line factor ---
  // fract of (Z × scale) gives a sawtooth 0→1 per layer.
  // The seam (value near 0) is darkened; the body (0.35+) is full brightness.
  float phase  = fract(vObjectPos.z * u_layerScale);
  float layerF = mix(u_seamDark, 1.0, smoothstep(0.0, 0.35, phase));

  // --- Base colour ---
  vec3 color;
  if (u_isGradient == 1) {
    float t = (u_yMax > u_yMin)
      ? clamp((vObjectPos.y - u_yMin) / (u_yMax - u_yMin), 0.0, 1.0)
      : 0.5;
    color = mix(u_colorBottom, u_colorTop, t);
  } else {
    color = u_baseColor;
  }
  color *= layerF;

  // --- Studio 4-light rig (world-space directions, fixed to scene) ---
  float ambient = 0.12;
  float d_key   = diffuse(n, vec3( 4.0,  6.0,  3.0),  0.54); // key
  float d_fill  = diffuse(n, vec3(-5.0,  2.0,  2.0),  0.22); // fill
  float d_rim   = diffuse(n, vec3( 0.0,  4.0, -5.0),  0.22); // rim
  float d_top   = diffuse(n, vec3( 0.0,  8.0,  0.0),  0.12); // top

  color *= (ambient + d_key + d_fill + d_rim + d_top);

  gl_FragColor = vec4(color, 1.0);
}
`;

// ---------------------------------------------------------------------------
// Helper: build the ShaderMaterial for standard / gradient modes
// ---------------------------------------------------------------------------
function buildPLAMaterial(
  color: string,
  materialType: 'standard' | 'translucent' | 'gradient',
  yMin: number,
  yMax: number,
) {
  return new THREE.ShaderMaterial({
    vertexShader:   PLA_VERT,
    fragmentShader: PLA_FRAG,
    uniforms: {
      u_baseColor:   { value: new THREE.Color(color) },
      u_layerScale:  { value: 60.0 },
      u_seamDark:    { value: 0.76 },
      u_isGradient:  { value: materialType === 'gradient' ? 1 : 0 },
      u_colorBottom: { value: new THREE.Color('#EC4899') },
      u_colorTop:    { value: new THREE.Color('#3B82F6') },
      u_yMin:        { value: yMin },
      u_yMax:        { value: yMax },
    },
  });
}

// ---------------------------------------------------------------------------
// Loading indicator
// ---------------------------------------------------------------------------
function LoadingOverlay({ progress }: { progress: number }) {
  return (
    <Html center>
      <div style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', fontFamily: 'sans-serif' }}>
        <style>{`
          @keyframes stl-spin { to { transform: rotate(360deg); } }
          .stl-spinner {
            width: 32px; height: 32px;
            border: 3px solid #333; border-top-color: #3b82f6;
            border-radius: 50%;
            animation: stl-spin 0.8s linear infinite;
            margin: 0 auto 8px;
          }
          @media (prefers-reduced-motion: reduce) {
            .stl-spinner { animation: none; }
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

// ---------------------------------------------------------------------------
// STL mesh with PLA shader
// ---------------------------------------------------------------------------
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

  // Normalise to fit in a 2-unit bounding sphere
  geometry.computeBoundingBox();
  const box    = geometry.boundingBox!;
  const size   = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale  = maxDim > 0 ? 2 / maxDim : 1;

  // PLA shader (standard + gradient share the same GLSL; only uniforms differ)
  const plaMaterial = useMemo(
    () => buildPLAMaterial(color, materialType, box.min.y, box.max.y),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color, materialType, box.min.y, box.max.y],
  );

  // Translucent uses a separate physical material
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
      <mesh geometry={geometry} scale={scale} material={plaMaterial} />
    </Center>
  );
}

// ---------------------------------------------------------------------------
// Scene: studio lighting declared in Three.js for shadow pass;
// actual shading happens inside the custom shader.
// ---------------------------------------------------------------------------
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
      {/* Lights still needed for shadow casting and the translucent material */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 6, 3]}  intensity={3.5} castShadow />
      <directionalLight position={[-5, 2, 2]} intensity={1.4} color="#c8d8ff" />
      <directionalLight position={[0, 4, -5]} intensity={2.4} />
      <directionalLight position={[0, 8, 0]}  intensity={1.0} />

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

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------
export function STLViewer({
  stlPath,
  color = '#3B82F6',
  materialType = 'standard',
}: STLViewerProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '400px',
        position: 'relative',
        background: '#0f0f0f',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => { gl.setClearColor('#0f0f0f'); }}
      >
        <Scene
          stlPath={stlPath}
          color={color}
          materialType={materialType}
          autoRotate={!reducedMotion}
        />
      </Canvas>
    </div>
  );
}
