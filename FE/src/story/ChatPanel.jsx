import { useEffect, useRef, useState } from 'react';
import { sendMessage, getHistory, deleteHistory, errorText } from '../api.js';
import { loadSessions, saveSessions, loadActiveId, saveActiveId, createSession } from '../sessions.js';
import RichText from '../components/RichText.jsx';
import { asset } from './assets.js';

// แชตกับนักสืบ AI
// - รายการห้อง (CASE) เก็บใน localStorage ผ่าน sessions.js
// - ข้อความจริงเก็บใน PostgreSQL ฝั่ง BE: ส่งด้วย sendMessage, โหลดด้วย getHistory, ลบห้องด้วย deleteHistory (api.js)

const WELCOME =
  'ยินดีต้อนรับครับ ผมคือผู้ช่วยสืบสวนของทีม 404 Brain Not Found ถามเรื่องสมาชิก ทักษะ หรือผลงานของทีมได้เลย';
const PROMPTS = ['Tonn และ Peem ถนัดด้านไหน?', 'ขอดูผลงานเด่นที่ผ่านมา'];

// ข้อความ error ภาษาไทย (errorText ใน api.js เลือกข้อความจาก BE ก่อน ถ้าไม่มีจึงใช้ตารางนี้)
const ERR = {
  errNetwork: 'ติดต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง',
  errTimeout: 'รอนานเกินไป เซิร์ฟเวอร์อาจกำลังตื่น กรุณาลองใหม่อีกครั้ง',
  errServer: 'ระบบขัดข้อง กรุณาลองใหม่ภายหลัง',
};
const t = (key) => ERR[key] || key;

