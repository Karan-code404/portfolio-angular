import React, { useRef, useEffect } from 'react';

// ==========================================================================
// LiquidMarbleBackground — Large-Scale Smooth Liquid Marble Swirls
// Low-frequency continuous domain-warped ribbon lines (Zero grain / Zero noise)
// ==========================================================================

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

// Smooth 2D Value Noise with analytical quintic interpolation (C2 continuous)
float hash(vec2 p) {
  p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
  return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

float noise(in vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  // Quintic smoothstep for silky C2 continuity
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i + vec2(0.0, 0.0)), 
                 hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), 
                 hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Low frequency 2-octave smooth FBM (Strictly large shapes, NO micro noise)
float fbm(vec2 p) {
  return 0.65 * noise(p) + 0.35 * noise(p * 2.02 + vec2(2.4, 1.7));
}

void main() {
  // Aspect-ratio normalized coordinates
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  
  // Scale domain for large, broad organic marble ribbons matching the reference image
  p *= 1.4;
  
  float t = u_time * 0.06;

  // Broad 2-Tier Domain Warping (Creates large fluid marble swirls, U-turns, and pools)
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + vec2(t * 0.4, t * 0.2)),
    fbm(p + vec2(4.2, 1.8) + vec2(-t * 0.3, t * 0.35))
  );

  vec2 r = vec2(
    fbm(p + 1.2 * q + vec2(1.7, 9.2) + vec2(t * 0.25, -t * 0.3)),
    fbm(p + 1.2 * q + vec2(8.3, 2.8) + vec2(-t * 0.3, t * 0.2))
  );

  // Large-scale smooth continuous marble field
  float f = fbm(p + 1.3 * r + vec2(t * 0.15, t * 0.15));

  // --- ULTRA-THIN HAIRLINE CONTOUR LINES ---
  // Wide spacing between delicate contour lines
  float numBands = 3.6;
  float wave = f * numBands * 3.14159265;
  
  // Continuous smooth cosine lines (100% solid, unbreakable, no grain)
  float lineVal = cos(wave);
  
  // Ultra-thin delicate hairline profile (exact match to Lando Norris screenshot)
  float line = smoothstep(0.970, 0.998, lineVal);

  // Single Uniform Line Color on Dark Matte Canvas (#141713)
  vec3 bgColor = vec3(0.078, 0.090, 0.075);
  vec3 lineColor = vec3(0.58, 0.66, 0.52);

  vec3 finalColor = mix(bgColor, lineColor, line * 0.90);

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

    let animationFrameId;
    const startTime = performance.now();

    function resize() {
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

    function render(currentTime) {
      const elapsed = (currentTime - startTime) * 0.001;
      gl.uniform1f(uTime, elapsed);
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
