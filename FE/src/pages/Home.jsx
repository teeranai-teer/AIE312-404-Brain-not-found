import { Link } from 'react-router-dom';
import { useSettings } from '../settings.jsx';
import { usePortfolio } from '../portfolio.jsx';
import logo from '../assets/detective.webp';

const pad = (n) => String(n).padStart(2, '0');

export default function Home() {
  const { t } = useSettings();
  const { members, projects, loading, error } = usePortfolio();

  // ตัวเลขนับจากข้อมูลจริง ระหว่างโหลดแสดง "--"
  const count = (list) => (loading || error ? '--' : pad(list.length));

  return (
    <section className="view">
      <div className="eyebrow">CLASSIFIED DOCUMENT · EVIDENCE 001</div>
      <div className="folder-tab">CASE FILE #404</div>
      <div className="paper stack hero">
        <div>
          <div className="stamp">CONFIDENTIAL</div>
          <h1>
            404
            <br />
            Brain Not Found
          </h1>
          <div className="type hero-sub">DETECTIVE DEVELOPMENT TEAM</div>
          <p>{t('heroText')}</p>
          <div className="btnrow">
            <Link to="/team" className="btn gold">
              {t('meet')}
            </Link>
            <Link to="/chat" className="btn outline">
              {t('talk')}
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <span className="pin" />
          <img src={logo} alt="Gold detective silhouette with magnifying glass" />
          <div className="type hero-caption">SUBJECT: DEVELOPMENT TEAM</div>
        </div>
      </div>

      <div className="stats">
        <div className="dark-panel stat">
          <b className="type">{count(members)}</b>
          <div>{t('statAgents')}</div>
        </div>
        <div className="dark-panel stat">
          <b className="type">{count(projects)}</b>
          <div>{t('statProjects')}</div>
        </div>
        <Link to="/chat" className="dark-panel stat">
          <b className="type">AI</b>
          <div>{t('statAi')}</div>
        </Link>
      </div>
    </section>
  );
}
