import React, { useRef, useEffect } from 'react';

// ==========================================================================
// CertificatesLiquidBackground — Scroll-Responsive Liquid Water Wave Shader
// Transitions Background from Dark (#141713) to Pure White (#ffffff)
// Transitions Wave Lines from Luminous Dark-Theme to Clean Light-Grey (#d1d5db)
// ==========================================================================

const VERTEX_SHADER = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_progress; // 0.0 (start) to 1.0 (end) scroll progress

varying vec2 vUv;

// --- Simplex 3D Noise (Stefan Gustavson) ---
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

// --------------------------------------------------------------------------
// Real Water Wave Height Function: 4 Random Wandering Dynamic Points
// - 1.5 to 2 Clean Rings Emit & Expand Outward -> Smoothly Shrink Back
// - Natural Collision Merging on Overlap
// --------------------------------------------------------------------------
float getWaterHeight(vec2 p, float t, float aspect) {
  float maxX = 0.5 * aspect * 0.75;
  float maxY = 0.5 * 0.72;

  // 1. Organic current domain warp
  vec2 current = vec2(
    snoise(vec3(p * 0.35, t * 0.006)),
    snoise(vec3(p * 0.35 + vec2(9.2, 14.7), t * 0.006))
  ) * 0.12;

  vec2 wp = p + current;

  // 2. 4 DYNAMICALLY WANDERING POINTS:
  vec2 pt1 = vec2(
    snoise(vec3(t * 0.007, 11.2, 33.4)),
    snoise(vec3(t * 0.007, 44.5, 66.7))
  ) * vec2(maxX, maxY);

  vec2 pt2 = vec2(
    snoise(vec3(t * 0.008, 77.8, 88.9)),
    snoise(vec3(t * 0.008, 99.1, 22.3))
  ) * vec2(maxX, maxY);

  vec2 pt3 = vec2(
    snoise(vec3(t * 0.006, 33.7, 55.9)),
    snoise(vec3(t * 0.006, 66.1, 77.3))
  ) * vec2(maxX, maxY);

  vec2 pt4 = vec2(
    snoise(vec3(t * 0.0075, 88.3, 11.5)),
    snoise(vec3(t * 0.0075, 22.7, 44.9))
  ) * vec2(maxX, maxY);

  // 3. CYCLICAL 1.5 - 2 CLEAN RINGS EMISSION & INWARD SHRINKING:
  float cycleSpeed = 0.025; // Meditative slow speed
  float twoPi = 6.2831853;
  float wavesPhase = 1.75 * twoPi; // Exactly 1.5 - 2 clean rings

  float phase1 = sin(t * cycleSpeed) * wavesPhase;
  float phase2 = sin(t * cycleSpeed + 1.57) * wavesPhase;
  float phase3 = sin(t * cycleSpeed + 3.14) * wavesPhase;
  float phase4 = sin(t * cycleSpeed + 4.71) * wavesPhase;

  float ripFreq = 5.4; // Natural crisp frequency

  // Distances to points
  float r1 = length(wp - pt1);
  float r2 = length(wp - pt2);
  float r3 = length(wp - pt3);
  float r4 = length(wp - pt4);

  // Spatial radial envelopes restricted to 1.5 - 2 rings radius
  float env1 = smoothstep(1.9, 0.15, r1) / (1.0 + r1 * 0.75);
  float env2 = smoothstep(1.9, 0.15, r2) / (1.0 + r2 * 0.75);
  float env3 = smoothstep(1.9, 0.15, r3) / (1.0 + r3 * 0.75);
  float env4 = smoothstep(1.9, 0.15, r4) / (1.0 + r4 * 0.75);

  float wave1 = cos(r1 * ripFreq - phase1) * env1;
  float wave2 = cos(r2 * ripFreq - phase2) * env2;
  float wave3 = cos(r3 * ripFreq - phase3) * env3;
  float wave4 = cos(r4 * ripFreq - phase4) * env4;

  // Subtle ambient swells
  float swell = sin(dot(wp, vec2(0.9, 0.5)) * 1.6 - t * 0.007) * 0.20
              + sin(dot(wp, vec2(-0.6, 1.1)) * 1.4 - t * 0.005 + 1.2) * 0.16;

  float height = (wave1 + wave2 + wave3 + wave4) * 0.58 + swell;
  return height;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;

  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  float t = u_time;
  float waterH = getWaterHeight(p, t, aspect);

  float waveBands = 3.9;
  float val = waterH * waveBands;

  float distToCrest = abs(fract(val - 0.5) - 0.5);
  float fw = fwidth(val);
  float pixelDist = distToCrest / max(fw, 0.00001);

  float lineWidth = 0.65;
  float crestLine = 1.0 - smoothstep(lineWidth - 0.55, lineWidth + 0.55, pixelDist);

  // Dynamic Scroll Progression Interpolation (Dark -> Pure White Background)
  float blendProgress = smoothstep(0.0, 0.55, u_progress);

  // Background: Dark #141713 -> Pure Solid White #ffffff
  vec3 darkBg = vec3(0.078, 0.090, 0.075);
  vec3 whiteBg = vec3(1.0, 1.0, 1.0);
  vec3 currentBg = mix(darkBg, whiteBg, blendProgress);

  // Contour Lines: Dark-Theme Luminous Line -> Light-Grey Line on White #d1d5db
  vec3 darkLine = vec3(0.28, 0.38, 0.34);
  vec3 lightGreyLine = vec3(0.74, 0.77, 0.80); // Crisp elegant light-grey contour line
  vec3 currentLine = mix(darkLine, lightGreyLine, blendProgress);

  vec3 finalColor = mix(currentBg, currentLine, crestLine * 0.85);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function CertificatesLiquidBackground({ scrollYProgress }) {
  const canvasRef = useRef(null);
  const scrollProgressRef = useRef(0);

  // Listen to framer-motion scrollYProgress changes
  useEffect(() => {
    if (!scrollYProgress) return;
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      scrollProgressRef.current = latest;
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { 
      antialias: true, 
      powerPreference: 'high-performance',
      depth: false,
      stencil: false,
    }) || canvas.getContext('experimental-webgl');

    if (!gl) return;

    gl.getExtension('OES_standard_derivatives');

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uProgress = gl.getUniformLocation(program, 'u_progress');

    let animationFrameId;
    const startTime = performance.now();

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    }

    resize();
    window.addEventListener('resize', resize);

    function render(currentTime) {
      const elapsed = (currentTime - startTime) * 0.001;
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uProgress, scrollProgressRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
