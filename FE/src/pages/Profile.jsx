import { Link, useParams } from 'react-router-dom';
import { useSettings } from '../settings.jsx';
import { usePortfolio } from '../portfolio.jsx';
import { PortfolioGate } from '../components/Status.jsx';
import MemberPhoto from '../components/MemberPhoto.jsx';
import Tags from '../components/Tags.jsx';

export default function Profile() {
  const { t } = useSettings();
  return (
    <section className="view">
      <Link to="/team" className="btn">
        {t('back')}
      </Link>
      <div className="spacer" />
      <PortfolioGate>
        <Dossier />
      </PortfolioGate>
    </section>
  );
}

function Dossier() {
  const { id } = useParams();
  const { t, pick } = useSettings();
  const { members, projects } = usePortfolio();
  const m = members.find((x) => String(x.id) === id);

  if (!m) {
    return (
      <div className="paper not-found">
        <div className="stamp">404</div>
        <h3>{t('memberNotFound')}</h3>
      </div>
    );
  }

  // member.projects เก็บเป็น id → หาโปรเจกต์ตัวจริงจากรายการของกลุ่ม
  const linked = (m.projects ?? [])
    .map((pid) => projects.find((p) => p.id === pid))
    .filter(Boolean);

  return (
    <>
      <div className="eyebrow">INDIVIDUAL DOSSIER</div>
      <h2 className="section-title">{m.name} — Dossier</h2>
      <div className="profile-layout">
        <div className="paper profile-card">
          <span className="pin" />
          <MemberPhoto member={m} className="big" />
          <div className="agent-id">{m.code}</div>
          <h3>{m.name}</h3>
          <p className="role">{pick(m, 'role')}</p>
          <div className="stamp small">VERIFIED AGENT</div>
        </div>

        <div className="paper bio-card">
          <div className="type case-label">BIOGRAPHICAL RECORD</div>
          <h3 className="thai-display">{t('bio')}</h3>
          <p>{pick(m, 'bio')}</p>
          <h3 className="thai-display">{t('skills')}</h3>
          <Tags items={m.skills} />
        </div>

        <div className="paper evidence-card">
          <div className="type case-label">LINKED EVIDENCE</div>
          <h3 className="thai-display">{t('linked')}</h3>
          {linked.length === 0 && <p className="role">{t('noLinked')}</p>}
          {linked.map((p) => (
            <Link to={`/projects#${p.id}`} className="evidence-link" key={p.id}>
              ▣ {p.title} ↗
            </Link>
          ))}
          {m.contact && <ContactLinks contact={m.contact} />}
        </div>
      </div>
    </>
  );
}

export function ContactLinks({ contact }) {
  // email อาจเป็นสตริงเดียว (สมาชิก) หรืออาร์เรย์ (กลุ่ม)
  // [].concat(...) แปลงเป็นอาร์เรย์เสมอ แล้ววนแสดงทีละอีเมล ไม่ให้ต่อกันเป็นก้อนเดียว
  // ?? [] กันกรณีไม่มีอีเมล filter(Boolean) ตัดค่าว่างทิ้ง
  const emails = [].concat(contact.email ?? []).filter(Boolean);

  return (
    <div className="contact-links">
      {emails.map((email) => (
        <a key={email} href={`mailto:${email}`}>
          ✉ {email}
        </a>
      ))}
      {contact.github && (
        <a href={contact.github} target="_blank" rel="noreferrer">
          ⌥ GitHub ↗
        </a>
      )}
    </div>
  );
}
