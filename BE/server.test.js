// ============================================================
// server.test.js : เทสต์พฤติกรรมของตัวเซิร์ฟเวอร์ Express
//
// ต่างจาก api.test.js ตรงที่ไฟล์นั้นเช็กว่า endpoint ตอบถูก
// ไฟล์นี้เช็กว่าเซิร์ฟเวอร์รับมือกับคำขอแปลกๆ ได้ (ไม่ล่ม ตอบ error ถูกรหัส)
// ทุกข้อไม่แตะฐานข้อมูลและ Gemini จึงรันบน GitHub ได้โดยไม่ต้องมี key จริง
// รันด้วย : node --test server.test.js (รันในโฟลเดอร์ BE)
// ============================================================

// test = ประกาศเทสต์แต่ละข้อ / before = รันก่อนเริ่ม / after = รันหลังจบ (มากับ Node ไม่ต้องติดตั้งเพิ่ม)
import { test, before, after } from 'node:test';
// assert รุ่น strict = ตัวตรวจคำตอบ ถ้าค่าไม่ตรงที่คาด เทสต์ข้อนั้นล้ม
import assert from 'node:assert/strict';

// บอก index.js ว่ากำลังรันเทสต์ จะได้ไม่เปิดเซิร์ฟเวอร์เอง (ต้องตั้งก่อนโหลด index.js)
process.env.NODE_ENV = 'test';
// ค่าปลอมเฉพาะกรณีไม่มี .env (เช่นบน GitHub) ??= คือใส่ให้เมื่อยังไม่มีค่า ห้ามใส่ key จริง
process.env.GEMINI_API_KEY ??= 'dummy';
process.env.GEMINI_MODEL ??= 'dummy';
process.env.DATABASE_URL ??= 'postgresql://user:pass@localhost:5432/db';

let server; // เซิร์ฟเวอร์ที่เปิดไว้ทดสอบ (ไว้ให้ after ใช้ปิด)
let base;   // ที่อยู่ของเซิร์ฟเวอร์ เช่น http://localhost:54321

// ก่อนเริ่มเทสต์: เปิดเซิร์ฟเวอร์บนพอร์ตสุ่ม (listen(0) = ให้ระบบเลือกพอร์ตที่ว่าง ไม่ชนกับ BE ที่รันอยู่)
before(async () => {
  const { app } = await import('./index.js');
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://localhost:${server.address().port}`;
});

// หลังเทสต์จบ: ปิดเซิร์ฟเวอร์ ไม่ปิดโปรเซสจะค้างและ CI จะรอจนหมดเวลา
after(() => {
  server.closeAllConnections?.();
  server.close();
});

// ---------- เทสต์ที่ 1 ----------
// เส้นทางที่ไม่มีอยู่ ต้องได้ 404 (ไม่ใช่ 200 หรือเซิร์ฟเวอร์ล่ม)
test('เส้นทางที่ไม่มีอยู่ ต้องได้ 404', async () => {
  const res = await fetch(`${base}/ไม่มีเส้นทางนี้`);
  assert.equal(res.status, 404);
});

// ---------- เทสต์ที่ 2 ----------
// เซิร์ฟเวอร์ต้องส่งหัว CORS กลับมา ถ้าไม่ส่ง เบราว์เซอร์จะบล็อกไม่ให้หน้าเว็บ FE เรียก API ได้
// ส่งหัว Origin จำลองว่าคำขอมาจากเว็บอื่น (เหมือนที่เบราว์เซอร์ทำ)
// เช็กแค่ว่ามีหัวนี้ ไม่เช็กค่า เพราะค่าขึ้นกับว่าตั้ง FRONTEND_URL ไว้ไหม
test('ตอบหัว CORS กลับมา', async () => {
  const res = await fetch(`${base}/health`, {
    headers: { Origin: 'http://localhost:5173' },
  });
  assert.ok(res.headers.get('access-control-allow-origin'));
});

// ---------- เทสต์ที่ 3 ----------
// ถ้า FE ส่ง JSON ที่พัง (เช่นปีกกาไม่ปิด) เซิร์ฟเวอร์ต้องตอบ 400 ไม่ใช่ล่ม
// express.json() ใน index.js เป็นตัวจัดการให้
test('JSON ที่พังต้องได้ 400', async () => {
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"sessionId": "test", ', // ตั้งใจให้พัง
  });
  assert.equal(res.status, 400);
});

// ---------- เทสต์ที่ 4 ----------
// ข้อความที่มีแต่ช่องว่าง ต้องถูกปฏิเสธ (ไม่ส่งไปให้ Gemini เสียโควตา)
test('ข้อความที่มีแต่ช่องว่างต้องได้ 400', async () => {
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: 'test', message: '     ' }),
  });
  assert.equal(res.status, 400);
});

// ---------- เทสต์ที่ 5 ----------
// ข้อความยาวเกิน 1,000 ตัวอักษร ต้องถูกปฏิเสธ (กันคนส่งข้อความยักษ์มาให้ Gemini)
// 'ก'.repeat(1001) = ตัวอักษร 'ก' ซ้ำ 1,001 ตัว
test('ข้อความยาวเกิน 1000 ตัวอักษรต้องได้ 400', async () => {
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: 'test', message: 'ก'.repeat(1001) }),
  });
  assert.equal(res.status, 400);
});

// ---------- เทสต์ที่ 6 ----------
// FE ส่งชื่อ field ผิด (text แทน message) ต้องได้ 400 ไม่ใช่ล่มหรือส่งข้อความว่างให้ Gemini
test('ส่งชื่อ field ผิด (text แทน message) ต้องได้ 400', async () => {
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: 'test', text: 'สวัสดี' }), // ไม่มี message
  });
  assert.equal(res.status, 400);
});

// ---------- เทสต์ที่ 7 ----------
// /api/chat รับเฉพาะ POST ถ้า GET เข้ามาต้องได้ 404 (ไม่มีเส้นทางนี้สำหรับ GET)
test('GET /api/chat ต้องได้ 404 เพราะรับเฉพาะ POST', async () => {
  const res = await fetch(`${base}/api/chat`);
  assert.equal(res.status, 404);
});