import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, Sparkles, Eye, RotateCw } from 'lucide-react';

export const HeroScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [photoCount, setPhotoCount] = useState(38);
  const [isRotating, setIsRotating] = useState(true);

  // References for animation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const lensGroupRef = useRef<THREE.Group | null>(null);
  const floatingCardsGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient & Studio Rim Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const warmLight = new THREE.DirectionalLight(0xf59e0b, 2.5); // Amber studio key
    warmLight.position.set(5, 5, 4);
    scene.add(warmLight);

    const coolRimLight = new THREE.DirectionalLight(0x60a5fa, 2.0); // Blue rim
    coolRimLight.position.set(-5, -3, 3);
    scene.add(coolRimLight);

    const centerPointLight = new THREE.PointLight(0xfffbeb, 3, 12);
    centerPointLight.position.set(0, 0, 2);
    scene.add(centerPointLight);

    // --- 3D Camera / Lens Rig Group ---
    const cameraRig = new THREE.Group();
    lensGroupRef.current = cameraRig;

    // Materials
    const darkMetal = new THREE.MeshStandardMaterial({
      color: 0x171717,
      metalness: 0.85,
      roughness: 0.25,
    });
    const goldAccent = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.2,
    });
    const chromeRing = new THREE.MeshStandardMaterial({
      color: 0xe5e5e5,
      metalness: 0.95,
      roughness: 0.1,
    });
    const lensGlass = new THREE.MeshPhysicalMaterial({
      color: 0x1e3a8a,
      transmission: 0.7,
      opacity: 0.9,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
    });

    // Camera Body (Sleek minimalist rangefinder body)
    const bodyGeo = new THREE.BoxGeometry(3.6, 2.2, 1.4);
    const bodyMesh = new THREE.Mesh(bodyGeo, darkMetal);
    bodyMesh.position.set(0, 0, -0.6);
    cameraRig.add(bodyMesh);

    // Top Viewfinder Hump & Knurled Dials
    const topCapGeo = new THREE.BoxGeometry(1.4, 0.4, 1.2);
    const topCapMesh = new THREE.Mesh(topCapGeo, darkMetal);
    topCapMesh.position.set(0, 1.3, -0.6);
    cameraRig.add(topCapMesh);

    // Shutter button (Interactive clickable look)
    const shutterGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 24);
    const shutterMesh = new THREE.Mesh(shutterGeo, goldAccent);
    shutterMesh.position.set(1.2, 1.25, -0.6);
    cameraRig.add(shutterMesh);

    // Main Lens Barrel
    const barrelGeo = new THREE.CylinderGeometry(1.2, 1.25, 1.6, 32);
    const barrelMesh = new THREE.Mesh(barrelGeo, darkMetal);
    barrelMesh.rotation.x = Math.PI / 2;
    barrelMesh.position.set(0, 0, 0.4);
    cameraRig.add(barrelMesh);

    // Aperture & Focus Rings with knurling
    const focusRingGeo = new THREE.TorusGeometry(1.26, 0.06, 16, 40);
    const focusRing = new THREE.Mesh(focusRingGeo, goldAccent);
    focusRing.position.set(0, 0, 0.7);
    cameraRig.add(focusRing);

    const chromeRingMesh = new THREE.Mesh(focusRingGeo, chromeRing);
    chromeRingMesh.position.set(0, 0, 1.0);
    chromeRingMesh.scale.set(0.96, 0.96, 0.96);
    cameraRig.add(chromeRingMesh);

    // Front Convex Lens Element (Glass Reflection)
    const frontLensGeo = new THREE.SphereGeometry(1.05, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const frontLens = new THREE.Mesh(frontLensGeo, lensGlass);
    frontLens.position.set(0, 0, 0.95);
    cameraRig.add(frontLens);

    // Inner Iris Aperture blades
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const bladeGeo = new THREE.BoxGeometry(0.5, 0.08, 0.02);
      const blade = new THREE.Mesh(bladeGeo, darkMetal);
      blade.position.set(Math.cos(angle) * 0.45, Math.sin(angle) * 0.45, 0.8);
      blade.rotation.z = angle + 0.5;
      cameraRig.add(blade);
    }

    scene.add(cameraRig);

    // --- Floating 3D Spatial Photo Cards ---
    const cardsGroup = new THREE.Group();
    floatingCardsGroupRef.current = cardsGroup;

    const cardData = [
      { x: -3.4, y: 1.5, z: -1.2, rotY: 0.35, rotX: -0.1, color: 0xf59e0b, label: '3D Spatial Portrait' },
      { x: 3.5, y: 1.2, z: -1.0, rotY: -0.38, rotX: 0.15, color: 0x3b82f6, label: 'Wedding 4K Depth' },
      { x: -3.2, y: -1.8, z: -0.8, rotY: 0.28, rotX: 0.1, color: 0xec4899, label: 'Couture Lookbook' },
      { x: 3.3, y: -1.6, z: -1.5, rotY: -0.3, rotX: -0.15, color: 0x10b981, label: 'Photogrammetry Asset' },
    ];

    cardData.forEach((c) => {
      const cardFrame = new THREE.Group();
      cardFrame.position.set(c.x, c.y, c.z);
      cardFrame.rotation.set(c.rotX, c.rotY, 0);

      // Card body with sleek glass border
      const cardPlaneGeo = new THREE.PlaneGeometry(1.6, 2.1);
      const cardMat = new THREE.MeshPhysicalMaterial({
        color: 0x1c1917,
        roughness: 0.2,
        metalness: 0.5,
        reflectivity: 0.8,
        clearcoat: 0.9,
      });
      const cardMesh = new THREE.Mesh(cardPlaneGeo, cardMat);
      cardFrame.add(cardMesh);

      // Glowing border frame
      const frameBorderGeo = new THREE.BoxGeometry(1.65, 2.15, 0.03);
      const frameMat = new THREE.MeshStandardMaterial({
        color: c.color,
        roughness: 0.3,
        metalness: 0.8,
        wireframe: true,
      });
      const borderMesh = new THREE.Mesh(frameBorderGeo, frameMat);
      cardFrame.add(borderMesh);

      cardsGroup.add(cardFrame);
    });

    scene.add(cardsGroup);

    // --- Floating Volumetric Sparks & Stars ---
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 16;
      particlePositions[i + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i + 2] = (Math.random() - 0.5) * 12;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particles;
    scene.add(particles);

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize observer
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Rotate camera rig
      if (lensGroupRef.current) {
        if (isRotating) {
          lensGroupRef.current.rotation.y = Math.sin(elapsedTime * 0.5) * 0.25 + mouseRef.current.x * 0.45;
          lensGroupRef.current.rotation.x = Math.cos(elapsedTime * 0.4) * 0.12 - mouseRef.current.y * 0.35;
          lensGroupRef.current.position.y = Math.sin(elapsedTime * 1.2) * 0.15;
        } else {
          lensGroupRef.current.rotation.y = mouseRef.current.x * 0.5;
          lensGroupRef.current.rotation.x = -mouseRef.current.y * 0.4;
        }
      }

      // Float Cards with gentle wave motion
      if (floatingCardsGroupRef.current) {
        floatingCardsGroupRef.current.children.forEach((child, index) => {
          child.position.y += Math.sin(elapsedTime * 1.5 + index * 1.3) * 0.003;
          child.rotation.z = Math.sin(elapsedTime * 0.8 + index) * 0.03;
        });
      }

      // Rotate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.03;
        particlesRef.current.rotation.x = elapsedTime * 0.015;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isRotating]);

  // Flash Shutter Effect
  const handleShutterClick = () => {
    setIsFlashing(true);
    setPhotoCount(prev => prev + 1);
    setTimeout(() => {
      setIsFlashing(false);
    }, 180);
  };

  return (
    <div className="relative w-full h-[540px] md:h-[640px] overflow-hidden rounded-3xl bg-radial from-neutral-900/90 via-neutral-950 to-black border border-neutral-800/80 shadow-2xl">
      {/* Flash overlay animation */}
      <div
        className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-150 ${
          isFlashing ? 'opacity-90 bg-white' : 'opacity-0'
        }`}
      />

      {/* Canvas container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Interactive 3D Controls HUD */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-700/60 backdrop-blur-md text-xs font-mono text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Three.js 3D WebGL Active
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-900/85 border border-neutral-800 backdrop-blur-md">
        <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Mouse Parallax 360°</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Stereoscopic Depth</span>
          </div>
          <div className="text-neutral-500">
            Shots Captured: <span className="text-amber-400 font-bold">{photoCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="toggle-rotation-btn"
            onClick={() => setIsRotating(!isRotating)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              isRotating
                ? 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            {isRotating ? 'Auto-Orbit On' : 'Orbit Paused'}
          </button>

          <button
            type="button"
            id="trigger-shutter-btn"
            onClick={handleShutterClick}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            Snap 3D Strobe
          </button>
        </div>
      </div>
    </div>
  );
};
