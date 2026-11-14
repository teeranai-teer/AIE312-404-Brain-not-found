import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getPortfolio } from './api.js';

// โหลด /api/portfolio ครั้งเดียวแล้วแชร์ให้ทุกหน้า (Home, Team, Profile, Projects, Contact)
const PortfolioContext = createContext(null);

// แปลงข้อความเป็นรหัสที่ใช้ใน URL และ id ของ HTML ได้ เช่น "AI Concrete Optimization" -> "ai-concrete-optimization"
const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// แปลงข้อมูลจาก BE ให้ตรงกับรูปแบบที่หน้าเว็บคาดไว้ ทำที่นี่ที่เดียว หน้าอื่นไม่ต้องแก้
//  - BE เก็บโปรเจกต์ไว้ในตัวสมาชิกเป็นอ็อบเจกต์เต็ม (name, technologies) ไม่มี id
//  - หน้าเว็บคาดรายการโปรเจกต์กลาง (id, title, tags) และสมาชิกเก็บแค่รหัสโปรเจกต์
//  - BE ใช้ agentCode แต่หน้าเว็บอ่าน code
function normalize(data) {
  if (!data) return data;

  // รายการโปรเจกต์กลาง เก็บตามรหัส โปรเจกต์ชื่อซ้ำกัน (เช่น เว็บนี้ที่อยู่ทั้งกลุ่ม Tonn Peem) จะรวมเป็นอันเดียว
  const byKey = new Map();

  // ใส่โปรเจกต์ลงรายการกลาง แล้วคืนรหัสของมัน
  const register = (p) => {
    if (typeof p === 'string') return p; // ข้อมูลจำลอง: เป็นรหัสอยู่แล้ว
    const key = slug(p.id ?? p.name ?? p.title ?? '');
    if (!key) return null;
    if (!byKey.has(key)) {
      byKey.set(key, {
        ...p,
        id: p.id ?? key,
        title: p.title ?? p.name, // ชื่อโปรเจกต์
        tags: p.tags ?? p.technologies ?? [], // แท็กเทคโนโลยี
      });
    }
    return byKey.get(key).id;
  };

  // โปรเจกต์ของกลุ่มเข้ารายการก่อน เพื่อให้ขึ้นเป็นหลักฐาน #01
  (data.group?.projects ?? []).forEach(register);

  const members = (data.members ?? []).map((m) => ({
    ...m,
    code: m.code ?? m.agentCode, // รหัสเจ้าหน้าที่
    projects: (m.projects ?? []).map(register).filter(Boolean), // เหลือแต่รหัส
  }));

  return { ...data, members, projects: [...byKey.values()] };
}

export function PortfolioProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(normalize(await getPortfolio())); // แปลงรูปแบบก่อนเก็บ
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const members = data?.members ?? [];
  const projects = data?.projects ?? []; // รายการกลางที่รวมโปรเจกต์รายคนแล้ว

  return (
    <PortfolioContext.Provider
      value={{ group: data?.group, members, projects, loading, error, reload: load }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}