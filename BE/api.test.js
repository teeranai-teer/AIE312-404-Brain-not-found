// ============================================================
// api.test.js : เทสต์อัตโนมัติของ Backend
//
// ทำอะไร  : เปิดเซิร์ฟเวอร์ชั่วคราว ยิงคำขอเข้า API แล้วเช็กว่าคำตอบถูกต้อง
// เทสต์อะไร : /health, /api/portfolio และการตรวจข้อมูลของ /api/chat
// ไม่เทสต์  : การคุยกับ Gemini และฐานข้อมูลจริง เพราะต้องใช้ key จริง
//             เลือกเทสต์เฉพาะส่วนที่ไม่แตะสองอย่างนี้ จะรันบน GitHub ได้โดยไม่ต้องมีค่าลับ
// รันด้วย  : node --test api.test.js (รันในโฟลเดอร์ BE)
// ============================================================

// test   : ใช้ประกาศเทสต์แต่ละข้อ
// before : โค้ดที่ต้องรัน "ก่อน" เริ่มเทสต์ (ที่นี่ใช้เปิดเซิร์ฟเวอร์)
// after  : โค้ดที่ต้องรัน "หลัง" เทสต์จบ (ที่นี่ใช้ปิดเซิร์ฟเวอร์)
// ทั้งหมดมากับ Node อยู่แล้ว ไม่ต้องติดตั้งแพ็กเกจเพิ่ม
import { test, before, after } from 'node:test';

// assert : ตัวตรวจคำตอบ ถ้าค่าไม่ตรงที่คาด เทสต์ข้อนั้นจะล้ม
// รุ่น strict ทำให้ assert.equal เทียบแบบเข้มงวด (ไม่แปลงชนิดข้อมูลให้เอง)
import assert from 'node:assert/strict';

// บอก index.js ว่ากำลังรันเทสต์ index.js จะได้ไม่เปิดเซิร์ฟเวอร์เอง
// (เรากำหนดเงื่อนไขนี้ไว้ท้ายไฟล์ index.js) ต้องตั้งก่อนโหลด index.js
process.env.NODE_ENV = 'test';

// ค่าปลอมสำหรับกรณีไม่มีไฟล์ .env เช่นตอนรันบน GitHub Actions
// ??= หมายถึง "ใส่ค่าให้เฉพาะตอนที่ยังไม่มีค่า" ถ้าเครื่องคุณมีค่าจริงใน .env อยู่แล้ว จะไม่ถูกทับ
// ห้ามใส่ key จริงตรงนี้ เพราะไฟล์นี้ขึ้น GitHub สาธารณะ
process.env.GEMINI_API_KEY ??= 'dummy';
process.env.GEMINI_MODEL ??= 'dummy';
process.env.DATABASE_URL ??= 'postgresql://user:pass@localhost:5432/db';

// ตัวแปรที่แชร์ให้ทุกเทสต์ใช้
let server; // เซิร์ฟเวอร์ที่เปิดไว้ทดสอบ (ไว้ให้ after ใช้ปิด)
let base;   // ที่อยู่ของเซิร์ฟเวอร์ เช่น http://localhost:54321

// ก่อนเริ่มเทสต์: เปิดเซิร์ฟเวอร์บนพอร์ตสุ่มที่ว่างอยู่
before(async () => {
  // โหลด index.js ตอนนี้ (ไม่ใส่ไว้บนสุดของไฟล์) เพราะต้องตั้งค่า process.env ด้านบนให้เสร็จก่อน
  // { app } คือตัวเซิร์ฟเวอร์ Express ที่ index.js ส่งออกมา (export { app })
  const { app } = await import('./index.js');

  // listen(0) = ให้ระบบเลือกพอร์ตที่ว่างให้เอง จึงไม่ชนกับ BE ที่คุณรันอยู่ที่พอร์ต 3000
  server = app.listen(0);

  // รอจนเซิร์ฟเวอร์พร้อมรับคำขอก่อน ไม่งั้นเทสต์ตัวแรกอาจยิงเร็วเกินไปแล้วล้ม
  await new Promise((resolve) => server.once('listening', resolve));

  // ประกอบที่อยู่จากพอร์ตที่ระบบเลือกให้
  base = `http://localhost:${server.address().port}`;
});

