import { useEffect } from 'react';
import splashSrc from '../assets/ink-splash.png';

// หมึกแดงกระเซ็นเมื่อคลิกปุ่มหรือลิงก์ (ไม่ใช่ทุกจุดบนหน้า)
// สร้าง element ชั่วคราวแล้วลบทิ้งหลังแอนิเมชันจบ ไม่ไปยุ่งกับ React state
// ปิดเองถ้าผู้ใช้ตั้งค่าเครื่องให้ลดการเคลื่อนไหว
const CONTROLS = 'button, a[href], [role="button"], .history-item, .choice, .case-folder';

function burst(x, y, scale, rot) {
  const wrap = document.createElement('div');
  wrap.className = 'ink-burst';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.style.left = `${x}px`;
  wrap.style.top = `${y}px`;

  const splash = (cls, size, angle) => {
    const img = document.createElement('img');
    img.className = cls;
    img.src = splashSrc;
    img.alt = '';
    img.style.width = img.style.height = `${size * scale}px`;
    img.style.setProperty('--rot', `${angle}deg`);
    return img;
  };
  wrap.append(splash('ink-splash', 150, rot), splash('ink-splash echo', 122, rot + 10));

  // หยดหมึกเล็ก ๆ กระจายออกรอบทิศ
  for (let i = 0; i < 8; i++) {
    const drop = document.createElement('span');
    drop.className = 'ink-drop';
    const angle = ((Math.PI * 2) / 8) * i + Math.random() * 0.35;
    const dist = (28 + Math.random() * 48) * scale;
    const size = (7 + Math.random() * 9) * scale;
    drop.style.width = drop.style.height = `${size}px`;
    drop.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    drop.style.setProperty('--dy', `${Math.sin(angle) * dist + 10}px`);
    drop.style.animationDelay = `${i * 16}ms`;
    wrap.appendChild(drop);
  }

  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 1300);
}

export default function InkSplash() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let last = 0;

    const onClick = (e) => {
      if (reduced.matches) return;
      const target = e.target?.closest?.(CONTROLS);
      if (!target || target.disabled) return;
      const now = performance.now();
      if (now - last < 65) return; // กันคลิกรัว
      last = now;

      // กดด้วยคีย์บอร์ด (ไม่มีพิกัดเมาส์) → ใช้กึ่งกลางของปุ่มแทน
      const r = target.getBoundingClientRect();
      const keyboard = e.detail === 0;
      const x = keyboard ? r.left + r.width / 2 : e.clientX;
      const y = keyboard ? r.top + r.height / 2 : e.clientY;
      const scale = Math.max(0.6, Math.min(1.1, (Math.min(r.width, r.height) || 60) / 70));
      burst(x, y, scale, Math.round(Math.random() * 36 - 18));
    };

    document.addEventListener('click', onClick, { capture: true, passive: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
