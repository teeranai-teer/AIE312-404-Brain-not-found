import { Link } from 'react-router-dom';
import { useSettings } from '../settings.jsx';
import { usePortfolio } from '../portfolio.jsx';
import { PortfolioGate } from '../components/Status.jsx';
import MemberPhoto from '../components/MemberPhoto.jsx';
import Tags from '../components/Tags.jsx';

export default function Team() {
  const { t, pick } = useSettings();
  const { members } = usePortfolio();

  return (
    <section className="view">
      <div className="eyebrow">PERSONNEL RECORDS / 002</div>
      <h2 className="section-title">{t('teamTitle')}</h2>
      <p className="section-sub">{t('teamDesc')}</p>
      <PortfolioGate>
        <div className="grid2">
          {members.map((m) => (
            <article className="paper stack agent" key={m.id}>
              <span className="pin" />
              <div className="agent-inner">
                <MemberPhoto member={m} />
                <div className="agent-body">
                  <div className="agent-id">{m.code}</div>
                  <h3>{m.name}</h3>
                  <div className="role">
                    {t('role')}: {pick(m, 'role')}
                  </div>
                  <Tags items={m.skills?.slice(0, 5)} />
                  <Link to={`/team/${m.id}`} className="btn outline">
                    {t('viewProfile')}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </PortfolioGate>
    </section>
  );
}
