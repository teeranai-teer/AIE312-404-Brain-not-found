// Backend ปลอม ทำงานในเบราว์เซอร์ล้วน ๆ ใช้ตอน VITE_API_URL ว่าง
// เก็บประวัติแชตไว้ใน localStorage เพื่อจำลองว่า BE บันทึกลงฐานข้อมูล
// ทดสอบ error ได้: พิมพ์ข้อความที่มีคำว่า #error
import { mockPortfolio } from './data/mockPortfolio.js';
import { ApiError } from './errors.js';

const DB_KEY = 'mock-db-messages';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function readDb() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeDb(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* ignore */
  }
}

export async function getPortfolio() {
  await wait(400);
  return structuredClone(mockPortfolio);
}

export async function getHistory(sessionId) {
  await wait(300);
  return { messages: readDb()[sessionId] || [] };
}

export async function sendMessage(sessionId, message) {
  await wait(900);
  if (!message?.trim()) throw new ApiError('errServer', 'กรุณาพิมพ์ข้อความก่อนส่ง');
  if (message.includes('#error')) {
    throw new ApiError('errServer', 'ขออภัย ระบบ AI ใช้งานไม่ได้ชั่วคราว (ข้อความจำลอง)');
  }

  const reply = fakeReply(message);
  const db = readDb();
  db[sessionId] = [
    ...(db[sessionId] || []),
    { role: 'user', content: message },
    { role: 'assistant', content: reply },
  ];
  writeDb(db);
  return { reply };
}

function fakeReply(text) {
  const s = text.toLowerCase();
  const { members, group } = mockPortfolio;
  const findMember = members.find(
    (m) => s.includes(m.id) || s.includes(m.name.toLowerCase())
  );

  if (findMember) {
    return `${findMember.code}: ${findMember.name} — ${findMember.role}\nทักษะ: ${findMember.skills.join(', ')}`;
  }
  if (/project|โปรเจกต์|ผลงาน/.test(s)) {
    return 'แฟ้มผลงานของทีม:\n' + group.projects.map((p) => `• ${p.title} — ${p.tags.join(' / ')}`).join('\n');
  }
  if (/สมาชิก|member|ใคร|who/.test(s)) {
    return `ทีมมีสมาชิก ${members.length} คน: ${members.map((m) => m.name).join(' และ ')}`;
  }
  if (/ทีม|team|404|ทำอะไร/.test(s)) {
    return `${group.name} — ${group.description}`;
  }
  return '(คำตอบจำลอง) ลองถามว่า "ทีมมีผลงานอะไรบ้าง" หรือ "สมาชิกในทีมมีใครบ้าง" เมื่อเชื่อม BE แล้ว Gemini จะตอบจากข้อมูล Portfolio จริง';
}
