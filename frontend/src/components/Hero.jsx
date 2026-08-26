import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
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
  uniform vec2      uMouse;             // viewport UV [0,1], y-flipped
  uniform float     uTime;
  uniform float     uParallaxStrength;
  uniform float     uScreenAspect;      // viewport width / height
  uniform float     uImageAspect;       // source image width / height

  varying vec2 vUv;

  ${simplexNoiseGLSL}

  void main() {
    // =============================================================
    // 1. BROAD LIQUID WAVE FLUID FIELD  (visible grey waves matching screenshot)
    // =============================================================
    vec2 waveUV1 = vUv * 1.8 + vec2(sin(uTime * 0.08 + vUv.y * 1.8) * 0.45, uTime * 0.05);
    vec2 waveUV2 = vUv * 3.2 + vec2(-uTime * 0.06, cos(uTime * 0.07 + vUv.x * 2.2) * 0.40) + 73.0;

    float n1 = snoise(vec3(waveUV1, uTime * 0.10));
    float n2 = snoise(vec3(waveUV2, uTime * 0.08));

    float wavePattern = (n1 * 0.6 + n2 * 0.4) * 0.5 + 0.5;
    float bgWaveMask  = smoothstep(0.40, 0.60, wavePattern);

    // =============================================================
    // 2. MAP VIEWPORT UV → FACE IMAGE UV  (faceScale = 0.95, 5cm top gap)
    // =============================================================
    float faceScale        = 0.95;
    float faceWidthInView  = faceScale * uImageAspect / uScreenAspect;

    vec2 faceUV = vec2(
      (vUv.x - 0.5) / faceWidthInView  + 0.5,
      (vUv.y - 0.45) / faceScale       + 0.5
    );

    float edgeFade = smoothstep(0.0, 0.015, faceUV.x) * smoothstep(1.0, 0.985, faceUV.x)
                   * smoothstep(0.0, 0.015, faceUV.y) * smoothstep(1.0, 0.985, faceUV.y);

    // =============================================================
    // 3. ORGANIC FLUID DROPLET CUTOUT MASK (Exact Lando Norris Screenshot Effect)
    // =============================================================
    // Multi-octave organic droplet noise drifting across portrait
    vec2 dropUV1 = faceUV * 4.2 + vec2(sin(uTime * 0.14 + faceUV.y * 2.0) * 0.4, uTime * 0.08);
    vec2 dropUV2 = faceUV * 8.5 + vec2(-uTime * 0.10, cos(uTime * 0.12 + faceUV.x * 3.0) * 0.3) + 31.4;

    float dNoise1 = snoise(vec3(dropUV1, uTime * 0.12));
    float dNoise2 = snoise(vec3(dropUV2, uTime * 0.15));
    float dropPattern = (dNoise1 * 0.65 + dNoise2 * 0.35) * 0.5 + 0.5;

    // Distance attractor to mouse cursor
    vec2 mouseFaceUV = vec2(
      (uMouse.x - 0.5) / faceWidthInView + 0.5,
      (uMouse.y - 0.45) / faceScale      + 0.5
    );
    vec2 delta = faceUV - mouseFaceUV;
    delta.x *= uImageAspect;
    float mouseDist = length(delta);
    float mouseAttractor = smoothstep(0.40, 0.05, mouseDist);

    // Organic fluid droplet cutout threshold (creates distinct droplet cutout windows on face)
    float dropletVal = dropPattern * 0.55 + mouseAttractor * 0.65;
    float dropCutoutMask = smoothstep(0.50, 0.58, dropletVal);

    // Light glowing rim stroke around the fluid droplet cutouts
    float dropBorder = smoothstep(0.48, 0.50, dropCutoutMask) - smoothstep(0.50, 0.56, dropCutoutMask);
    vec3 borderRimRGB = vec3(0.92, 0.94, 0.96) * dropBorder * 0.70;

    // =============================================================
    // 4. DEPTH PARALLAX & TEXTURE SAMPLING
    // =============================================================
    vec2 clampedFaceUV = clamp(faceUV, 0.0, 1.0);
    float depth        = texture2D(uDepthTex, clampedFaceUV).r;
    vec2  pOff         = (uMouse - 0.5) * depth * uParallaxStrength;

    vec4 humanColor   = texture2D(uHumanTex,   clamp(clampedFaceUV - pOff,       0.0, 1.0));
    vec4 robotColor   = texture2D(uRobotTex,   clamp(clampedFaceUV - pOff * 1.4, 0.0, 1.0));
    vec4 networkColor = texture2D(uNetworkTex, clamp(clampedFaceUV - pOff,       0.0, 1.0));

    humanColor.a   *= edgeFade;
    robotColor.a   *= edgeFade;
    networkColor.a *= edgeFade;

    // Holographic scanner wave
    float flow = fract(faceUV.y + uTime * 0.22);
    float band = smoothstep(0.0, 0.14, flow) * (1.0 - smoothstep(0.14, 0.32, flow));
    float leadingGlow = smoothstep(0.09, 0.14, flow) * (1.0 - smoothstep(0.14, 0.19, flow));
    vec3 hologramRGB = networkColor.rgb * (band * 1.6 + leadingGlow * 0.9) * networkColor.a;

    vec3 baseHumanRGB = humanColor.rgb + hologramRGB;

    // Inside the organic fluid droplet cutouts, robot face is revealed with rim stroke!
    vec3 faceRGB   = mix(baseHumanRGB, robotColor.rgb, dropCutoutMask) + borderRimRGB;
    float faceAlpha = humanColor.a;

    // =============================================================
    // 5. LIQUID TOPOGRAPHY CONTOUR LINES & BACKGROUND
    // =============================================================
    float lineScale   = 4.8;
    float fieldVal    = (n1 * 0.65 + n2 * 0.35) * lineScale + (uTime * 0.04);
    float linePattern = abs(sin(fieldVal * 3.14159));
    float lineMask    = smoothstep(0.025, 0.0, linePattern);

    vec3 bgBase    = vec3(0.949, 0.945, 0.929);       // #F2F1ED warm white-grey
    vec3 lineColor = vec3(0.58, 0.57, 0.55);          // soft light-grey contour lines
    vec3 waveGrey  = vec3(0.78, 0.77, 0.75);          // warm grey wave tone

    vec3 bgWithWaves = mix(bgBase, waveGrey, bgWaveMask * 0.55);
    vec3 bgWithLines = mix(bgWithWaves, lineColor, lineMask * 0.35);

    vec3 finalRGB = mix(bgWithLines, faceRGB, faceAlpha);

    gl_FragColor = vec4(finalRGB, 1.0);
  }
