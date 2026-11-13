import { useCallback, useEffect, useRef, useState } from 'react';
import { useSettings } from '../settings.jsx';
import { sendMessage, getHistory, errorText, USE_MOCK } from '../api.js';
import {
  loadSessions,
  saveSessions,
  loadActiveId,
  saveActiveId,
  createSession,
} from '../sessions.js';

// ส่งแล้วยังไม่ได้คำตอบเกินเวลานี้ → บอกผู้ใช้ว่าเซิร์ฟเวอร์อาจกำลังตื่น
const SLOW_MS = 8000;
const MAX_LENGTH = 1000;

// เปิดหน้ามาครั้งแรก: ใช้แฟ้มที่เปิดค้างไว้ ถ้าไม่มีเลยสร้างใหม่
function initialState() {
  let sessions = loadSessions();
  if (sessions.length === 0) sessions = [createSession()];
  const saved = loadActiveId();
  const activeId = sessions.some((s) => s.id === saved) ? saved : sessions[0].id;
  return { sessions, activeId };
}

export default function Chat() {
  const { t } = useSettings();
  const [{ sessions, activeId }, setState] = useState(initialState);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState({ status: 'loading', error: null });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [slow, setSlow] = useState(false);
  const [sendError, setSendError] = useState(null);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  // บันทึกรายการแฟ้มทุกครั้งที่เปลี่ยน
  useEffect(() => {
    saveSessions(sessions);
    saveActiveId(activeId);
  }, [sessions, activeId]);

  // โหลดประวัติของแฟ้มที่เลือกจาก BE
  const loadHistory = useCallback(async (id, isCurrent = () => true) => {
    setHistory({ status: 'loading', error: null });
    setMessages([]);
    try {
      const data = await getHistory(id);
      if (!isCurrent()) return;
      setMessages(data?.messages ?? []);
      setHistory({ status: 'ready', error: null });
    } catch (err) {
      if (!isCurrent()) return;
      setHistory({ status: 'error', error: err });
    }
  }, []);

  useEffect(() => {
    let current = true;
    setSendError(null);
    loadHistory(activeId, () => current);
    return () => {
      current = false; // เปลี่ยนแฟ้มก่อนโหลดเสร็จ → ทิ้งผลของแฟ้มเก่า
    };
  }, [activeId, loadHistory]);

  // เลื่อนลงล่างสุดเมื่อมีข้อความใหม่
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, sending, history.status]);

  const selectSession = (id) => {
    if (sending || id === activeId) return;
    setState((s) => ({ ...s, activeId: id }));
  };

  const newChat = () => {
    if (sending) return;
    const s = createSession();
    setState((prev) => ({ sessions: [s, ...prev.sessions], activeId: s.id }));
    inputRef.current?.focus();
  };

  const send = async (raw) => {
    const text = raw.trim();
    if (!text || sending || history.status !== 'ready') return; // กันส่งว่าง / กดซ้ำ

    const sessionId = activeId;
    setInput('');
    setSendError(null);
    setSending(true);
    setMessages((m) => [...m, { role: 'user', content: text }]);
    const slowTimer = setTimeout(() => setSlow(true), SLOW_MS);

    try {
      const { reply } = await sendMessage(sessionId, text);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      // ตั้งชื่อแฟ้มจากคำถามแรก
      setState((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === sessionId && !s.title ? { ...s, title: text.slice(0, 40) } : s
        ),
      }));
    } catch (err) {
      // ส่งไม่สำเร็จ: เอาข้อความออก แล้วคืนข้อความเดิมให้ในช่องพิมพ์ ผู้ใช้จะได้กดส่งใหม่
      setMessages((m) => m.slice(0, -1));
      setInput(text);
      setSendError(err);
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const caseNo = (i) => String(sessions.length - i).padStart(3, '0');

  return (
    <section className="view">
      <div className="eyebrow">INTERROGATION ROOM / 004</div>
      <h2 className="section-title">{t('chatTitle')}</h2>
      <p className="section-sub">{t('chatDesc')}</p>

      <div className="chat-layout">
        <aside className="dark-panel sidebar">
          <button className="btn gold" onClick={newChat} disabled={sending}>
            {t('newChat')}
          </button>
          <div className="type sidebar-label">{t('caseHistory')}</div>
          <div className="history">
            {sessions.map((s, i) => (
              <button
                key={s.id}
                className={`history-item${s.id === activeId ? ' active' : ''}`}
                aria-current={s.id === activeId}
                onClick={() => selectSession(s.id)}
                disabled={sending && s.id !== activeId}
              >
                <span className="case-no">CASE {caseNo(i)}</span>
                {s.title || t('newCaseTitle')}
              </button>
            ))}
          </div>
        </aside>

        <div className="dark-panel chat-main">
          <div className="chat-header">
            <div>
              <h3>Interrogation Room</h3>
              <div className="chat-header-sub">CASE OFFICER · AI ASSISTANT</div>
            </div>
            <span className="powered">
              ✦ Powered by Gemini
              {USE_MOCK && <small>DEMO MODE</small>}
            </span>
          </div>

          <div className="messages" ref={listRef} aria-live="polite">
            <div className="bubble bot">{t('welcome')}</div>

            {history.status === 'loading' && (
              <div className="bubble bot muted">
                <span className="spinner" aria-hidden="true" /> {t('loadingHistory')}
              </div>
            )}

            {history.status === 'error' && (
              <div className="chat-alert" role="alert">
                <span>{errorText(history.error, t)}</span>
                <button className="btn small" onClick={() => loadHistory(activeId)}>
                  {t('retry')}
                </button>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role === 'user' ? 'user' : 'bot'}`}>
                {m.content}
              </div>
            ))}

            {sending && (
              <div className="bubble bot muted typing">
                <span className="dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                {t('thinking')}
                {slow && <small className="slow-note">{t('slowServer')}</small>}
              </div>
            )}

            {sendError && (
              <div className="chat-alert" role="alert">
                <span>{errorText(sendError, t)}</span>
                <button className="btn small" onClick={() => send(input)}>
                  {t('retry')}
                </button>
                <button className="btn small ghost" onClick={() => setSendError(null)}>
                  {t('dismiss')}
                </button>
              </div>
            )}
          </div>

          {history.status === 'ready' && messages.length === 0 && !sending && (
            <div className="suggestions">
              {['suggest1', 'suggest2', 'suggest3'].map((k) => (
                <button key={k} className="suggestion" onClick={() => send(t(k))}>
                  {t(k)}
                </button>
              ))}
            </div>
          )}

          <form className="chat-form" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={MAX_LENGTH}
              autoComplete="off"
              placeholder={t('placeholder')}
              aria-label={t('placeholder')}
            />
            <button
              className="btn gold"
              type="submit"
              disabled={sending || !input.trim() || history.status !== 'ready'}
            >
              {sending ? t('sending') : t('send')}
            </button>
          </form>
        </div>
      </div>

      {USE_MOCK && <p className="note">{t('demoNote')}</p>}
    </section>
  );
}