// หลังเทสต์จบ: ปิดเซิร์ฟเวอร์ ถ้าไม่ปิด โปรเซสจะค้างและ CI จะรอจนหมดเวลา
after(() => {
  // ปิดการเชื่อมต่อที่ยังค้างอยู่ (เครื่องหมาย ?. = เรียกเฉพาะเมื่อมีฟังก์ชันนี้ใน Node เวอร์ชันนั้น)
  server.closeAllConnections?.();
  server.close();
});

// ---------- เทสต์ที่ 1 ----------
// เช็กว่า /health ตอบกลับตามที่คาด (ใช้ให้ Render และ CI เช็กว่าเซิร์ฟเวอร์ยังมีชีวิต)
test('GET /health ตอบ status ok', async () => {
  const res = await fetch(`${base}/health`);   // ยิงคำขอ GET ไปที่เซิร์ฟเวอร์ทดสอบ
  assert.equal(res.status, 200);               // รหัสตอบกลับต้องเป็น 200 (สำเร็จ)
  // deepEqual เทียบเนื้อหาข้างในอ็อบเจกต์ว่าตรงกันหมด (equal ใช้เทียบอ็อบเจกต์ไม่ได้)
  assert.deepEqual(await res.json(), { status: 'ok' });
});

// ---------- เทสต์ที่ 2 ----------
// เช็กว่า /api/portfolio ส่งข้อมูลทีมกลับมา และมีสมาชิกอย่างน้อย 2 คน
// (ตรงกับที่โจทย์ต้องการว่า AI และหน้าเว็บต้องมีข้อมูลสมาชิกครบทุกคน)
test('GET /api/portfolio มีข้อมูลกลุ่มและสมาชิก', async () => {
  const res = await fetch(`${base}/api/portfolio`);
  assert.equal(res.status, 200);
  const data = await res.json();               // แปลงคำตอบเป็นอ็อบเจกต์ JavaScript
  assert.ok(data.group.name);                  // ok = ต้องมีค่า (ห้ามว่างหรือ undefined) ชื่อกลุ่มต้องมี
  assert.ok(data.members.length >= 2);         // สมาชิกต้องมีอย่างน้อย 2 คน
});

// ---------- เทสต์ที่ 3 และ 4 ----------
// ตรวจการตรวจสอบข้อมูลขาเข้า (validation) ของ /api/chat
// ใน index.js ส่วนนี้ตอบกลับก่อนแตะฐานข้อมูลและ Gemini จึงเทสต์ได้โดยไม่ต้องมี key จริง
// ถ้าฝั่ง FE ส่งข้อมูลไม่ครบ BE ต้องตอบ 400 ไม่ใช่ล่ม

// ส่ง sessionId แต่ไม่ส่ง message
test('POST /api/chat ไม่ส่ง message ต้องได้ 400', async () => {
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',                                        // ส่งข้อมูลแบบ POST
    headers: { 'Content-Type': 'application/json' },       // บอกเซิร์ฟเวอร์ว่าข้อมูลที่ส่งเป็น JSON
    body: JSON.stringify({ sessionId: 'test' }),           // แปลงอ็อบเจกต์เป็นข้อความ JSON (ไม่มีช่อง message)
  });
  assert.equal(res.status, 400);                           // 400 = ข้อมูลที่ส่งมาไม่ถูกต้อง
});

// ส่ง message แต่ไม่ส่ง sessionId
test('POST /api/chat ไม่ส่ง sessionId ต้องได้ 400', async () => {
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'สวัสดี' }),           // ไม่มีช่อง sessionId
  });
  assert.equal(res.status, 400);
});