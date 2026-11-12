// รายการ "แฟ้มสนทนา" เก็บใน localStorage ของเบราว์เซอร์
// เก็บแค่ { id, title, createdAt } — ตัวข้อความจริงอยู่ใน DB ฝั่ง BE (ดึงด้วย getHistory)
const LIST_KEY = 'case-sessions';
const ACTIVE_KEY = 'case-active';

export function loadSessions() {
  try {
    const list = JSON.parse(localStorage.getItem(LIST_KEY) || '[]');
    return Array.isArray(list) ? list.filter((s) => s && typeof s.id === 'string') : [];
  } catch {
    return [];
  }
}

export function saveSessions(list) {
  try {
    localStorage.setItem(LIST_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function loadActiveId() {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function saveActiveId(id) {
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* ignore */
  }
}

// title: null = ยังไม่มีชื่อ (หน้าจอจะแสดง "การสนทนาใหม่" ตามภาษาที่เลือก)
export function createSession() {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return { id, title: null, createdAt: Date.now() };
}
