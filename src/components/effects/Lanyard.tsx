'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  RapierRigidBody,
} from '@react-three/rapier';

// Extended RigidBody type with lerped position for smooth animation
interface LerpedRigidBody extends RapierRigidBody {
  lerped?: THREE.Vector3;
}

// Extended mesh type with MeshLineGeometry
interface MeshLineGeometryWithSetPoints extends THREE.BufferGeometry {
  setPoints: (points: THREE.Vector3[]) => void;
}

type MeshLineMesh = THREE.Mesh<MeshLineGeometryWithSetPoints, THREE.Material>;
import type { ThreeEvent } from '@react-three/fiber';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

function createPromoTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 720;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Card background — white with subtle warm tint
  ctx.fillStyle = '#f8f9fc';
  ctx.fillRect(0, 0, w, h);

  // Subtle border
  ctx.strokeStyle = '#e2e4ea';
  ctx.lineWidth = 3;
  ctx.roundRect(4, 4, w - 8, h - 8, 20);
  ctx.stroke();

  // "10% OFF" headline
  ctx.fillStyle = '#1e40af';
  ctx.font = '800 72px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('10% OFF', w / 2, 160);

  // Divider line
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 220);
  ctx.lineTo(w - 80, 220);
  ctx.stroke();

  // "Use code" label
  ctx.fillStyle = '#6b7280';
  ctx.font = '500 28px system-ui, -apple-system, sans-serif';
  ctx.fillText('Use code', w / 2, 270);

  // Promo code box
  const codeY = 330;
  const codeW = 320;
  const codeH = 64;
  const codeX = (w - codeW) / 2;

  // Dashed border
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 6]);
  ctx.roundRect(codeX, codeY - codeH / 2, codeW, codeH, 12);
  ctx.stroke();
  ctx.setLineDash([]);

  // Code bg
  ctx.fillStyle = '#eef5ff';
  ctx.roundRect(codeX + 2, codeY - codeH / 2 + 2, codeW - 4, codeH - 4, 10);
  ctx.fill();

  // Code text
  ctx.fillStyle = '#1e40af';
  ctx.font = '800 38px monospace';
  ctx.fillText('FIDGETFUN', w / 2, codeY + 2);

  // Free shipping
  ctx.fillStyle = '#6b7280';
  ctx.font = '500 26px system-ui, -apple-system, sans-serif';
  ctx.fillText('Free shipping $50+', w / 2, 420);

  // "Shop Now" button
  const btnW = 240;
  const btnH = 60;
  const btnX = (w - btnW) / 2;
  const btnY = 490;

  const grad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
  grad.addColorStop(0, '#6366f1');
  grad.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = grad;
  ctx.roundRect(btnX, btnY, btnW, btnH, 14);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 28px system-ui, -apple-system, sans-serif';
  ctx.fillText('Shop Now', w / 2, btnY + btnH / 2 + 1);

  // Fidget WRLD branding at bottom
  ctx.fillStyle = '#9ca3af';
  ctx.font = '600 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('FIDGET WRLD', w / 2, 620);

  const tex = new THREE.CanvasTexture(canvas);
  tex.flipY = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  showPromo = false,
}: {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  showPromo?: boolean;
  onDismissPromo?: () => void;
}) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position: position, fov: fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} showPromo={showPromo} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  showPromo = false,
}: {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  showPromo?: boolean;
}) {
  const band = useRef<MeshLineMesh>(null!);
  const fixed = useRef<LerpedRigidBody>(null!);
  const j1 = useRef<LerpedRigidBody>(null!);
  const j2 = useRef<LerpedRigidBody>(null!);
  const j3 = useRef<LerpedRigidBody>(null!);
  const card = useRef<LerpedRigidBody>(null!);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps = {
    type: 'dynamic' as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF('/models/card.glb') as unknown as {
    nodes: Record<string, THREE.Mesh>;
    materials: Record<string, THREE.MeshStandardMaterial>;
  };
  const texture = useTexture('/images/lanyard.png');
  const promoTexture = useMemo(() => showPromo ? createPromoTexture() : null, [showPromo]);

  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    c.curveType = 'chordal';
    return c;
  });

  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  // Configure texture wrapping (Three.js texture config, not React state)
  useEffect(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  }, [texture]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped!);
      curve.points[2].copy(j1.current.lerped!);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
    }
  });

  return (
    <>
      <group position={[0, 6, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => (
              (e.target as Element).releasePointerCapture(e.pointerId), drag(false)
            )}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => (
              (e.target as Element).setPointerCapture(e.pointerId),
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation()))
              )
            )}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={promoTexture ?? materials.base.map}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={showPromo ? 0.3 : 0.9}
                metalness={showPromo ? 0.1 : 0.8}
              />
            </mesh>
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        {/* @ts-expect-error meshline extended components */}
        <meshLineGeometry />
        {/* @ts-expect-error meshline extended components */}
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
