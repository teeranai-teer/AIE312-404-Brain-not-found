import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../settings.jsx';
import { usePortfolio } from '../portfolio.jsx';
import { PortfolioGate } from '../components/Status.jsx';
import ProjectIcon from '../components/ProjectIcon.jsx';
import Tags from '../components/Tags.jsx';

export default function Projects() {
  const { t, pick } = useSettings();
  const { projects, loading } = usePortfolio();
  const { hash } = useLocation();
  const target = decodeURIComponent(hash.slice(1));

  // มาจากลิงก์ /projects#id (หน้าโปรไฟล์) → เลื่อนไปที่การ์ดนั้น
  useEffect(() => {
    if (!target || loading) return;
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [target, loading]);

  return (
    <section className="view">
      <div className="eyebrow">EVIDENCE ARCHIVE / 003</div>
      <h2 className="section-title">{t('projectsTitle')}</h2>
      <p className="section-sub">{t('projectsDesc')}</p>
      <PortfolioGate>
        <div className="grid3">
          {projects.map((p, i) => (
            <article
              className={`paper stack project${p.id === target ? ' highlight' : ''}`}
              id={p.id}
              key={p.id}
            >
              <span className="pin" />
              <div className="project-art">
                <ProjectIcon name={p.icon} />
              </div>
              <div className="agent-id">{t('evidence', { n: String(i + 1).padStart(2, '0') })}</div>
              <h3>{p.title}</h3>
              <p>{pick(p, 'description')}</p>
              <Tags items={p.tags} />
            </article>
          ))}
        </div>
      </PortfolioGate>
    </section>
  );
}
