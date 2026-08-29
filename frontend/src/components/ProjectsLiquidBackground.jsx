import React, { useRef, useEffect } from 'react';

// ==========================================================================
// ProjectsLiquidBackground — High-End WebGL Topographic Contour Fluid Shader
// Massive Noise Scale (Zoomed in), Directional Drift + Morphing,
// Spacious Line Thresholds, and Anti-Aliased 1px Crisp Contour Lines
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
uniform vec2 u_mouse;

varying vec2 vUv;

// --- Simplex 3D Noise for organic fluid drift ---
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
// - 2 Source Emitters (Waves generate & expand outward)
// - 2 Sinks / Absorbers (Waves converge & shrink inward into the center)
// --------------------------------------------------------------------------
float getWaterHeight(vec2 p, vec2 mouseP, float t, float aspect) {
  // Visible screen boundaries with safe margin
  float maxX = 0.5 * aspect * 0.75;
  float maxY = 0.5 * 0.72;

  // 1. Organic current domain warp (ultra-slow serene water currents)
  vec2 current = vec2(
    snoise(vec3(p * 0.35, t * 0.006)),
    snoise(vec3(p * 0.35 + vec2(9.2, 14.7), t * 0.006))
  ) * 0.12;

  vec2 wp = p + current;

  // 2. 4 DYNAMICALLY WANDERING POINTS ACROSS VISIBLE SCREEN:
  // Each point smoothly wanders around the screen
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
  float cycleSpeed = 0.025; // Deep meditative ultra-slow wave motion (~125s cycle)
  float twoPi = 6.2831853;
  float wavesPhase = 1.75 * twoPi; // Exactly 1.5 to 2 clean rings

  float phase1 = sin(t * cycleSpeed) * wavesPhase;
  float phase2 = sin(t * cycleSpeed + 1.57) * wavesPhase;
  float phase3 = sin(t * cycleSpeed + 3.14) * wavesPhase;
  float phase4 = sin(t * cycleSpeed + 4.71) * wavesPhase;

  float ripFreq = 5.4; // Crisp natural water ripple frequency (not widened)

  // Distances to the 4 points
  float r1 = length(wp - pt1);
  float r2 = length(wp - pt2);
  float r3 = length(wp - pt3);
  float r4 = length(wp - pt4);

  // Spatial radial envelopes strictly restricted to 1.5 - 2 rings radius
  float env1 = smoothstep(1.9, 0.15, r1) / (1.0 + r1 * 0.75);
  float env2 = smoothstep(1.9, 0.15, r2) / (1.0 + r2 * 0.75);
  float env3 = smoothstep(1.9, 0.15, r3) / (1.0 + r3 * 0.75);
  float env4 = smoothstep(1.9, 0.15, r4) / (1.0 + r4 * 0.75);

  // Oscillating 3-wave pulses (expand outward -> shrink back into center)
  float wave1 = cos(r1 * ripFreq - phase1) * env1;
  float wave2 = cos(r2 * ripFreq - phase2) * env2;
  float wave3 = cos(r3 * ripFreq - phase3) * env3;
  float wave4 = cos(r4 * ripFreq - phase4) * env4;

  // Subtle ultra-slow directional ambient ocean swells
  float swell = sin(dot(wp, vec2(0.9, 0.5)) * 1.6 - t * 0.06) * 0.20
              + sin(dot(wp, vec2(-0.6, 1.1)) * 1.4 - t * 0.05 + 1.2) * 0.16;

  // Ultra-subtle, near-zero mouse ripple (na ke barabar)
  float rMouse = length(wp - mouseP);
  float mouseRipple = cos(rMouse * 3.5 - t * 0.2) * exp(-rMouse * 6.0) * 0.02;

  // 4. SEAMLESS WAVE COLLISION & MERGING:
  // Superposition of wave fields naturally merges overlapping lines where wave fronts collide
  float height = (wave1 + wave2 + wave3 + wave4) * 0.58
               + swell
               + mouseRipple;

  return height;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;

  // Aspect-corrected coordinate space (centered)
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // Aspect-corrected mouse position
  vec2 mouseP = (u_mouse * u_resolution.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  float t = u_time;

  // Calculate real water surface elevation with 2 emitters + 2 inward sinks
  float waterH = getWaterHeight(p, mouseP, t, aspect);

  // 1.1x wider contour spacing
  float waveBands = 3.9; 
  float val = waterH * waveBands;

  // Exact sub-pixel derivative distance for anti-aliasing
  float distToCrest = abs(fract(val - 0.5) - 0.5);
  float fw = fwidth(val);
  float pixelDist = distToCrest / max(fw, 0.00001);

  // Ultra-crisp 1.2px anti-aliased water wave lines
  float lineWidth = 0.65;
  float crestLine = 1.0 - smoothstep(lineWidth - 0.55, lineWidth + 0.55, pixelDist);

  // Subtle water surface shading & depth
  float waterDepth = clamp(waterH * 0.12 + 0.05, 0.0, 0.25);
  
  // Pure minimalist palette: Pure white base with ultra-crisp black water ripples
  vec3 pureWhite = vec3(1.0, 1.0, 1.0);
  vec3 waterTint = vec3(0.96, 0.985, 1.0); // Whisper-subtle crystalline water tint
  vec3 rippleColor = vec3(0.04, 0.05, 0.07); // Rich ink black crest lines

  vec3 baseColor = mix(pureWhite, waterTint, waterDepth);
  vec3 finalColor = mix(baseColor, rippleColor, crestLine * 0.90);

  gl_FragColor = vec4(finalColor, 1.0);
}

`;

export default function ProjectsLiquidBackground() {
  const canvasRef = useRef(null);
  const mousePosRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      antialias: true,
      powerPreference: 'high-performance',
      depth: false,
      stencil: false,
      alpha: true,
    }) || canvas.getContext('experimental-webgl');

    if (!gl) return;

    // Enable standard derivatives extension for fwidth() support in WebGL 1.0
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
    const uMouse = gl.getUniformLocation(program, 'u_mouse');

    let animationFrameId;
    const startTime = performance.now();

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    }

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1.0 - (e.clientY - rect.top) / rect.height; // WebGL inverted Y
        mousePosRef.current.targetX = Math.max(0, Math.min(1, x));
        mousePosRef.current.targetY = Math.max(0, Math.min(1, y));
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    function render(currentTime) {
      const elapsed = (currentTime - startTime) * 0.001;

      // Smooth, gentle mouse dampening (no sudden jumps or wave shaking)
      const m = mousePosRef.current;
      m.x += (m.targetX - m.x) * 0.025;
      m.y += (m.targetY - m.y) * 0.025;

      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, m.x, m.y);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
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
      style={{ display: 'block' }}
    />
  );
}

