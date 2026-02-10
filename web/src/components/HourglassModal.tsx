"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";

interface HourglassModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Total countdown time in seconds */
  totalSeconds: number;
  /** Formatted remaining time string, e.g. "2小时30分钟后刷新" */
  refreshTimeText: string;
}

const GLASS_RADIUS = 2.5;
const GLASS_HEIGHT = 3.5;
const SAND_COLOR = 0xf39c12;

export default function HourglassModal({
  isOpen,
  onClose,
  totalSeconds,
  refreshTimeText,
}: HourglassModalProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const upperSandRef = useRef<THREE.Mesh | null>(null);
  const lowerSandRef = useRef<THREE.Mesh | null>(null);
  const sandStreamRef = useRef<THREE.Points | null>(null);
  const hourglassGroupRef = useRef<THREE.Group | null>(null);
  const bgGroupRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const totalTimeRef = useRef<number>(totalSeconds);
  const [timerDisplay, setTimerDisplay] = useState("00:00:00");

  // Keep totalTime in sync
  useEffect(() => {
    totalTimeRef.current = totalSeconds;
  }, [totalSeconds]);

  const updateSandGeometries = useCallback(
    (
      upperSand: THREE.Mesh,
      lowerSand: THREE.Mesh,
      progress: number
    ) => {
      // Upper sand
      if (upperSand.geometry) upperSand.geometry.dispose();
      const uHeight = GLASS_HEIGHT * (1 - progress);
      const uRadius = GLASS_RADIUS * (1 - progress);
      if (uHeight > 0.01) {
        const geo = new THREE.ConeGeometry(uRadius, uHeight, 32);
        geo.translate(0, -uHeight / 2, 0);
        upperSand.geometry = geo;
        upperSand.position.y = 0;
        upperSand.rotation.x = Math.PI;
      } else {
        upperSand.geometry = new THREE.BufferGeometry();
      }

      // Lower sand
      if (lowerSand.geometry) lowerSand.geometry.dispose();
      const lHeight = GLASS_HEIGHT * progress;
      const lRadius = GLASS_RADIUS * progress;
      if (lHeight > 0.01) {
        const geo = new THREE.ConeGeometry(lRadius, lHeight, 32);
        geo.translate(0, lHeight / 2, 0);
        lowerSand.geometry = geo;
        lowerSand.position.y = -GLASS_HEIGHT;
      } else {
        lowerSand.geometry = new THREE.BufferGeometry();
      }
    },
    []
  );

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.4);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0xffeedd, 0.6);
    pointLight2.position.set(-8, -5, 8);
    scene.add(pointLight2);

    // Hourglass group
    const hourglassGroup = new THREE.Group();
    hourglassGroup.scale.set(0.8, 0.8, 0.8);
    scene.add(hourglassGroup);
    hourglassGroupRef.current = hourglassGroup;

    // Wooden caps
    const capGeo = new THREE.CylinderGeometry(
      GLASS_RADIUS + 0.3,
      GLASS_RADIUS + 0.3,
      0.4,
      32
    );
    const capMat = new THREE.MeshPhongMaterial({ color: 0x8d6e63 });
    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.position.y = GLASS_HEIGHT + 0.2;
    hourglassGroup.add(topCap);
    const botCap = new THREE.Mesh(capGeo, capMat);
    botCap.position.y = -(GLASS_HEIGHT + 0.2);
    hourglassGroup.add(botCap);

    // Glass shell
    const glassMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      shininess: 140,
      emissive: 0x222222,
    });
    const coneGeo = new THREE.ConeGeometry(
      GLASS_RADIUS,
      GLASS_HEIGHT,
      32,
      1,
      true
    );

    const topGlass = new THREE.Mesh(coneGeo, glassMat);
    topGlass.rotation.x = Math.PI;
    topGlass.position.y = GLASS_HEIGHT / 2;
    hourglassGroup.add(topGlass);

    const botGlass = new THREE.Mesh(coneGeo, glassMat);
    botGlass.position.y = -GLASS_HEIGHT / 2;
    hourglassGroup.add(botGlass);

    // Sand
    const sandMat = new THREE.MeshPhongMaterial({ color: SAND_COLOR, emissive: 0x553300 });
    const upperSand = new THREE.Mesh(new THREE.BufferGeometry(), sandMat);
    const lowerSand = new THREE.Mesh(new THREE.BufferGeometry(), sandMat);
    hourglassGroup.add(upperSand);
    hourglassGroup.add(lowerSand);
    upperSandRef.current = upperSand;
    lowerSandRef.current = lowerSand;

    // Sand stream particles
    const streamGeo = new THREE.BufferGeometry();
    const streamPos = new Float32Array(300 * 3);
    streamGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(streamPos, 3)
    );
    const sandStream = new THREE.Points(
      streamGeo,
      new THREE.PointsMaterial({ color: SAND_COLOR, size: 0.05 })
    );
    hourglassGroup.add(sandStream);
    sandStreamRef.current = sandStream;

    // Background stars
    const bgGroup = new THREE.Group();
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(4000 * 3);
    for (let i = 0; i < 4000 * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 50;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.75,
    });
    bgGroup.add(new THREE.Points(starGeo, starMat));
    scene.add(bgGroup);
    bgGroupRef.current = bgGroup;

    // Start time
    startTimeRef.current = Date.now();

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const totalTime = totalTimeRef.current;
      const progress = Math.min(elapsed / totalTime, 1);

      // Update timer display
      const rem = Math.max(totalTime - elapsed, 0);
      const hours = Math.floor(rem / 3600);
      const minutes = Math.floor((rem % 3600) / 60);
      const seconds = Math.floor(rem % 60);
      setTimerDisplay(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );

      // Update sand
      updateSandGeometries(upperSand, lowerSand, progress);

      // Sand stream particles
      const pos = sandStream.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < 300; i++) {
        const p = ((i / 300 + time * 1.5) % 1);
        pos[i * 3 + 1] = -(p * GLASS_HEIGHT);
        pos[i * 3] = (Math.random() - 0.5) * 0.05;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
      }
      sandStream.geometry.attributes.position.needsUpdate = true;
      sandStream.visible = progress < 0.99;

      // Rotate
      hourglassGroup.rotation.y += 0.005;
      bgGroup.rotation.y += 0.001;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize within the modal
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationIdRef.current);
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      // Dispose geometries
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
          }
        }
        if (obj instanceof THREE.Points) {
          obj.geometry?.dispose();
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
          }
        }
      });
    };
  }, [isOpen, updateSandGeometries]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-[90vw] max-w-md rounded-2xl overflow-hidden border border-amber-600/40 shadow-2xl shadow-amber-900/30">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a00] via-[#0d0d0d] to-[#1a0a00]" />

        {/* Content */}
        <div className="relative flex flex-col items-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-red-950/60 border border-amber-700/30 text-amber-200 hover:bg-red-900/60 hover:text-amber-100 transition-colors flex items-center justify-center text-sm"
          >
            ✕
          </button>

          {/* Title */}
          <div className="pt-5 pb-2 text-center z-10">
            <h3 className="text-amber-300 text-lg font-bold">⏳ 免费次数已用完</h3>
            <p className="text-amber-200/50 text-xs mt-1">请耐心等待冷却时间结束</p>
          </div>

          {/* Timer display */}
          <div className="z-10 text-3xl font-mono text-amber-200 tabular-nums" style={{ textShadow: "0 0 10px rgba(211, 84, 0, 0.5)" }}>
            {timerDisplay}
          </div>

          {/* Three.js canvas container */}
          <div
            ref={mountRef}
            className="w-full"
            style={{ height: "320px" }}
          />

          {/* Info text */}
          <div className="pb-5 text-center z-10">
            <p className="text-amber-400/60 text-sm">
              {refreshTimeText}
            </p>
            <p className="text-amber-200/40 text-xs mt-1">
              冷却结束后将自动恢复 5 次免费机会
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
