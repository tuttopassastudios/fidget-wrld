'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, useProgress, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';

export interface STLViewerProps {
  stlPath: string;
  color?: string;
  materialType?: 'standard' | 'translucent' | 'gradient' | 'silk' | 'silk-gradient';
  modelRotation?: [number, number, number]; // radians [rx, ry, rz]
}

// ---------------------------------------------------------------------------
// PLA layer-line + silk GLSL shader
// Three.js auto-injects built-in uniforms — do NOT redeclare viewMatrix etc.
// ---------------------------------------------------------------------------

const PLA_VERT = /* glsl */ `
varying vec3 vObjectPos;    // object-space position for layer lines / gradient
varying vec3 vObjectNormal; // object-space normal for flat-face attenuation
varying vec3 vViewNormal;   // view-space normal for lighting

void main() {
  vObjectPos    = position;
  vObjectNormal = normal;
  vViewNormal   = normalize(normalMatrix * normal);
  gl_Position   = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const PLA_FRAG = /* glsl */ `
// viewMatrix is auto-provided by Three.js — do NOT redeclare.

uniform vec3  u_baseColor;
uniform float u_layerScale;
uniform float u_seamDark;
uniform int   u_isGradient;  // 1 = gradient or silk-gradient
uniform int   u_isSilk;      // 1 = silk / silk-gradient (metallic sheen, no layer lines)
uniform vec3  u_colorBottom; // gradient bottom color
uniform vec3  u_colorTop;    // gradient top color
uniform float u_yMin;
uniform float u_yMax;

varying vec3 vObjectPos;
varying vec3 vObjectNormal;
varying vec3 vViewNormal;

float diffuse(vec3 n, vec3 worldDir, float intensity) {
  vec3 vDir = normalize(mat3(viewMatrix) * normalize(worldDir));
  return max(dot(n, vDir), 0.0) * intensity;
}

// Blinn-Phong specular (view space, camera is along +Z)
float specularBP(vec3 n, vec3 worldLight, float shininess, float intensity) {
  vec3 lDir   = normalize(mat3(viewMatrix) * normalize(worldLight));
  vec3 viewDir = vec3(0.0, 0.0, 1.0); // camera in view space
  vec3 h = normalize(lDir + viewDir);
  return pow(max(dot(n, h), 0.0), shininess) * intensity;
}

