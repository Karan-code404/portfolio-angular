import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion, useScroll, useTransform } from 'framer-motion';
import SignatureOverlay from './SignatureOverlay';

// ==========================================================================
// GLSL — Simplex 3D Noise  (Stefan Gustavson / Ashima Arts)
// ==========================================================================

const simplexNoiseGLSL = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;  p1 *= norm.y;  p2 *= norm.z;  p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

// ==========================================================================
// GLSL — Vertex Shader
// ==========================================================================

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ==========================================================================
// GLSL — Fragment Shader
// ==========================================================================

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uHumanTex;
  uniform sampler2D uRobotTex;
  uniform sampler2D uNetworkTex;
  uniform sampler2D uDepthTex;
  uniform float     uActiveFactor;
  uniform vec2      uMouse;             // viewport UV [0,1], y-flipped
  uniform float     uTime;
  uniform float     uParallaxStrength;
  uniform float     uScreenAspect;      // viewport width / height
  uniform float     uImageAspect;       // source image width / height

  varying vec2 vUv;

  ${simplexNoiseGLSL}

  void main() {
    // =============================================================
    // 1. BACKGROUND WAVES & CONTOUR PATTERN
    // =============================================================
    float waveUV1     = snoise(vec3(vUv * 2.2, uTime * 0.05));
    float waveUV2     = snoise(vec3(vUv * 4.4, uTime * 0.08 + 12.4));
    float wavePattern = (waveUV1 * 0.65 + waveUV2 * 0.35) * 0.5 + 0.5;
    float bgWaveMask  = smoothstep(0.40, 0.60, wavePattern);

    // =============================================================
    // 2. MAP VIEWPORT UV → FACE IMAGE UV  (Hair aligned right at top image border edge)
    // =============================================================
    float faceScale       = mix(1.30, 0.95, uActiveFactor);  // slight zoom — full face visible
    float centerY         = mix(0.40, 0.45, uActiveFactor);  // balanced — hair top, chin bottom
    float faceWidthInView = faceScale * uImageAspect / uScreenAspect;

    vec2 faceUV = vec2(
      (vUv.x - 0.5) / faceWidthInView  + 0.5,
      (vUv.y - centerY) / faceScale    + 0.5
    );

    float edgeFade = smoothstep(0.0, 0.015, faceUV.x) * smoothstep(1.0, 0.985, faceUV.x)
                   * smoothstep(0.0, 0.015, faceUV.y) * smoothstep(1.0, 0.985, faceUV.y);

    // =============================================================
    // 3. ORGANIC FLUID DROPLET CUTOUT MASK
    // =============================================================
    vec2 dropUV1 = faceUV * 4.2 + vec2(sin(uTime * 0.14 + faceUV.y * 2.0) * 0.4, uTime * 0.08);
    vec2 dropUV2 = faceUV * 8.5 + vec2(-uTime * 0.10, cos(uTime * 0.12 + faceUV.x * 3.0) * 0.3) + 31.4;

    float dNoise1 = snoise(vec3(dropUV1, uTime * 0.12));
    float dNoise2 = snoise(vec3(dropUV2, uTime * 0.15));
    float dropPattern = (dNoise1 * 0.65 + dNoise2 * 0.35) * 0.5 + 0.5;

    // Distance attractor to mouse cursor
    vec2 mouseFaceUV = vec2(
      (uMouse.x - 0.5) / faceWidthInView + 0.5,
      (uMouse.y - centerY) / faceScale   + 0.5
    );
    vec2 delta = faceUV - mouseFaceUV;
    delta.x *= uImageAspect;
    float mouseDist = length(delta);
    float mouseAttractor = smoothstep(0.40, 0.05, mouseDist);

    // Cutout mask fades smoothly to 0 as image shrinks (uActiveFactor -> 0)
    float dropletVal = dropPattern * 0.55 + mouseAttractor * 0.65;
    float dropCutoutMask = smoothstep(0.50, 0.58, dropletVal) * uActiveFactor;

    // Light glowing rim stroke around the fluid droplet cutouts (fades out when shrunk)
    float dropBorder = (smoothstep(0.48, 0.50, dropCutoutMask) - smoothstep(0.50, 0.56, dropCutoutMask)) * uActiveFactor;
    vec3 borderRimRGB = vec3(0.92, 0.94, 0.96) * dropBorder * 0.70;

    // =============================================================
    // 4. DEPTH PARALLAX & TEXTURE SAMPLING
    // =============================================================
    vec2 clampedFaceUV = clamp(faceUV, 0.0, 1.0);
    float depth        = texture2D(uDepthTex, clampedFaceUV).r;
    vec2  pOff         = (uMouse - 0.5) * depth * uParallaxStrength * uActiveFactor;

    vec4 humanColor   = texture2D(uHumanTex,   clamp(clampedFaceUV - pOff,       0.0, 1.0));
    vec4 robotColor   = texture2D(uRobotTex,   clamp(clampedFaceUV - pOff * 1.4, 0.0, 1.0));
    vec4 networkColor = texture2D(uNetworkTex, clamp(clampedFaceUV - pOff,       0.0, 1.0));

    humanColor.a   *= edgeFade;
    robotColor.a   *= edgeFade;
    networkColor.a *= edgeFade;

    // Holographic scanner wave (fades out when shrunk)
    float flow = fract(faceUV.y + uTime * 0.22);
    float band = smoothstep(0.0, 0.14, flow) * (1.0 - smoothstep(0.14, 0.32, flow));
    float leadingGlow = smoothstep(0.09, 0.14, flow) * (1.0 - smoothstep(0.14, 0.19, flow));
    vec3 hologramRGB = networkColor.rgb * (band * 1.6 + leadingGlow * 0.9) * networkColor.a * uActiveFactor;

    // Convert portrait face to Lando Norris monochrome greyscale tone when shrunk
    float gray = dot(humanColor.rgb, vec3(0.299, 0.587, 0.114));
    vec3 landoMonochromeRGB = vec3(gray * 0.75); // Muted greyscale portrait tone matching reference screenshot
    vec3 activeHumanRGB = mix(landoMonochromeRGB, humanColor.rgb, uActiveFactor);

    vec3 baseHumanRGB = activeHumanRGB + hologramRGB;

    // Inside cutouts, robot face mixes; when uActiveFactor is 0, faceRGB is 100% Lando-style monochrome portrait!
    vec3 faceRGB   = mix(baseHumanRGB, robotColor.rgb, dropCutoutMask) + borderRimRGB;
    float faceAlpha = humanColor.a;

    // =============================================================
    // 5. LIQUID TOPOGRAPHY CONTOUR LINES & BACKGROUND
    // =============================================================
    float lineScale   = 4.8;
    float fieldVal    = (waveUV1 * 0.65 + waveUV2 * 0.35) * lineScale + (uTime * 0.04);
    float linePattern = abs(sin(fieldVal * 3.14159));
    float lineMask    = smoothstep(0.025, 0.0, linePattern);

    vec3 bgBaseFull   = vec3(0.949, 0.945, 0.929);      // #F2F1ED warm white-cream
    vec3 bgBaseShrunk = vec3(0.29, 0.30, 0.28);      // #4A4D47 muted dark grey matching reference screenshot
    vec3 bgBase       = mix(bgBaseShrunk, bgBaseFull, uActiveFactor);

    vec3 lineColor = mix(vec3(0.24, 0.25, 0.24), vec3(0.58, 0.57, 0.55), uActiveFactor);
    vec3 waveGrey  = mix(vec3(0.26, 0.27, 0.25), vec3(0.78, 0.77, 0.75), uActiveFactor);

    vec3 bgWithWaves = mix(bgBase, waveGrey, bgWaveMask * 0.55);
    vec3 bgWithLines = mix(bgWithWaves, lineColor, lineMask * 0.35);

    vec3 finalRGB = mix(bgWithLines, faceRGB, faceAlpha);

    gl_FragColor = vec4(finalRGB, 1.0);
  }
