import { useEffect, useRef, useState } from 'react';
import ChatPanel from './ChatPanel.jsx';
import Dossier from './Dossier.jsx';
import { asset } from './assets.js';

// ===== ลำดับเรื่อง =====
// หน้าแรก (กดแว่นขยาย) → tag2 (เมือง→ประตู) → หยุดที่ประตู (กดเปิดประตู) → intro (เข้าห้อง) → menu
// จาก menu กดปุ่ม: chat (แชต AI) / profile (แฟ้มประวัติ) / wanted (ใบประกาศจับ)

const FADE_MS = 900; // ต้องเท่ากับ transition ของ .layer ใน story.css
const WATCHDOG_MS = 8000; // วิดีโอไม่เริ่มเล่นภายในเวลานี้ = ข้ามไปฉากถัดไป กันค้างจอ
const EARLY = { chat: 0.3, profile: 0.3 }; // เปิดกล่องก่อนวิดีโอจบเล็กน้อย ให้เฟดซ้อนกันพอดี
const NEXT = { tag2: 'door', intro: 'menu' }; // ฉากที่ต่อกันอัตโนมัติเมื่อวิดีโอจบ
const BG = { chat: 'chatbg', profile: 'profilebg', wanted: 'menu' }; // พื้นหลังที่โชว์หลังวิดีโอจบ
const PANELS = ['chat', 'profile', 'wanted']; // ฉากที่มีกล่องเนื้อหา

// ชั้นภาพ/วิดีโอทั้งหมด ซ้อนกันไว้ตั้งแต่แรก (preload) แล้วสลับด้วย opacity เพื่อไม่ให้จอดำ
const LAYERS = [
  ['tag2', 'video', 'tag2.mp4'],
  ['intro', 'video', 'intro.mp4'],
  ['menu', 'img', 'menu.jpg'],
  ['chat', 'video', 'chat.mp4'],
  ['chatbg', 'img', 'chat-paper.jpg'],
  ['profile', 'video', 'profile.mp4'],
  ['wanted', 'video', 'wanted.mp4'],
  ['profilebg', 'img', 'profile-paper.jpg'],
];