void main() {
  vec3 n = normalize(vViewNormal);

  // Base colour: solid or teal→pink silk gradient along Y
  vec3 color;
  if (u_isGradient == 1) {
    float t = (u_yMax > u_yMin)
      ? clamp((vObjectPos.y - u_yMin) / (u_yMax - u_yMin), 0.0, 1.0)
      : 0.5;
    color = mix(u_colorBottom, u_colorTop, t);
  } else {
    color = u_baseColor;
  }

  if (u_isSilk == 1) {
    // ── Silk / metallic ────────────────────────────────────────────────────
    // No layer lines. High specular key + fill + rim.
    float ambient = 0.20;
    float d_key   = diffuse(n, vec3( 4.0,  6.0,  3.0), 0.40);
    float d_fill  = diffuse(n, vec3(-5.0,  2.0,  2.0), 0.20);
    float d_rim   = diffuse(n, vec3( 0.0,  4.0, -5.0), 0.12);
    float d_top   = diffuse(n, vec3( 0.0,  8.0,  0.0), 0.08);

    float s_key   = specularBP(n, vec3( 4.0,  6.0,  3.0), 80.0, 0.60);
    float s_fill  = specularBP(n, vec3(-5.0,  2.0,  2.0), 32.0, 0.18);
    float s_rim   = specularBP(n, vec3( 0.0,  4.0, -5.0), 48.0, 0.10);

    color = color * (ambient + d_key + d_fill + d_rim + d_top)
            + vec3(s_key + s_fill + s_rim);

  } else {
    // ── PLA matte with horizontal layer lines ──────────────────────────────
    // Sample Y (display up) for horizontal bands.
    // Attenuate on upward-facing flat surfaces to avoid banding artifacts.
    float phase     = fract(vObjectPos.y * u_layerScale);
    float rawLayer  = mix(u_seamDark, 1.0, smoothstep(0.0, 0.5, phase));
    float faceUp    = abs(normalize(vObjectNormal).y);
    float layerMask = 1.0 - faceUp * 0.85;
    float layerF    = mix(1.0, rawLayer, layerMask);

    color *= layerF;

    float ambient = 0.38;
    float d_key   = diffuse(n, vec3( 4.0,  6.0,  3.0), 0.38);
    float d_fill  = diffuse(n, vec3(-5.0,  2.0,  2.0), 0.16);
    float d_rim   = diffuse(n, vec3( 0.0,  4.0, -5.0), 0.06);
    float d_top   = diffuse(n, vec3( 0.0,  8.0,  0.0), 0.08);

    color *= (ambient + d_key + d_fill + d_rim + d_top);
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

function buildPLAMaterial(
  color: string,
  materialType: 'standard' | 'gradient' | 'silk-gradient',
  yMin: number,
  yMax: number,
): THREE.ShaderMaterial {
  const isSilk     = materialType === 'silk-gradient';
  const isGradient = materialType === 'gradient' || materialType === 'silk-gradient';
  return new THREE.ShaderMaterial({
    vertexShader: PLA_VERT,
    fragmentShader: PLA_FRAG,
    uniforms: {
      u_baseColor:   { value: new THREE.Color(color) },
      u_layerScale:  { value: 60.0 },
      u_seamDark:    { value: 0.76 },
      u_isGradient:  { value: isGradient ? 1 : 0 },
      u_isSilk:      { value: isSilk ? 1 : 0 },
      u_colorBottom: { value: new THREE.Color('#E91E8C') }, // hot pink (bottom)
      u_colorTop:    { value: new THREE.Color('#00C4B4') }, // teal (top)
      u_yMin:        { value: yMin },
      u_yMax:        { value: yMax },
    },
  });
}

// ---------------------------------------------------------------------------
function LoadingOverlay({ progress }: { progress: number }) {
  return (
    <Html center>
      <div style={{ textAlign: 'center', color: '#888', fontSize: '14px', fontFamily: 'sans-serif' }}>
        <style>{`
          @keyframes stl-spin { to { transform: rotate(360deg); } }
          .stl-spinner {
            width: 32px; height: 32px;
            border: 3px solid #ddd; border-top-color: #3b82f6;
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

// ---------------------------------------------------------------------------
function STLModel({
  stlPath,
  color,
  materialType,
  modelRotation,
}: {
  stlPath: string;
  color: string;
  materialType: 'standard' | 'translucent' | 'gradient' | 'silk' | 'silk-gradient';
  modelRotation: [number, number, number];
}) {
  const geometry = useLoader(STLLoader, stlPath);

  geometry.computeBoundingBox();
  const box  = geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale  = maxDim > 0 ? 2 / maxDim : 1;

  const plaMaterial = useMemo(
    () => buildPLAMaterial(color, materialType === 'gradient' ? 'gradient' : materialType === 'silk-gradient' ? 'silk-gradient' : 'standard', box.min.y, box.max.y),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color, materialType, box.min.y, box.max.y],
  );

  if (materialType === 'translucent') {
    return (
      <Center>
        <mesh geometry={geometry} scale={scale} rotation={modelRotation}>
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.75}
            roughness={0.04}
            metalness={0}
            transmission={0.6}
            ior={1.47}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Center>
    );
  }

  if (materialType === 'silk') {
    return (
      <Center>
        <mesh geometry={geometry} scale={scale} rotation={modelRotation} castShadow>
          <meshPhysicalMaterial
            color={color}
            metalness={0.88}
            roughness={0.08}
            reflectivity={1.0}
            clearcoat={0.3}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </Center>
    );
  }

  return (
    <Center>
      <mesh
        geometry={geometry}
        scale={scale}
        rotation={modelRotation}
        material={plaMaterial}
        castShadow
      />
    </Center>
  );
}

// ---------------------------------------------------------------------------
function Scene({
  stlPath,
  color,
  materialType,
  modelRotation,
  autoRotate,
}: {
  stlPath: string;
  color: string;
  materialType: 'standard' | 'translucent' | 'gradient' | 'silk' | 'silk-gradient';
  modelRotation: [number, number, number];
  autoRotate: boolean;
}) {
  return (
    <>
      {/* Studio lights */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 4]}  intensity={1.6} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-near={0.1} shadow-camera-far={50}
        shadow-camera-left={-4} shadow-camera-right={4}
        shadow-camera-top={4} shadow-camera-bottom={-4}
      />
      <directionalLight position={[-4, 4, 2]}  intensity={0.8} color="#e8ecff" />
      <directionalLight position={[0, 6, -6]}  intensity={0.5} />
      <directionalLight position={[0, 10, 0]}  intensity={0.4} />

      {/* Floor — drop shadow only */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0.18} />
      </mesh>

      <Suspense fallback={<ProgressTracker />}>
        <STLModel
          stlPath={stlPath}
          color={color}
          materialType={materialType}
          modelRotation={modelRotation}
        />
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
export function STLViewer({
  stlPath,
  color = '#3B82F6',
  materialType = 'standard',
  modelRotation = [0, 0, 0],
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
    <div style={{
      width: '100%',
      height: '400px',
      position: 'relative',
      background: 'radial-gradient(ellipse at 55% 42%, #ffffff 0%, #e8edf2 100%)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0.5, 5], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => { gl.setClearColor(0xf4f6f8); }}
      >
        <Scene
          stlPath={stlPath}
          color={color}
          materialType={materialType}
          modelRotation={modelRotation}
          autoRotate={!reducedMotion}
        />
      </Canvas>
    </div>
  );
}
