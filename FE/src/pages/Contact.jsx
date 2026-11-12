import { Link } from 'react-router-dom';
import { useSettings } from '../settings.jsx';
import { usePortfolio } from '../portfolio.jsx';
import { PortfolioGate } from '../components/Status.jsx';
import { ContactLinks } from './Profile.jsx';

export default function Contact() {
  const { t, pick } = useSettings();
  const { group, members } = usePortfolio();

  return (
    <section className="view">
      <div className="eyebrow">CONTACT DIRECTORY / 006</div>
      <h2 className="section-title">{t('contactTitle')}</h2>
      <PortfolioGate>
        <div className="contact-grid">
          <div className="paper contact-card">
            <div className="type">404 BRAIN NOT FOUND</div>
            <h3>{t('contactHeading')}</h3>
            <p>{t('contactDesc')}</p>
            {group?.contact && <ContactLinks contact={group.contact} />}
            <Link to="/" className="btn outline">
              {t('backHome')}
            </Link>
          </div>
          <div className="paper contact-card">
            <div className="type">PERSONNEL DIRECTORY</div>
            <h3>{t('contactMembers')}</h3>
            {members.map((m) => (
              <div className="contact-person" key={m.id}>
                <Link to={`/team/${m.id}`} className="agent-id">
                  {m.code} · {m.name}
                </Link>
                <div className="role">{pick(m, 'role')}</div>
                {m.contact && <ContactLinks contact={m.contact} />}
              </div>
            ))}
          </div>
        </div>
      </PortfolioGate>
    </section>
  );
}
