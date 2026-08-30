import React, { useRef, useEffect } from 'react';

// ==========================================================================
// LiquidMarbleBackground — Single Global WebGL Water Wave Background
// - ONE unified continuous wave physics simulation across the entire portfolio
// - Smoothly transitions Dark (#141713) -> Pure White (#ffffff) in Certificates
// - Stays Pure White throughout the Featured Projects section
// - Returns smoothly to Dark (#141713) for Contact footer
// - Wave lines transition to crisp Light Grey (#d1d5db) on white background
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
uniform float u_whiteProgress; // 0.0 = Dark (#141713), 1.0 = Pure White (#ffffff)

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
// - Strictly 1.5 to 2 Clean Rings Emit & Expand Outward -> Smoothly Shrink Back
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
  float cycleSpeed = 0.025; // Meditative slow speed (~125s cycle)
  float twoPi = 6.2831853;
  float wavesPhase = 1.75 * twoPi; // Strictly 1.5 to 2 clean rings

  float phase1 = sin(t * cycleSpeed) * wavesPhase;
  float phase2 = sin(t * cycleSpeed + 1.57) * wavesPhase;
  float phase3 = sin(t * cycleSpeed + 3.14) * wavesPhase;
  float phase4 = sin(t * cycleSpeed + 4.71) * wavesPhase;

  float ripFreq = 5.4; // Crisp natural water ripple frequency

  // Distances to points
  float r1 = length(wp - pt1);
  float r2 = length(wp - pt2);
  float r3 = length(wp - pt3);
  float r4 = length(wp - pt4);

  // Spatial radial envelopes strictly restricted to 1.5 - 2 rings radius
  float env1 = smoothstep(1.9, 0.15, r1) / (1.0 + r1 * 0.75);
  float env2 = smoothstep(1.9, 0.15, r2) / (1.0 + r2 * 0.75);
  float env3 = smoothstep(1.9, 0.15, r3) / (1.0 + r3 * 0.75);
  float env4 = smoothstep(1.9, 0.15, r4) / (1.0 + r4 * 0.75);

  float wave1 = cos(r1 * ripFreq - phase1) * env1;
  float wave2 = cos(r2 * ripFreq - phase2) * env2;
  float wave3 = cos(r3 * ripFreq - phase3) * env3;
  float wave4 = cos(r4 * ripFreq - phase4) * env4;

  // Subtle ultra-slow ambient ocean swells
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

  // Multi-Stop Perceptually Linear Color Progression:
  // 0.00: Deep Luxury Dark (#141713)
  // 0.20: Rich Forest Slate (#242d27)
  // 0.40: Mid Moss Slate (#425047)
  // 0.60: Soft Sage Mist (#738379)
  // 0.80: Silver Sage Platinum (#b8c5be)
  // 1.00: Pure Radiant Solid White (#ffffff)
  vec3 c0 = vec3(0.078, 0.090, 0.075);
  vec3 c1 = vec3(0.141, 0.176, 0.153);
  vec3 c2 = vec3(0.259, 0.314, 0.278);
  vec3 c3 = vec3(0.451, 0.514, 0.475);
  vec3 c4 = vec3(0.722, 0.773, 0.745);
  vec3 c5 = vec3(1.000, 1.000, 1.000);

  vec3 currentBg;
  float progress = clamp(u_whiteProgress, 0.0, 1.0);
  if (progress < 0.20) {
    currentBg = mix(c0, c1, progress / 0.20);
  } else if (progress < 0.40) {
    currentBg = mix(c1, c2, (progress - 0.20) / 0.20);
  } else if (progress < 0.60) {
    currentBg = mix(c2, c3, (progress - 0.40) / 0.20);
  } else if (progress < 0.80) {
    currentBg = mix(c3, c4, (progress - 0.60) / 0.20);
  } else {
    currentBg = mix(c4, c5, (progress - 0.80) / 0.20);
  }

  // Wave Lines Progression (Synchronized through each shade to #d1d5db on white)
  vec3 l0 = vec3(0.220, 0.298, 0.259);
  vec3 l1 = vec3(0.290, 0.384, 0.337);
  vec3 l2 = vec3(0.408, 0.510, 0.459);
  vec3 l3 = vec3(0.549, 0.627, 0.580);
  vec3 l4 = vec3(0.706, 0.761, 0.725);
  vec3 l5 = vec3(0.820, 0.835, 0.859); // Crisp Light Grey (#d1d5db)

  vec3 currentLine;
  if (progress < 0.20) {
    currentLine = mix(l0, l1, progress / 0.20);
  } else if (progress < 0.40) {
    currentLine = mix(l1, l2, (progress - 0.20) / 0.20);
  } else if (progress < 0.60) {
    currentLine = mix(l2, l3, (progress - 0.40) / 0.20);
  } else if (progress < 0.80) {
    currentLine = mix(l3, l4, (progress - 0.60) / 0.20);
  } else {
    currentLine = mix(l4, l5, (progress - 0.80) / 0.20);
  }

  vec3 finalColor = mix(currentBg, currentLine, crestLine * 0.85);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function LiquidMarbleBackground() {
  const canvasRef = useRef(null);

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
    const uWhiteProgress = gl.getUniformLocation(program, 'u_whiteProgress');

    let animationFrameId;
    const startTime = performance.now();
    let currentWhiteProgress = 0.0;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    }

    resize();
    window.addEventListener('resize', resize);

    // Compute dynamic white transition factor based on page scroll
    function computeWhiteProgress() {
      const certEl = document.getElementById('certifications');
      const trackEl = document.getElementById('on-off-track');
      const projectsEl = document.getElementById('projects');
      const contactEl = document.getElementById('contact');

      const winHeight = window.innerHeight || 1;
      let target = 0.0;

      if (certEl) {
        const certRect = certEl.getBoundingClientRect();
        const certTotalScrollable = certEl.offsetHeight - winHeight;

        if (certRect.top <= 0 && certRect.bottom >= 0 && certTotalScrollable > 0) {
          // Inside horizontal scroll of Certificates:
          // Direct 1:1 linear mapping from 0.0 to 1.0 across the full scroll journey
          const rawProgress = Math.min(Math.max(-certRect.top / certTotalScrollable, 0), 1);
          target = rawProgress;
        } else if (certRect.bottom < 0) {
          // Past Certificates -> User is in On/Off Track or Projects section (Pure White)!
          target = 1.0;
        }
      }

      // Keep solid white while in On/Off Track section
      if (trackEl) {
        const trackRect = trackEl.getBoundingClientRect();
        if (trackRect.top < winHeight && trackRect.bottom > 0) {
          target = 1.0;
        }
      }

      // Keep solid white while in Projects section
      if (projectsEl) {
        const projRect = projectsEl.getBoundingClientRect();
        if (projRect.top < winHeight && projRect.bottom > 0) {
          target = 1.0;
        }
      }

      // Smoothly fade back to dark when entering Contact section
      if (contactEl) {
        const contactRect = contactEl.getBoundingClientRect();
        if (contactRect.top < winHeight) {
          const fadeToDark = Math.min(Math.max((winHeight - contactRect.top) / (winHeight * 0.6), 0), 1);
          target = Math.max(0.0, target * (1.0 - fadeToDark));
        }
      }

      return target;
    }

    function render(currentTime) {
      const elapsed = (currentTime - startTime) * 0.001;
      const targetWhite = computeWhiteProgress();
      // Responsive interpolation for immediate real-time visual feedback on scroll
      currentWhiteProgress += (targetWhite - currentWhiteProgress) * 0.25;

      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uWhiteProgress, currentWhiteProgress);
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
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
