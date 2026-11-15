import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../settings.jsx';

// ปุ่มลอยมุมขวาล่าง ไปหน้าแชตได้จากทุกหน้า (ซ่อนเมื่ออยู่หน้าแชตแล้ว)
export default function ChatFab() {
  const { t } = useSettings();
  const { pathname } = useLocation();
  if (pathname === '/chat') return null;

  return (
    <Link to="/chat" className="chat-fab" aria-label={t('fabLabel')} title={t('fabLabel')}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5A9 9 0 0 1 4 11.5a8.5 8.5 0 0 1 17 0Z" />
        <path d="M8 11h8M8 14h5" />
      </svg>
    </Link>
  );
}
