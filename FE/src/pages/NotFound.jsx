import { Link } from 'react-router-dom';
import { useSettings } from '../settings.jsx';

export default function NotFound() {
  const { t } = useSettings();
  return (
    <section className="view">
      <div className="paper not-found">
        <div className="stamp">404</div>
        <h2>{t('notFoundTitle')}</h2>
        <p>{t('notFoundDesc')}</p>
        <Link to="/" className="btn outline">
          {t('backHome')}
        </Link>
      </div>
    </section>
  );
}
