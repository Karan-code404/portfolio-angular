import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

// Character-by-character staggered rolling text link on hover
function StaggeredTextLink({ href, text, target }) {
  const isExternal = href.startsWith('http');
  return (
    <a
      href={href}
      target={target || (isExternal ? '_blank' : '_self')}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group relative inline-block overflow-hidden font-black text-lg sm:text-xl md:text-2xl lg:text-[1.85rem] text-white uppercase tracking-tight leading-[1.08] cursor-pointer text-center"
    >
      <span className="inline-flex">
        {text.split('').map((char, i) => (
          <span
            key={i}
            className="inline-block relative overflow-hidden h-[1.18em]"
          >
            {/* Top base character that drops down on hover */}
            <span
              className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-full text-white"
              style={{ transitionDelay: `${i * 28}ms` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
            {/* Duplicate character coming down from above with accent color */}
            <span
              className="inline-block absolute top-0 left-0 transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] -translate-y-full group-hover:translate-y-0 text-cyan-400 font-black"
              style={{ transitionDelay: `${i * 28}ms` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          </span>
        ))}
      </span>
    </a>
  );
}

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

varying vec2 vUv;

// --- Simplex 3D Noise ---
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

float getWaterHeight(vec2 p, float t, float aspect) {
  float maxX = 0.5 * aspect * 0.75;
  float maxY = 0.5 * 0.72;

  vec2 current = vec2(
    snoise(vec3(p * 0.35, t * 0.006)),
    snoise(vec3(p * 0.35 + vec2(9.2, 14.7), t * 0.006))
  ) * 0.12;

  vec2 wp = p + current;

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

  float cycleSpeed = 0.025;
  float twoPi = 6.2831853;
  float wavesPhase = 1.75 * twoPi;

  float phase1 = sin(t * cycleSpeed) * wavesPhase;
  float phase2 = sin(t * cycleSpeed + 1.57) * wavesPhase;
  float phase3 = sin(t * cycleSpeed + 3.14) * wavesPhase;
  float phase4 = sin(t * cycleSpeed + 4.71) * wavesPhase;

  float ripFreq = 5.4;

  float r1 = length(wp - pt1);
  float r2 = length(wp - pt2);
  float r3 = length(wp - pt3);
  float r4 = length(wp - pt4);

  float env1 = smoothstep(1.9, 0.15, r1) / (1.0 + r1 * 0.75);
  float env2 = smoothstep(1.9, 0.15, r2) / (1.0 + r2 * 0.75);
  float env3 = smoothstep(1.9, 0.15, r3) / (1.0 + r3 * 0.75);
  float env4 = smoothstep(1.9, 0.15, r4) / (1.0 + r4 * 0.75);

  float wave1 = cos(r1 * ripFreq - phase1) * env1;
  float wave2 = cos(r2 * ripFreq - phase2) * env2;
  float wave3 = cos(r3 * ripFreq - phase3) * env3;
  float wave4 = cos(r4 * ripFreq - phase4) * env4;

  float swell = sin(dot(wp, vec2(0.9, 0.5)) * 1.6 - t * 0.007) * 0.20
              + sin(dot(wp, vec2(-0.6, 1.1)) * 1.4 - t * 0.005 + 1.2) * 0.16;

  float height = (wave1 + wave2 + wave3 + wave4) * 0.58 + swell;
  return height;
}

void main() {
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

  // Deep luxury dark background (#141713)
  vec3 darkBg = vec3(0.078, 0.090, 0.075);
  // Organic wave line color (#384c42)
  vec3 lineCol = vec3(0.220, 0.298, 0.259);

  vec3 finalColor = mix(darkBg, lineCol, crestLine * 0.85);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function HeroFooter({ onOpenContact }) {
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

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

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
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
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
    <section
      id="ending-hero"
      className="relative w-full min-h-screen h-screen py-2 sm:py-3 px-3 sm:px-5 md:px-6 flex flex-col justify-between items-center select-none overflow-hidden"
      style={{
        minHeight: '100vh',
        height: '100vh',
        width: '100%',
        position: 'relative',
        background: 'linear-gradient(180deg, #f0fdff 0%, #daf7fc 20%, #7ee5f4 55%, #22d3ee 80%, #00F0FF 100%)',
      }}
    >
      {/* Top Header Bar in Outer Cyan Margin */}
      <div className="relative z-10 w-full flex items-center justify-between px-3 sm:px-6 pt-1 sm:pt-2">
        <span 
          className="text-lg sm:text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none"
          style={{ fontFamily: "'Bodoni Moda', 'Playfair Display', serif" }}
        >
          KARAN SHAKYA
        </span>
      </div>

      {/* ================================================================= */}
      {/* SVG Clip Path Definition with Smaller Top Notch & Larger Bottom Tab */}
      {/* ================================================================= */}
      <svg width="0" height="0" className="absolute pointer-events-none" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <clipPath id="lando-dual-notch" clipPathUnits="objectBoundingBox">
            <path d="
              M 0, 0.075
              C 0, 0.045 0.015, 0.032 0.04, 0.032
              L 0.37, 0.032
              C 0.39, 0.032 0.40, 0.00 0.42, 0.00
              L 0.58, 0.00
              C 0.60, 0.00 0.61, 0.032 0.63, 0.032
              L 0.96, 0.032
              C 0.985, 0.032 1.00, 0.045 1.00, 0.075
              L 1.00, 0.92
              C 1.00, 0.945 0.985, 0.96 0.96, 0.96
              L 0.84, 0.96
              C 0.81, 0.96 0.795, 1.00 0.765, 1.00
              L 0.235, 1.00
              C 0.205, 1.00 0.19, 0.96 0.16, 0.96
              L 0.04, 0.96
              C 0.015, 0.96 0, 0.945 0, 0.92
              Z
            " />
          </clipPath>
        </defs>
      </svg>

      {/* ================================================================= */}
      {/* Shaped Black Container Box with Dual Boxy Top & Bottom Notches    */}
      {/* ================================================================= */}
      <div
        className="relative w-[96vw] sm:w-[94vw] md:w-[92vw] lg:w-[91vw] xl:w-[90vw] max-w-[1650px] h-[84vh] sm:h-[86vh] md:h-[88vh] mx-auto overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.5)] bg-[#141713] flex items-center justify-center my-auto"
        style={{
          clipPath: 'url(#lando-dual-notch)',
          WebkitClipPath: 'url(#lando-dual-notch)',
        }}
      >
        {/* Dedicated Liquid Marble Wave Motion Canvas inside the Shaped Black Box */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Ambient Subtle Vignette Overlay inside */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* =============================================================== */}
        {/* Top Hierarchy Stack: Signature at the Top & Main Text Above Head*/}
        {/* =============================================================== */}
        <div className="absolute top-[5%] sm:top-[6%] md:top-[7%] inset-x-0 z-20 flex flex-col items-center justify-center text-center pointer-events-none select-none px-4">
          {/* 1. Cursive Signature directly above the text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mb-1"
          >
            <span
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.6)] tracking-wide"
              style={{ fontFamily: "'Caveat', 'Reenie Beanie', cursive" }}
            >
              Karan Shakya
            </span>
          </motion.div>

          {/* 2. Main Statement Typography right above the portrait head */}
          <div className="flex flex-col items-center justify-center font-black uppercase tracking-tight leading-[0.92] select-none text-[clamp(1.8rem,4.2vw,3.8rem)]">
            {/* Line 1 */}
            <div className="flex items-center justify-center gap-[0.25em] whitespace-nowrap">
              <span className="text-[#F1F5F9] drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                ALWAYS
              </span>
              <span
                className="text-cyan-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.5)] italic font-serif"
                style={{ fontFamily: "'Bodoni Moda', 'Playfair Display', serif" }}
              >
                EXCITED TO
              </span>
            </div>

            {/* Line 2 */}
            <div className="flex items-center justify-center gap-[0.25em] whitespace-nowrap mt-0.5">
              <span className="text-[#F1F5F9] drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                LEARN
              </span>
              <span
                className="text-cyan-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.5)] italic font-serif"
                style={{ fontFamily: "'Bodoni Moda', 'Playfair Display', serif" }}
              >
                NEW.
              </span>
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* Left Side: Pages Navigation Links with Staggered Character Flip */}
        {/* =============================================================== */}
        <div className="absolute left-[5%] sm:left-[8%] md:left-[10%] lg:left-[12%] top-1/2 -translate-y-1/2 z-20 flex flex-col items-center text-center pointer-events-auto select-none">
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.25em] text-slate-400 mb-2 sm:mb-3 text-center">
            PAGES
          </span>
          <div className="flex flex-col gap-1 sm:gap-1.5 items-center text-center">
            <StaggeredTextLink href="#about" text="HOME" />
            <StaggeredTextLink href="#about" text="ABOUT" />
            <StaggeredTextLink href="#skills" text="SKILLS" />
            <StaggeredTextLink href="#certifications" text="CERTIFICATES" />
            <StaggeredTextLink href="#projects" text="PROJECTS" />
          </div>
        </div>

        {/* =============================================================== */}
        {/* Right Side: Follow On Links with Staggered Character Flip Wave  */}
        {/* =============================================================== */}
        <div className="absolute right-[5%] sm:right-[8%] md:right-[10%] lg:right-[12%] top-1/2 -translate-y-1/2 z-20 flex flex-col items-center text-center pointer-events-auto select-none">
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.25em] text-slate-400 mb-2 sm:mb-3 text-center">
            FOLLOW ON
          </span>
          <div className="flex flex-col gap-1 sm:gap-1.5 items-center text-center">
            <StaggeredTextLink
              href="https://www.instagram.com/karan_shakya_xo/"
              text="INSTAGRAM"
            />
            <StaggeredTextLink
              href="https://www.linkedin.com/in/karan-shakya-02a20726b/"
              text="LINKEDIN"
            />
          </div>
        </div>

        {/* =============================================================== */}
        {/* Central Foreground Portrait (Scaled & Centered Bottom)          */}
        {/* =============================================================== */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-center pointer-events-none select-none"
        >
          <img
            src="/karanface1.png"
            alt="Karan Shakya"
            className="h-[54vh] sm:h-[60vh] md:h-[65vh] lg:h-[68vh] max-h-[70vh] w-auto max-w-none object-contain object-bottom pointer-events-none select-none drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]"
          />
        </motion.div>

        {/* =============================================================== */}
        {/* Center Bottom Contact Boxy Button with Staggered Character Flip */}
        {/* =============================================================== */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none">
          <button
            onClick={onOpenContact}
            className="group relative flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 transform hover:scale-[1.04] active:scale-95 shadow-[0_6px_28px_rgba(6,182,212,0.5)] border border-cyan-300/80 cursor-pointer overflow-hidden"
          >
            <span className="inline-flex font-mono font-black tracking-wider">
              {'CONTACT ME'.split('').map((char, i) => (
                <span
                  key={i}
                  className="inline-block relative overflow-hidden h-[1.2em]"
                >
                  {/* Base character dropping down on hover */}
                  <span
                    className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-full text-slate-950"
                    style={{ transitionDelay: `${i * 24}ms` }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                  {/* Duplicate character coming down from above */}
                  <span
                    className="inline-block absolute top-0 left-0 transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] -translate-y-full group-hover:translate-y-0 text-slate-950 font-black"
                    style={{ transitionDelay: `${i * 24}ms` }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                </span>
              ))}
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-950 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* Bottom Footer Bar in Outer Cyan Margin */}
      <div className="relative z-10 w-full flex items-center justify-between px-3 sm:px-6 pb-1 sm:pb-2 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-900/80">
        <div>
          &copy; {new Date().getFullYear()} Karan Shakya. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <a href="#about" className="hover:text-black transition-colors">PRIVACY POLICY</a>
          <a href="#about" className="hover:text-black transition-colors">TERMS</a>
        </div>
      </div>
    </section>
  );
}
