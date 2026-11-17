import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../settings.jsx';

// หน้าเปิดแฟ้มคดี: แสดงครั้งแรกที่เข้าหน้าแรกในแต่ละแท็บ
// คลิกแฟ้ม / กดปุ่ม / Enter / Esc → ปกแฟ้มพลิกเปิด แล้วจางหายเข้าสู่เว็บ
const SEEN_KEY = 'case-entry-seen';
const OPEN_MS = 2100; // เวลาที่ปกพลิกเปิด
const FADE_MS = 850; // เวลาที่หน้านี้จางหาย

export function shouldShowEntry(pathname) {
  if (pathname !== '/') return false; // เปิดลิงก์ตรงไปหน้าอื่น ไม่ต้องเจอหน้านี้
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1';
  } catch {
    return true;
  }
}

export default function CaseEntry({ onDone }) {
  const { t } = useSettings();
  const [opened, setOpened] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const folderRef = useRef(null);

  const open = () => {
    if (opened) return;
    setOpened(true);
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  // ระหว่างแสดง: ล็อกการเลื่อนหน้า และซ่อนใยแมงมุมบนพื้นหลัง
  useEffect(() => {
    document.body.classList.add('entry-open');
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.classList.remove('entry-open');
      document.body.style.overflow = '';
    };
  }, []);

  // Esc = ข้าม, Enter = เปิด (ใช้ได้ทันทีโดยไม่ต้องกด Tab ไปที่แฟ้มก่อน)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' || (e.key === 'Enter' && e.target === document.body)) open();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  // เปิดแล้ว → รอปกพลิก → จางหาย → แจ้ง App ให้เอาออก
  useEffect(() => {
    if (!opened) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t1 = setTimeout(() => setDismissed(true), reduced ? 80 : OPEN_MS);
    const t2 = setTimeout(onDone, (reduced ? 80 : OPEN_MS) + FADE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [opened, onDone]);

  return (
    <div
      className={`case-entry${dismissed ? ' dismissed' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('entryLabel')}
    >
      <div className="case-grain" />
      <div className="case-intro">
        <div className="case-caption">DETECTIVE DEVELOPMENT TEAM · CASE ARCHIVE</div>
        <div
          ref={folderRef}
          className={`case-folder${opened ? ' case-opened' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={t('entryOpen')}
          onClick={open}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              open();
            }
          }}
        >
          <div className="case-back" />
          <div className="case-paper">
            <span className="paper-label">EVIDENCE DOCUMENT 04</span>
            <h2>CASE UNLOCKED</h2>
            <p>{t('entryWelcome')}</p>
            <div className="paper-lines" />
          </div>
          <div className="case-cover">
            <div className="evidence-ink" aria-hidden="true" />
            <div className="cover-label">CLASSIFIED · CASE FILE #04</div>
            <h1>
              404 Brain
              <br />
              Not Found
            </h1>
            <div className="cover-thai">{t('entryCoverThai')}</div>
            <div className="case-stamp">CONFIDENTIAL</div>
          </div>
        </div>
        <button className="case-open-btn" onClick={open} disabled={opened}>
          {opened ? t('entryOpening') : t('entryOpen')} <span aria-hidden="true">↗</span>
        </button>
        <div className="case-hint">{t('entryHint')}</div>
      </div>
    </div>
  );
}
