import { useSettings } from '../settings.jsx';
import { usePortfolio } from '../portfolio.jsx';
import { errorText } from '../api.js';

// กล่องสถานะ "กำลังโหลด" / "โหลดไม่สำเร็จ" ใช้ซ้ำได้ทุกหน้า
export function Loading({ text }) {
  const { t } = useSettings();
  return (
    <div className="state-box dark-panel" role="status">
      <span className="spinner" aria-hidden="true" />
      {text ?? t('loading')}
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  const { t } = useSettings();
  return (
    <div className="state-box dark-panel error" role="alert">
      <b className="type">{t('loadFailed')}</b>
      <span>{errorText(error, t)}</span>
      {onRetry && (
        <button className="btn gold" onClick={onRetry}>
          {t('retry')}
        </button>
      )}
    </div>
  );
}

// ห่อหน้าที่ต้องใช้ข้อมูล portfolio: ถ้ายังโหลดอยู่หรือ error จะแสดงกล่องสถานะแทน
export function PortfolioGate({ children }) {
  const { loading, error, reload } = usePortfolio();
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return children;
}