`;

// ==========================================================================
// CyborgPlane — full-viewport mesh with noise-fluid shader
// ==========================================================================

function CyborgPlane() {
  const materialRef  = useRef();
  const mouseRaw     = useRef(new THREE.Vector2(0.5, 0.5));
  const mouseCurrent = useRef(new THREE.Vector2(0.5, 0.5));

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

  const planeWidth  = viewport.width;
  const planeHeight = viewport.height;

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
      uMouse:            { value: new THREE.Vector2(0.5, 0.5) },
      uTime:             { value: 0 },
      uParallaxStrength: { value: 0.04 },
      uScreenAspect:     { value: screenAspect },
      uImageAspect:      { value: imageAspect },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [humanTex, robotTex, networkTex, depthTex],
  );

  useFrame((state) => {
    if (!materialRef.current) return;

    // Viewport UV directly — no conversion needed, plane IS the viewport
    const lerpFactor = 0.07;
    mouseCurrent.current.x = THREE.MathUtils.lerp(mouseCurrent.current.x, mouseRaw.current.x, lerpFactor);
    mouseCurrent.current.y = THREE.MathUtils.lerp(mouseCurrent.current.y, mouseRaw.current.y, lerpFactor);

    const u = materialRef.current.uniforms;
    u.uMouse.value.set(mouseCurrent.current.x, mouseCurrent.current.y);
    u.uTime.value         = state.clock.elapsedTime;
    u.uScreenAspect.value = state.viewport.width / state.viewport.height;
    u.uImageAspect.value  = imageAspect;
  });

  return (
    <mesh>
      <planeGeometry args={[planeWidth, planeHeight]} />
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
// FluidLineBackground — swirling contour lines  (z-0, behind canvas)
// ==========================================================================

function FluidLineBackground() {
  const paths = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const y  = 20 + i * 78;
      const a1 = y - 100 + i * 18;
      const a2 = y + 240 - i * 28;
      const a3 = y - 60  + i * 12;
      return `M-100,${y} C260,${a1} 580,${a2} 960,${y} C1200,${a3} 1480,${a2 - 60} 1720,${y - 20} C1860,${a1 + 60} 2020,${y + 30} 2200,${y - 15}`;
    });
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
      {/* Injected keyframes for circular swirl */}
      <style>{`
        @keyframes swirlDrift {
          0%   { transform: scale(1.15) rotate(0deg) translate(0px, 0px); }
          25%  { transform: scale(1.18) rotate(3deg) translate(25px, -15px); }
          50%  { transform: scale(1.15) rotate(0deg) translate(-15px, 20px); }
          75%  { transform: scale(1.18) rotate(-3deg) translate(-25px, -15px); }
          100% { transform: scale(1.15) rotate(0deg) translate(0px, 0px); }
        }
      `}</style>

      <svg
        className="w-full h-full"
        viewBox="0 0 2100 1100"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="fluidMorph" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.006 0.009"
              numOctaves="4"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="45s"
                values="0.006 0.009;0.010 0.013;0.005 0.007;0.008 0.011;0.006 0.009"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="24"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        <g
          filter="url(#fluidMorph)"
          opacity="0.70"
          style={{
            animation: 'swirlDrift 35s ease-in-out infinite',
            transformOrigin: '50% 50%',
          }}
        >
          {paths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#94918C"
              strokeWidth={1.3 + (i % 3) * 0.5}
              strokeDasharray={i % 2 === 0 ? '12 8' : 'none'}
              opacity={0.35 + (i % 4) * 0.12}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

// ==========================================================================
// Hero — Main Exported Section Component
// ==========================================================================

export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#F2F1ED] flex items-center justify-center">
      {/* Dynamic Fluid Topography Lines (SVG behind Canvas, z-0) */}
      <FluidLineBackground />

      {/* Animated Neon Signature Overlay (z-50) */}
      <SignatureOverlay />

      {/* R3F WebGL Canvas (z-10, full-bleed interactive background & portrait) */}
      <div className="absolute inset-0 z-10">
        <Canvas
          camera={{ position: [0, 0, 1.8], fov: 45 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <React.Suspense fallback={null}>
            <CyborgPlane />
          </React.Suspense>
        </Canvas>
      </div>

      {/* HTML Overlay Content (z-20) */}
      <div className="relative z-20 w-full h-full px-6 md:px-10 pt-6 md:pt-8 pb-6 md:pb-8 flex flex-col justify-between pointer-events-none">
        {/* Top Header Row — Extreme Top Corners */}
        <div className="flex justify-between items-start">
          <div className="space-y-1 select-none">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-[#1C1A17] leading-[0.88]">
              KARAN<br />SHAKYA
            </h1>
            <p className="text-xs uppercase tracking-[0.25em] text-[#6B6862] font-bold pt-2">
              AI, ML &amp; Full Stack Developer
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#78756E] pt-1">
              <svg className="w-3.5 h-3.5 text-[#57544E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Ambala Cantt, Haryana</span>
            </div>
          </div>

          <div className="text-right space-y-1 pointer-events-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#E6E4DD]/80 backdrop-blur-md text-[#383632] border border-[#D8D5CC]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Available for Projects
            </span>
          </div>
        </div>

        {/* Bottom Bar — Extreme Bottom Corners */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 text-xs font-mono text-[#6B6862]">
          <div className="flex items-center gap-4 pointer-events-auto">
            <span>© 2026 Karan Shakya. All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
