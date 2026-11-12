// ที่เดียวที่คุยกับ Backend — หน้าอื่นห้ามเรียก fetch เอง
// ถ้าไม่ได้ตั้ง VITE_API_URL จะใช้ข้อมูลปลอมจาก mockApi.js แทน
import * as mock from './mockApi.js';
import { ApiError } from './errors.js';

export { ApiError, errorText } from './errors.js';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const USE_MOCK = !API_URL;

// Render แผนฟรีอาจหลับอยู่ ครั้งแรกตื่นช้า 30–60 วินาที จึงเผื่อเวลาไว้
const TIMEOUT_MS = 90_000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
    });
  } catch (err) {
    throw new ApiError(err.name === 'AbortError' ? 'errTimeout' : 'errNetwork');
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* บาง error อาจไม่ได้ส่ง JSON กลับมา */
  }

  if (!res.ok) throw new ApiError('errServer', data?.error || '');
  return data;
}

// GET /api/portfolio → { group, members }
export function getPortfolio() {
  if (USE_MOCK) return mock.getPortfolio();
  return request('/api/portfolio');
}

// POST /api/chat { sessionId, message } → { reply }
export function sendMessage(sessionId, message) {
  if (USE_MOCK) return mock.sendMessage(sessionId, message);
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ sessionId, message }),
  });
}

// GET /api/history/:sessionId → { messages: [{ role, content }] }
export function getHistory(sessionId) {
  if (USE_MOCK) return mock.getHistory(sessionId);
  return request(`/api/history/${encodeURIComponent(sessionId)}`);
}