export default function StoryApp() {
  const [scene, setScene] = useState('loading');
  const [shown, setShown] = useState({}); // ชั้นที่กำลังแสดง: { ชื่อชั้น: zIndex }
  const [panel, setPanel] = useState(null); // กล่องเนื้อหาที่เปิดอยู่
  const [ready, setReady] = useState(false); // วิดีโอแรกโหลดพอเล่นแล้ว
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false); // เปิดเสียงเป็นค่าเริ่มต้น
  // เบราว์เซอร์ไม่ยอมเล่นเสียงก่อนผู้ใช้แตะหน้าเว็บ ถ้ายังไม่เคยแตะ ถือว่าโดนล็อกไว้ก่อน (เล่นแบบเงียบ)
  const [locked, setLocked] = useState(() => !navigator.userActivation?.hasBeenActive);

  const els = useRef({}); // element ของแต่ละชั้น (ใช้สั่ง play/pause)
  const music = useRef(null);
  const sceneRef = useRef('loading'); // ฉากปัจจุบัน (อ่านได้ใน callback ของวิดีโอ)
  const gen = useRef(0); // เลขรอบการเปลี่ยนฉาก กันเหตุการณ์ของฉากเก่ามาซ้อน
  const z = useRef(1);
  const timer = useRef(0);
  const unlockedAt = useRef(0);
  const sound = useRef({ muted, locked });
  sound.current = { muted, locked };

  // แสดงชั้นนี้บนสุด (ชั้นเดิมยังอยู่ข้างใต้ระหว่างเฟด จึงไม่เกิดจอดำ)
  const show = (name) => {
    const top = ++z.current;
    setShown((s) => ({ ...s, [name]: top }));
  };

  // วิดีโอของฉากนี้จบ (หรือใกล้จบ): ไปฉากต่อไป หรือเปิดกล่องเนื้อหา
  function finish(name) {
    if (name !== sceneRef.current) return;
    const next = NEXT[name];
    if (next === 'door') {
      gen.current++;
      clearTimeout(timer.current);
      sceneRef.current = 'door';
      setScene('door'); // ค้างภาพประตูไว้ รอผู้ใช้กดเปิด
      return;
    }
    if (next) return go(next);
    if (BG[name]) show(BG[name]);
    if (PANELS.includes(name)) setPanel(name);
  }

  // เปลี่ยนไปฉากใหม่
  function go(next) {
    const my = ++gen.current;
    clearTimeout(timer.current);
    sceneRef.current = next;
    setScene(next);
    setPanel(null);
    show(next);

    const el = els.current[next];
    if (el?.tagName === 'VIDEO') {
      el.muted = sound.current.muted || sound.current.locked;
      el.currentTime = 0;
      el.onended = () => my === gen.current && finish(next);
      el.ontimeupdate = EARLY[next]
        ? () => {
            if (my === gen.current && el.duration && el.currentTime >= el.duration - EARLY[next]) {
              el.ontimeupdate = null;
              finish(next);
            }
          }
        : null;
      el.play()?.catch((err) => {
        if (my !== gen.current) return;
        if (err?.name === 'NotAllowedError') {
          // เล่นแบบมีเสียงไม่ได้ → เล่นแบบเงียบก่อน รอผู้ใช้แตะ
          setLocked(true);
          el.muted = true;
          el.play().catch(() => my === gen.current && finish(next));
        } else finish(next);
      });
      // เล่นไม่ได้เลย (เช่น codec ไม่รองรับ) → ข้ามต่อ ไม่ค้างหน้าจอ
      timer.current = setTimeout(() => {
        if (my === gen.current && el.currentTime < 0.05) finish(next);
      }, WATCHDOG_MS);
    }

    // เฟดเสร็จแล้ว ซ่อนชั้นอื่นและหยุดวิดีโอที่ไม่ใช้ เพื่อประหยัดเครื่อง
    setTimeout(() => {
      if (my !== gen.current) return;
      setShown((s) => ({ [next]: s[next] }));
      Object.entries(els.current).forEach(([k, v]) => {
        if (k !== next && v?.tagName === 'VIDEO') v.pause();
      });
    }, FADE_MS + 100);
  }

  // หน้าแรก: กดแว่นขยาย (การแตะครั้งนี้ทำให้เปิดเสียงได้ตั้งแต่คลิปแรก)
  const begin = () => {
    unlockedAt.current = performance.now();
    sound.current = { muted, locked: false };
    setLocked(false);
    setStarted(true);
    go('tag2');
  };

  // รอให้วิดีโอแรกโหลดพอเล่นได้ลื่น แล้วค่อยแสดงปุ่มเริ่ม (เน็ตช้าก็แสดงหลัง 6 วินาที)
  useEffect(() => {
    const v = els.current.tag2;
    const ok = () => setReady(true);
    v?.addEventListener('canplaythrough', ok, { once: true });
    v?.addEventListener('error', ok, { once: true });
    const t = setTimeout(ok, 6000);
    if (music.current) music.current.volume = 0.35;
    return () => clearTimeout(t);
  }, []);

  // ใช้สถานะเสียงกับวิดีโอทุกตัวและเพลงประกอบ
  useEffect(() => {
    const silent = muted || locked;
    Object.values(els.current).forEach((v) => {
      if (v?.tagName === 'VIDEO') v.muted = silent;
    });
    const m = music.current;
    if (!m) return;
    m.muted = muted;
    if (started && !silent && m.paused) m.play().catch(() => setLocked(true));
  }, [muted, locked, started]);

  // แตะ/คลิก/กดปุ่มครั้งแรกที่ไหนก็ได้ = ปลดล็อกเสียง
  useEffect(() => {
    const unlock = () => {
      if (!sound.current.locked) return;
      unlockedAt.current = performance.now();
      setLocked(false);
    };
    const evs = ['pointerdown', 'keydown', 'touchstart'];
    evs.forEach((e) => window.addEventListener(e, unlock, { capture: true, passive: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, unlock, { capture: true }));
  }, []);

  // Esc = กลับห้องนักสืบ
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && PANELS.includes(sceneRef.current)) go('menu');
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const toggleSound = () => {
    if (performance.now() - unlockedAt.current < 800) return; // แตะเพื่อปลดล็อกเสียง ไม่นับเป็นการปิดเสียง
    setMuted((m) => !m);
  };
  const soundLabel = muted ? '🔇 เสียง: ปิด' : locked ? '🔈 แตะเพื่อเปิดเสียง' : '🔊 เสียง: เปิด';
  const pclass = (name) => `panel${panel === name ? ' open' : ''}`;

  return (
    <div className="story" data-scene={scene}>
      {LAYERS.map(([name, type, file]) => {
        const props = {
          ref: (el) => (els.current[name] = el),
          className: `layer${name in shown ? ' on' : ''}`,
          style: { zIndex: shown[name] },
          src: asset(file),
        };
        return type === 'video' ? (
          <video key={name} {...props} muted playsInline preload="auto" />
        ) : (
          <img key={name} {...props} alt="" />
        );
      })}

      {!started && (
        <div id="loader" className={ready ? 'ready' : ''}>
          <img className="startbg" src={asset('start-city.jpg')} alt="" />
          <div className="bar">
            <i />
          </div>
          {ready && (
            <button id="begin" type="button" aria-label="เริ่มการสืบสวน" onClick={begin}>
              <img src={asset('btn-start.webp')} alt="" />
            </button>
          )}
        </div>
      )}

      <button id="back" className="ctl imgbtn" type="button" aria-label="ย้อนกลับไปห้องนักสืบ" onClick={() => go('menu')}>
        <img src={asset('btn-back.webp')} alt="ย้อนกลับ" />
      </button>
      <button id="sound" className="ctl" type="button" aria-pressed={!muted} aria-label="เปิดหรือปิดเสียง" onClick={toggleSound}>
        {soundLabel}
      </button>
      <button id="skip" className="ctl" type="button" onClick={() => go('menu')}>
        ข้ามบทนำ (Skip) ›
      </button>

      {/* หน้าประตู: แสดงหลังคลิปแรกจบ */}
      <div id="gate">
        <button id="enter" type="button" aria-label="เปิดประตู เพื่อเข้าสู่โลกของนักสืบ" onClick={() => sceneRef.current === 'door' && go('intro')}>
          <img src={asset('btn-door.webp')} alt="เปิดประตู เพื่อเข้าสู่ โลกของนักสืบ" />
        </button>
      </div>

      {/* ปุ่มบนภาพห้องนักสืบ: --x, --y = ตำแหน่งเป็นสัดส่วนของภาพ */}
      <button id="hot-chat" className="hot img" type="button" style={{ '--x': 0.525, '--y': 0.74 }} aria-label="ถามนักสืบ: สอบถาม AI เกี่ยวกับ Portfolio" onClick={() => go('chat')}>
        <img src={asset('btn-chat.webp')} alt="ถามนักสืบ" />
      </button>
      <button id="hot-wanted" className="hot img" type="button" style={{ '--x': 0.15, '--y': 0.2 }} aria-label="ใบประกาศจับ" onClick={() => go('wanted')}>
        <img src={asset('btn-wanted.webp')} alt="ใบประกาศจับ" />
      </button>
      <button id="hot-profile" className="hot img" type="button" style={{ '--x': 0.85, '--y': 0.21 }} aria-label="ประวัติของนักสืบ: ดูประวัติ หน้าที่ และผลงานของสมาชิก" onClick={() => go('profile')}>
        <img src={asset('btn-profile.webp')} alt="ประวัติของนักสืบ" />
      </button>

      <audio ref={music} src={asset('music.mp3')} loop preload="auto" />

      <section id="panel-chat" className={pclass('chat')} aria-label="แชตกับนักสืบ AI">
        <ChatPanel active={panel === 'chat'} />
      </section>
      <section id="panel-wanted" className={pclass('wanted')} aria-label="ใบประกาศจับ">
        <img
          src={asset('wanted.jpg')}
          alt="ใบประกาศจับ WANTED ผู้ต้องหา ไม่ทราบชื่อ อายุประมาณ 18–25 ปี ส่วนสูงประมาณ 169 ซม. รูปร่างอวบ ตำหนิสวมแว่นตา รางวัลนำจับ 1,000,000 บาท"
        />
      </section>
      <section id="panel-profile" className={pclass('profile')} aria-label="แฟ้มประวัตินักสืบ">
        <Dossier />
      </section>
    </div>
  );
}
