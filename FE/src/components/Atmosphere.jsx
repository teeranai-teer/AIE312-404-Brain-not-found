import { useEffect, useRef } from 'react';

// พื้นหลังห้องสืบสวน: กระดานหลักฐาน (โน้ต เชือกแดง หมุด) แสงตะเกียง หมอก ฝุ่นลอย และใยแมงมุม
// เป็นของตกแต่งล้วน ๆ จึงใส่ aria-hidden ให้โปรแกรมอ่านหน้าจอข้ามไป
// ธีม Light Paper ซ่อนทั้งหมดด้วย CSS (.theme-light .atmosphere)

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Atmosphere() {
  const wallRef = useRef(null);
  const canvasRef = useRef(null);

  // กระดานขยับสวนทางเมาส์เล็กน้อย ให้รู้สึกมีมิติ
  useEffect(() => {
    const wall = wallRef.current;
    if (!wall || reducedMotion()) return;
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        wall.style.setProperty('--board-x', `${(e.clientX / innerWidth - 0.5) * -9}px`);
        wall.style.setProperty('--board-y', `${(e.clientY / innerHeight - 0.5) * -7}px`);
        raf = 0;
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ฝุ่นลอยขึ้นช้า ๆ วาดบน canvas หยุดวาดเมื่อสลับไปแท็บอื่น
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion()) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = innerWidth;
      h = innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(65, Math.max(20, Math.round((w * h) / 19000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.35 + Math.random() * 1.25,
        v: 0.12 + Math.random() * 0.28,
        phase: Math.random() * Math.PI * 2,
        a: 0.1 + Math.random() * 0.32,
      }));
    };

    const draw = (t) => {
      const dt = Math.min((t - last || 16) / 16, 3);
      last = t;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y -= p.v * dt;
        p.x += Math.sin(t * 0.00035 + p.phase) * 0.12 * dt;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(244,196,125,${p.a * (0.75 + 0.25 * Math.sin(t * 0.001 + p.phase))})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = 0;
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className="atmosphere" aria-hidden="true">
      <span className="cobweb left" />
      <span className="cobweb right" />

      <div className="evidence-wall" ref={wallRef}>
        <svg className="evidence-strings" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 5 22 L 26 8 L 51 23 L 92 22 L 97 72 L 77 94 L 51 77 L 6 75 L 5 22" />
          <path d="M 5 22 L 51 77 L 92 22 L 26 8 L 97 72" />
          <path d="M 6 75 L 51 23 L 77 94 L 5 22" />
          <path d="M 26 8 L 77 94 L 92 22" />
        </svg>
        <Note cls="n1" small="EVIDENCE / 001" title="CASE NOTES" lines={['เบาะแสจากทีมพัฒนา', 'ตรวจสอบข้อมูลสมาชิก']} />
        <Note cls="n2" small="CLASSIFIED / 02" title="CONNECTED" lines={['Projects & Skills', 'หลักฐานเชื่อมโยงกัน']} />
        <Note cls="n3" small="ARCHIVE / 404" title="WITNESS" lines={['บันทึกการสอบสวน', 'AI INTERROGATION']} />
        <Note cls="n4" small="CASE / 04" title="THE SUSPECTS" lines={['Agent 001 — 002', 'DEVELOPMENT TEAM']} />
        <Note cls="n5" title="TOP SECRET" lines={['AIE312 · 2026']} />
        <Note cls="n6" title="FOLLOW THE CLUES" lines={['CONFIDENTIAL']} />
        <i className="case-pin" style={{ left: '26%', top: '8%' }} />
        <i className="case-pin" style={{ left: '51%', top: '23%' }} />
        <i className="case-pin" style={{ left: '51%', top: '77%' }} />
        <i className="case-pin" style={{ left: '77%', top: '94%' }} />
      </div>

      <div className="victorian-window" />
      <div className="victorian-gaslight" />
      <div className="victorian-fog" />
      <div className="victorian-fog second" />
      <canvas className="dust-canvas" ref={canvasRef} />
    </div>
  );
}

// โน้ตปักหมุดบนกระดาน: บรรทัดแรกกับบรรทัดที่สองคั่นด้วยเส้นขีด
function Note({ cls, small, title, lines }) {
  return (
    <div className={`evidence-note ${cls}`}>
      {small && <small>{small}</small>}
      <strong>{title}</strong>
      {lines[0]}
      {lines[1] && (
        <>
          <div className="scribble" />
          {lines[1]}
        </>
      )}
    </div>
  );
}