`;

// ==========================================================================
// CyborgPlane — full-viewport mesh with noise-fluid shader
// ==========================================================================

function CyborgPlane({ scrollYProgress }) {
  const materialRef     = useRef();
  const mouseRaw        = useRef(new THREE.Vector2(0.5, 0.5));
  const mouseCurrent    = useRef(new THREE.Vector2(0.5, 0.5));
  const accumulatedTime = useRef(0);

  const { viewport } = useThree();

  const [humanTex, robotTex, networkTex, depthTex] = useTexture([
    '/karanface1.png',
    '/robot.png',
    '/network (2).png',
    '/depth.png',
  ]);

  useMemo(() => {
    [humanTex, robotTex, networkTex, depthTex].forEach((tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS     = THREE.ClampToEdgeWrapping;
      tex.wrapT     = THREE.ClampToEdgeWrapping;
    });
  }, [humanTex, robotTex, networkTex, depthTex]);

  const imageAspect  = humanTex.image ? humanTex.image.width / humanTex.image.height : 1;
  const screenAspect = viewport.width / viewport.height;

  useEffect(() => {
    const handler = (e) => {
      mouseRaw.current.set(
        e.clientX / window.innerWidth,
        1.0 - e.clientY / window.innerHeight,
      );
    };
    window.addEventListener('pointermove', handler);
    return () => window.removeEventListener('pointermove', handler);
  }, []);

  const uniforms = useMemo(
    () => ({
      uHumanTex:         { value: humanTex },
      uRobotTex:         { value: robotTex },
      uNetworkTex:       { value: networkTex },
      uDepthTex:         { value: depthTex },
      uActiveFactor:     { value: 1.0 },
      uMouse:            { value: new THREE.Vector2(0.5, 0.5) },
      uTime:             { value: 0 },
      uParallaxStrength: { value: 0.04 },
      uScreenAspect:     { value: screenAspect },
      uImageAspect:      { value: imageAspect },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [humanTex, robotTex, networkTex, depthTex],
  );

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    // Get current scroll progress (0 at top full-size, 0.6 when shrunk)
    const scrollVal = scrollYProgress ? scrollYProgress.get() : 0;
    
    // activeFactor drops from 1 at scroll 0 down to 0 at scroll 0.45 (dissolves cyborg cutouts to reveal original human face!)
    const activeFactor = Math.max(0, 1 - (scrollVal / 0.45));

    if (activeFactor > 0.001) {
      // Lerp mouse parallax only when active
      const lerpFactor = 0.07 * activeFactor;
      mouseCurrent.current.x = THREE.MathUtils.lerp(mouseCurrent.current.x, mouseRaw.current.x, lerpFactor);
      mouseCurrent.current.y = THREE.MathUtils.lerp(mouseCurrent.current.y, mouseRaw.current.y, lerpFactor);
      
      // Accumulate time only when active
      accumulatedTime.current += delta * activeFactor;
    }

    const u = materialRef.current.uniforms;
    u.uActiveFactor.value = activeFactor;
    u.uMouse.value.set(mouseCurrent.current.x, mouseCurrent.current.y);
    u.uTime.value         = accumulatedTime.current;
    u.uScreenAspect.value = window.innerWidth / window.innerHeight;
    u.uImageAspect.value  = imageAspect;
  });

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// ==========================================================================
// FluidLineBackground — Dynamic 60 FPS Fluid Wave Topography Lines (z-0)
// ==========================================================================

function FluidLineBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const NUM_LINES = 9;
    const lineConfigs = [
      { baseRelY: 0.08, amp1: 32, amp2: 20, freq1: 0.0015, freq2: 0.0030, speed: 0.60, phase: 0.0 },
      { baseRelY: 0.18, amp1: 36, amp2: 24, freq1: 0.0013, freq2: 0.0026, speed: 0.55, phase: 0.9 },
      { baseRelY: 0.30, amp1: 42, amp2: 26, freq1: 0.0014, freq2: 0.0028, speed: 0.65, phase: 1.8 },
      { baseRelY: 0.42, amp1: 38, amp2: 28, freq1: 0.0012, freq2: 0.0024, speed: 0.58, phase: 2.7 },
      { baseRelY: 0.54, amp1: 44, amp2: 30, freq1: 0.0015, freq2: 0.0029, speed: 0.68, phase: 3.6 },
      { baseRelY: 0.66, amp1: 40, amp2: 24, freq1: 0.0013, freq2: 0.0025, speed: 0.60, phase: 4.5 },
      { baseRelY: 0.78, amp1: 36, amp2: 26, freq1: 0.0014, freq2: 0.0031, speed: 0.62, phase: 5.4 },
      { baseRelY: 0.88, amp1: 32, amp2: 22, freq1: 0.0012, freq2: 0.0027, speed: 0.52, phase: 6.3 },
      { baseRelY: 0.98, amp1: 28, amp2: 20, freq1: 0.0015, freq2: 0.0028, speed: 0.58, phase: 7.2 },
    ];

    const islandConfigs = [
      { relX: 0.22, relY: 0.28, baseRx: 110, baseRy: 65, speed: 0.6, phase: 0.2 },
      { relX: 0.22, relY: 0.28, baseRx: 65,  baseRy: 40, speed: 0.6, phase: 0.2 },
      { relX: 0.76, relY: 0.68, baseRx: 130, baseRy: 75, speed: 0.55, phase: 1.8 },
      { relX: 0.76, relY: 0.68, baseRx: 80,  baseRy: 48, speed: 0.55, phase: 1.8 },
    ];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    resize();
    window.addEventListener('resize', resize);

    const startTime = performance.now();

    function render(currentTime) {
      const t = (currentTime - startTime) * 0.001;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#141713';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#5a6654';
      ctx.lineWidth = 1.3;
      ctx.globalAlpha = 0.55;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const stepX = 25;

      for (let i = 0; i < NUM_LINES; i++) {
        const cfg = lineConfigs[i];
        const baseY = cfg.baseRelY * height;
        const timeOffset = t * cfg.speed + cfg.phase;

        ctx.beginPath();
        let first = true;

        for (let x = -80; x <= width + 80; x += stepX) {
          const y = baseY
            + Math.sin(x * cfg.freq1 + timeOffset) * cfg.amp1
            + Math.cos(x * cfg.freq2 - timeOffset * 0.75) * cfg.amp2
            + Math.sin(x * 0.0006 + timeOffset * 0.4 + cfg.phase) * 16;

          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      for (let i = 0; i < islandConfigs.length; i++) {
        const cfg = islandConfigs[i];
        const cx = cfg.relX * width + Math.sin(t * cfg.speed * 0.7 + cfg.phase) * 16;
        const cy = cfg.relY * height + Math.cos(t * cfg.speed * 0.6 + cfg.phase) * 12;
        const timeOffset = t * cfg.speed + cfg.phase;

        ctx.beginPath();
        const numPoints = 72;
        for (let j = 0; j <= numPoints; j++) {
          const angle = (j / numPoints) * Math.PI * 2;
          const rOffset = Math.sin(angle * 3.0 + timeOffset) * 12 
                        + Math.cos(angle * 2.0 - timeOffset * 0.8) * 9;
          const rx = cfg.baseRx + rOffset;
          const ry = cfg.baseRy + rOffset * 0.7;

          const px = cx + Math.cos(angle) * rx;
          const py = cy + Math.sin(angle) * ry;

          if (j === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none w-full h-full"
    />
  );
}

// ==========================================================================
// Hero — Main Exported Section Component
// ==========================================================================

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Height shrinks to 0.45, width shrinks MORE (to 0.38) → portrait card shape when small
  const imageScaleY = useTransform(scrollYProgress, [0, 0.6], [1.0, 0.45]);
  const imageScaleX = useTransform(scrollYProgress, [0, 0.6], [1.0, 0.33]);

  // White-grey filter overlay fades in over the image as it shrinks
  const filterOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 0.55]);

  // Fades in instantly as scroll begins (0 to 0.1) and stays at 1.0 until the end
  const bgTextOpacity = useTransform(scrollYProgress, [0, 0.1, 1], [0, 1, 1]);

  // Signature opacity (Hides neon endpoint dots completely when un-scrolled at top!)
  const signatureOpacity = useTransform(scrollYProgress, [0.28, 0.32], [0, 1]);

  // Signature draws perfectly synced in the second half of scale shrink
  const signatureDraw = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);

  return (
    <div
      ref={containerRef}
      className="relative h-[250vh] bg-transparent w-full"
    >
      {/* Sticky Parent */}
      <div className="sticky top-0 w-full h-screen flex items-center justify-center">

        {/* CSS Keyframes for seamless infinite marquee loop */}
        <style>{`
          @keyframes seamless-marquee-left {
            0%   { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
          @keyframes seamless-marquee-right {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(0%); }
          }
        `}</style>

        {/* Background Marquee Text — Sits behind image (z-0), 100% seamless, never disappears */}
        <motion.div
          style={{ opacity: bgTextOpacity }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden z-0 select-none w-full"
        >
          {/* Top Cyan Line — scrolls left */}
          <div className="w-full overflow-hidden flex">
            <div
              className="flex shrink-0 whitespace-nowrap"
              style={{ animation: 'seamless-marquee-left 120s linear infinite' }}
            >
              {Array(6).fill(null).map((_, i) => (
                <span
                  key={i}
                  className="text-[#00F0FF] text-[5vw] md:text-[6vw] font-black uppercase tracking-tighter leading-none mr-12"
                >
                  PROCESSING DATA OPTIMIZING INTELLIGENCE
                </span>
              ))}
            </div>
            <div
              className="flex shrink-0 whitespace-nowrap"
              aria-hidden="true"
              style={{ animation: 'seamless-marquee-left 120s linear infinite' }}
            >
              {Array(6).fill(null).map((_, i) => (
                <span
                  key={i}
                  className="text-[#00F0FF] text-[5vw] md:text-[6vw] font-black uppercase tracking-tighter leading-none mr-12"
                >
                  PROCESSING DATA OPTIMIZING INTELLIGENCE
                </span>
              ))}
            </div>
          </div>

          {/* Bottom White-Grey Line — scrolls right */}
          <div className="w-full overflow-hidden flex -mt-1 md:-mt-3">
            <div
              className="flex shrink-0 whitespace-nowrap"
              style={{ animation: 'seamless-marquee-right 120s linear infinite' }}
            >
              {Array(6).fill(null).map((_, i) => (
                <span
                  key={i}
                  className="text-[#D1D5DB] text-[5vw] md:text-[6vw] font-black uppercase tracking-tighter leading-none mr-12"
                >
                  EVOLVING CODE PREDICTING FUTURES.
                </span>
              ))}
            </div>
            <div
              className="flex shrink-0 whitespace-nowrap"
              aria-hidden="true"
              style={{ animation: 'seamless-marquee-right 120s linear infinite' }}
            >
              {Array(6).fill(null).map((_, i) => (
                <span
                  key={i}
                  className="text-[#D1D5DB] text-[5vw] md:text-[6vw] font-black uppercase tracking-tighter leading-none mr-12"
                >
                  EVOLVING CODE PREDICTING FUTURES.
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* The Scaling Wrapper - MUST be full screen. 
            Framer Motion will visually scale the entire composition down as a single flat unit. */}
        <motion.div
          style={{ scaleX: imageScaleX, scaleY: imageScaleY }}
          className="relative w-full h-screen origin-center flex items-center justify-center z-10"
        >
          {/* Rounded Image Card Container (Clipped portrait canvas & white-grey filter overlay) */}
          <div className="relative w-full h-screen rounded-3xl overflow-hidden shadow-2xl z-10">
            {/* A. The WebGL Canvas */}
            <div className="absolute inset-0 z-10 w-full h-full pointer-events-auto">
              <Canvas
                resize={{ offsetSize: true }}
                camera={{ position: [0, 0, 1.8], fov: 45 }}
                gl={{
                  antialias: true,
                  alpha: true,
                  powerPreference: 'high-performance',
                }}
                style={{ width: '100%', height: '100%' }}
              >
                <React.Suspense fallback={null}>
                  <CyborgPlane scrollYProgress={scrollYProgress} />
                </React.Suspense>
              </Canvas>
            </div>

            {/* B. Translucent White-Grey Color Filter Overlay (Preserves 100% face & body visibility) */}
            <motion.div
              style={{ opacity: filterOpacity }}
              className="absolute inset-0 z-20 bg-[#E8E6E1]/35 backdrop-brightness-95 pointer-events-none"
            />
          </div>

          {/* C. The Signature Overlay (Shifted right & down so eyes remain 100% uncovered & visible!) */}
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none translate-x-12 md:translate-x-24 translate-y-12 md:translate-y-24">
            <SignatureOverlay pathLength={signatureDraw} opacity={signatureOpacity} />
          </div>
        </motion.div>

        {/* HTML Overlay Content (z-30 — Top header & bottom copyright in extreme corners) */}
        <div className="absolute inset-0 z-30 w-full h-full px-6 md:px-10 pt-6 md:pt-8 pb-6 md:pb-8 flex flex-col justify-between pointer-events-none">
          {/* Top Header Row — Extreme Top Corners */}
          <div className="flex justify-between items-start">
            <div className="space-y-1 select-none">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-[#00F0FF] leading-[0.88]">
                KARAN<br />SHAKYA
              </h1>
              <p className="text-xs uppercase tracking-[0.25em] text-[#00E5FF]/80 font-bold pt-2">
                AI, ML &amp; Full Stack Developer
              </p>
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#00F0FF]/80 pt-1">
                <svg className="w-3.5 h-3.5 text-[#00F0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Ambala Cantt, Haryana</span>
              </div>
            </div>

            <div className="text-right space-y-1 pointer-events-auto">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#242624]/80 backdrop-blur-md text-[#00F0FF] border border-[#00F0FF]/30">
                <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
                Available for Projects
              </span>
            </div>
          </div>

          {/* Bottom Bar — Extreme Bottom Corners */}
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4 text-xs font-mono text-[#00E5FF]/70">
            <div className="flex items-center gap-4 pointer-events-auto">
              <span>© 2026 Karan Shakya. All Rights Reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