const caseNo = (n) => `CASE ${String(n).padStart(3, '0')}`;
const hhmm = (d) => {
  try {
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

// ห้องใหม่ได้เลขถัดจากเลขที่มากที่สุด (createSession จาก sessions.js ให้ id, title, createdAt)
function newCase(list) {
  const n = list.reduce((m, s) => Math.max(m, s.n || 0), 0) + 1;
  return { ...createSession(), n };
}

// โหลดรายการห้องตอนเปิดหน้า ห้องเก่าที่ยังไม่มีเลข ให้เลขตามลำดับ ไม่มีห้องเลยก็สร้างใหม่
function initialState() {
  let list = loadSessions().map((s, i, all) => (s.n ? s : { ...s, n: all.length - i }));
  if (!list.length) list = [newCase([])];
  const saved = loadActiveId();
  return { list, active: list.some((s) => s.id === saved) ? saved : list[0].id };
}

// รูปโปรไฟล์ฝั่งผู้ถาม (ไอคอนคน)
const MeAvatar = () => (
  <span className="av me" aria-hidden="true">
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8.5" r="4.2" />
      <path d="M3.5 21c.9-4.6 4.3-7 8.5-7s7.6 2.4 8.5 7z" />
    </svg>
  </span>
);

export default function ChatPanel({ active }) {
  const [init] = useState(initialState);
  const [sessions, setSessions] = useState(init.list);
  const [activeId, setActiveId] = useState(init.active);
  const [messages, setMessages] = useState([]); // { side: 'ai' | 'me' | 'err', text, time }
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');

  const activeRef = useRef(activeId);
  activeRef.current = activeId;
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // บันทึกรายการห้องและห้องที่เปิดอยู่ทุกครั้งที่เปลี่ยน
  useEffect(() => saveSessions(sessions), [sessions]);
  useEffect(() => saveActiveId(activeId), [activeId]);

  // เปลี่ยนห้อง → โหลดประวัติของห้องนั้นจาก BE
  useEffect(() => {
    let cancelled = false; // สลับห้องระหว่างรอ ไม่ต้องแสดงผลของห้องเก่า
    setMessages([]);
    setLoading(true);
    getHistory(activeId)
      .then((data) => {
        if (cancelled) return;
        setMessages(
          (data?.messages ?? []).map((m) => {
            const at = m.created_at || m.createdAt; // ถ้า BE ส่งเวลามาด้วยจะแสดงเวลา
            return { side: m.role === 'user' ? 'me' : 'ai', text: m.content, time: at ? new Date(at) : null };
          })
        );
      })
      .catch(() => !cancelled && setMessages([{ side: 'err', text: 'โหลดประวัติไม่สำเร็จ' }]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  // ข้อความใหม่ → เลื่อนลงล่างสุด
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, busy]);

  // เปิดกล่องแชต → โฟกัสช่องพิมพ์
  useEffect(() => {
    if (active) inputRef.current?.focus({ preventScroll: true });
  }, [active]);

  async function ask(raw) {
    const text = raw.trim();
    if (!text || busy) return;
    const sid = activeId;
    setBusy(true);
    setInput('');
    setMessages((ms) => [...ms, { side: 'me', text, time: new Date() }]);
    // ตั้งชื่อห้องจากคำถามแรก
    setSessions((list) => list.map((s) => (s.id === sid && !s.title ? { ...s, title: text.slice(0, 40) } : s)));
    try {
      const { reply } = await sendMessage(sid, text);
      if (sid === activeRef.current) {
        setMessages((ms) => [...ms, { side: 'ai', text: reply || '(ไม่มีคำตอบ)', time: new Date() }]);
      }
    } catch (err) {
      if (sid === activeRef.current) setMessages((ms) => [...ms, { side: 'err', text: errorText(err, t) }]);
    } finally {
      setBusy(false);
    }
  }

  function addCase() {
    if (busy) return;
    const s = newCase(sessions);
    setSessions([s, ...sessions]);
    setActiveId(s.id);
    inputRef.current?.focus({ preventScroll: true });
  }

  async function removeCase(id) {
    if (busy) return;
    const s = sessions.find((x) => x.id === id);
    if (!s || !window.confirm(`ลบ ${caseNo(s.n)} และข้อความทั้งหมดในห้องนี้?`)) return;
    try {
      await deleteHistory(id); // ลบใน DB ก่อน สำเร็จแล้วค่อยเอาออกจากรายการ
    } catch {
      setMessages((ms) => [...ms, { side: 'err', text: 'ลบไม่สำเร็จ กรุณาลองใหม่' }]);
      return;
    }
    let rest = sessions.filter((x) => x.id !== id);
    if (!rest.length) rest = [newCase([])];
    setSessions(rest);
    if (id === activeId) setActiveId(rest[0].id);
  }

  return (
    <>
      <header className="chat-head">
        <img className="medal" src={asset('medal.webp')} alt="" />
        <div className="plaque">
          <span className="l1">พูดกับนักสืบ</span>
        </div>
      </header>

      <div className="chatwrap">
        {/* แถบด้านข้าง: สร้างห้องใหม่ + รายการห้อง พร้อมปุ่มลบ */}
        <aside className="side">
          <button className="newcase" type="button" onClick={addCase} disabled={busy}>
            + สร้างการสนทนาใหม่
          </button>
          <h4>CASE HISTORY</h4>
          <div className="caselist" aria-label="ประวัติการสนทนา">
            {sessions.map((s) => (
              <span key={s.id} className={`case${s.id === activeId ? ' on' : ''}`}>
                <button
                  type="button"
                  className="case-open"
                  title={s.title || 'การสนทนาใหม่'}
                  disabled={busy}
                  onClick={() => s.id !== activeId && setActiveId(s.id)}
                >
                  <b>{caseNo(s.n)}</b>
                  <span className="t">{s.title || 'การสนทนาใหม่'}</span>
                </button>
                <button
                  type="button"
                  className="case-del"
                  aria-label={`ลบการสนทนา ${caseNo(s.n)}`}
                  disabled={busy}
                  onClick={() => removeCase(s.id)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </aside>

        <div className="main">
          <div className="msgs" ref={listRef} aria-live="polite">
            <Row side="ai">{WELCOME}</Row>
            {loading && <Row side="ai" typing>กำลังเปิดแฟ้ม…</Row>}
            {messages.map((m, i) =>
              m.side === 'err' ? (
                <div key={i} className="m err">
                  {m.text}
                </div>
              ) : (
                <Row key={i} side={m.side} time={m.time}>
                  {m.side === 'ai' ? <RichText text={m.text} /> : m.text}
                </Row>
              )
            )}
            {busy && <Row side="ai" typing>กำลังตรวจสอบหลักฐาน…</Row>}
          </div>

          <div className="qps">
            {PROMPTS.map((p) => (
              <button key={p} className="qp" type="button" disabled={busy} onClick={() => ask(p)}>
                {p}
              </button>
            ))}
          </div>

          <form
            className="form"
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <span className="form-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.4 6.1L4.5 21l4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
                <circle cx="8" cy="11" r="1.3" fill="#2a160a" />
                <circle cx="12" cy="11" r="1.3" fill="#2a160a" />
                <circle cx="16" cy="11" r="1.3" fill="#2a160a" />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              maxLength={1000}
              placeholder="พิมพ์ข้อความที่นี่…"
              aria-label="พิมพ์คำถาม"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="send" type="submit" aria-label="ส่งข้อความ" disabled={busy}>
              <svg viewBox="0 0 24 24">
                <path d="M2.5 11.2 21 3.5l-4.3 17.3-5.4-5.1-3.5 3.3.4-5.4 9.5-8.3-11.6 7.1z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// หนึ่งแถวข้อความ: AI = รูป + ข้อความ + เวลา, ผู้ถาม = เวลา + ข้อความ + รูป
function Row({ side, time, typing, children }) {
  const bubble = <div className={`m ${side}${typing ? ' typing' : ''}`}>{children}</div>;
  const ts = time && !isNaN(time) ? <span className="ts">{hhmm(time)}</span> : null;
  return side === 'ai' ? (
    <div className="row ai">
      <img className="av" src={asset('avatar-ai.jpg')} alt="" />
      {bubble}
      {ts}
    </div>
  ) : (
    <div className="row me">
      {ts}
      {bubble}
      <MeAvatar />
    </div>
  );
}
