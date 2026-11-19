import { useState } from 'react';
import { usePortfolio } from '../portfolio.jsx';
import { asset } from './assets.js';

// แฟ้มประวัตินักสืบ: ข้อมูลทั้งหมดมาจาก GET /api/portfolio (ผ่าน portfolio.jsx)
// หน้า 1 = AGENT-002 (แบบ B), หน้า 2 = AGENT-001 (แบบ A) เรียงตามรหัสจากมากไปน้อย

const ZOOM = { 'AGENT-002': 1.9 }; // รูปที่ถ่ายเต็มตัว ซูมเข้าหาใบหน้าในกรอบ
const safeUrl = (u) => (/^https?:\/\//i.test(String(u || '')) ? String(u) : ''); // ยอมเฉพาะลิงก์ http(s)

// ไอคอนหน้าข้อมูล
const Ico = {
  id: (
    <svg className="ico" viewBox="0 0 24 24">
      <circle cx="12" cy="7.5" r="4.2" />
      <path d="M3.5 21c.8-4.8 4.3-7.3 8.5-7.3s7.7 2.5 8.5 7.3z" />
    </svg>
  ),
  job: (
    <svg className="ico" viewBox="0 0 24 24">
      <path d="M9 4h6a2 2 0 0 1 2 2v1h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2zm0 3h6V6H9z" />
    </svg>
  ),
  mail: (
    <svg className="ico" viewBox="0 0 24 24">
      <path d="M2 5h20v14H2zm2 2v.5l8 5.5 8-5.5V7zm0 3v7h16v-7l-8 5.4z" />
    </svg>
  ),
  gh: (
    <svg className="ico" viewBox="0 0 24 24">
      <path d="M12 1.5a10.5 10.5 0 0 0-3.3 20.5c.5.1.7-.2.7-.5v-1.9c-2.9.6-3.5-1.3-3.5-1.3-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.5 1.2 3.1.9.1-.7.4-1.2.7-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.1.4-2.1 1.1-2.8-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.9 1.1a10 10 0 0 1 5.2 0c2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.5.1 2.8.7.8 1.1 1.7 1.1 2.8 0 4-2.5 4.9-4.8 5.2.4.3.7 1 .7 2v2.9c0 .3.2.6.7.5A10.5 10.5 0 0 0 12 1.5z" />
    </svg>
  ),
};

// ดึงเฉพาะช่องที่แฟ้มใช้ จากข้อมูลสมาชิก 1 คน
function toView(m, projects) {
  const c = m.contact || {};
  return {
    name: m.name || '',
    nick: m.nickname || '',
    code: m.code || '',
    role: m.role || '',
    photo: m.photo || '',
    bio: m.bio || '',
    skills: (m.skills || []).filter(Boolean),
    // m.projects เก็บเป็นรหัส (portfolio.jsx แปลงไว้แล้ว) → หาชื่อและคำอธิบายจากรายการกลาง
    projects: (m.projects || []).map((id) => projects.find((p) => p.id === id)).filter(Boolean),
    email: [].concat(c.email || [])[0] || '',
    github: safeUrl(c.github),
  };
}

const Deco = ({ file, style }) => <img className="dec" src={asset(file)} alt="" style={style} />;

const Ribbon = ({ icon, children }) => (
  <div className="rib">
    <img src={asset(icon)} alt="" />
    <span>{children}</span>
  </div>
);

function Photo({ v }) {
  const [broken, setBroken] = useState(false); // รูปโหลดไม่ได้: เก็บกรอบไว้ ไม่ขึ้นไอคอนภาพแตก
  return (
    <div className={`dphoto${broken ? ' nophoto' : ''}`} style={{ '--zoom': ZOOM[v.code] || 1 }}>
      <div className="frame">
        <img src={v.photo} alt={`รูปของ ${v.name}`} onError={() => setBroken(true)} />
      </div>
    </div>
  );
}

const Projects = ({ v }) => (
  <ul className="checks">
    {v.projects.map((p) => (
      <li key={p.id} title={p.description || ''}>
        {p.title}
      </li>
    ))}
  </ul>
);

const Mail = ({ v }) => (v.email ? <a href={`mailto:${v.email}`}>{v.email}</a> : '-');
const Github = ({ v }) =>
  v.github ? (
    <a href={v.github} target="_blank" rel="noreferrer">
      GitHub ↗
    </a>
  ) : (
    '-'
  );

// แบบ B (AGENT-002)
function LayoutB({ v }) {
  return (
    <>
      <Deco file="d-lamp.webp" style={{ left: '7cqw', top: 0, width: '11cqw' }} />
      <Deco file="d-skyline.webp" style={{ right: '1cqw', top: '.5cqw', width: '25cqw' }} />
      <Deco file="d-pen.webp" style={{ left: '2cqw', bottom: '1.5cqw', width: '44cqw' }} />
      <Deco file="d-seal.webp" style={{ right: '4cqw', bottom: '3cqw', width: '16cqw' }} />
      <div className="in lb">
        <header className="dtitle">
          <div className="banner">แฟ้มประวัติ</div>
          <div className="dsub">INDIVIDUAL DOSSIER</div>
        </header>
        <div className="top">
          <div className="ph">
            <span className="clip" />
            <span className="stampr">{v.code}</span>
            <Photo v={v} />
          </div>
          <div>
            <div className="nm">{v.name}</div>
            {v.nick && <div className="nk">({v.nick})</div>}
            <div className="rolerow">
              <span className="roleb">{v.role}</span>
              <span className="stampr">VERIFIED AGENT</span>
            </div>
            <dl className="facts">
              {Ico.id}
              <dt>รหัสสายลับ</dt>
              <dd>{v.code}</dd>
              {Ico.job}
              <dt>ตำแหน่ง</dt>
              <dd>{v.role}</dd>
              {Ico.mail}
              <dt>อีเมล</dt>
              <dd>
                <Mail v={v} />
              </dd>
              {Ico.gh}
              <dt>GitHub</dt>
              <dd>
                <Github v={v} />
              </dd>
            </dl>
          </div>
        </div>
        <div className="biorow">
          <Deco file="d-globe.webp" style={{ right: '-2cqw', top: '-3cqw', width: '33cqw' }} />
          <Ribbon icon="i-magnifier.webp">ประวัติและความเชี่ยวชาญ</Ribbon>
          <p className="bio">{v.bio}</p>
        </div>
        <div className="skrow">
          <Deco file="d-laptop.webp" style={{ left: '-1cqw', top: 0, width: '22cqw' }} />
          <Ribbon icon="i-gear.webp">ทักษะทางเทคนิค</Ribbon>
          <div className="pills">
            {v.skills.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
        <div className="prrow">
          <Deco file="d-binoculars.webp" style={{ right: '4cqw', top: 0, width: '32cqw' }} />
          <Ribbon icon="i-folder.webp">ผลงานที่เกี่ยวข้อง</Ribbon>
          <Projects v={v} />
        </div>
      </div>
    </>
  );
}

// แบบ A (AGENT-001)
function LayoutA({ v }) {
  return (
    <>
      <Deco file="d-lamp.webp" style={{ left: '9cqw', top: 0, width: '9cqw' }} />
      <Deco file="d-skyline.webp" style={{ right: '1cqw', top: '1cqw', width: '24cqw' }} />
      <Deco file="d-seal.webp" style={{ right: '3cqw', bottom: '2.5cqw', width: '17cqw' }} />
      <div className="in la">
        <header className="dtitle">
          <div className="banner">แฟ้มประวัติ</div>
        </header>
        <div className="top">
          <div className="ph">
            <span className="clip" />
            <Photo v={v} />
          </div>
          <div className="info">
            <span className="stampr">{v.code}</span>
            <dl className="facts">
              <dt>ชื่อ</dt>
              <dd>{v.name}</dd>
              {v.nick && (
                <>
                  <dt>ชื่อเล่น</dt>
                  <dd>{v.nick}</dd>
                </>
              )}
              <dt>ตำแหน่ง</dt>
              <dd>{v.role}</dd>
              {/* ช่องติดต่อย้ายมาไว้ใต้ตำแหน่ง (เดิมอยู่ท้ายแฟ้ม) */}
              <dt>อีเมล</dt>
              <dd>
                <Mail v={v} />
              </dd>
              <dt>GitHub</dt>
              <dd>
                <Github v={v} />
              </dd>
            </dl>
          </div>
        </div>
        <div className="orn" />
        <div className="biorow">
          <Deco file="d-hatset.webp" style={{ right: '-2cqw', top: '-4cqw', width: '38cqw' }} />
          <Ribbon icon="i-feather.webp">ประวัติโดยย่อ</Ribbon>
          <p className="bio">{v.bio}</p>
        </div>
        <Ribbon icon="i-gear.webp">ทักษะทางเทคนิค</Ribbon>
        <ul className="diamonds">
          {v.skills.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <div className="prrow">
          <Deco file="d-typewriter.webp" style={{ right: 0, top: 0, width: '38cqw' }} />
          <Ribbon icon="i-target.webp">ผลงานที่เกี่ยวข้อง</Ribbon>
          <Projects v={v} />
        </div>
      </div>
    </>
  );
}

export default function Dossier() {
  const { members, projects, loading, error, reload } = usePortfolio();
  const [cur, setCur] = useState(0);

  // เรียงตามรหัสจากมากไปน้อย: AGENT-002 เป็นหน้า 1
  const agents = [...members].sort((a, b) => String(b.code || '').localeCompare(String(a.code || ''))).slice(0, 2);
  const m = agents[cur] || agents[0];

  return (
    <>
      <div className="tabs" role="tablist">
        {agents.map((a, i) => (
          <button
            key={a.id ?? i}
            className="tab"
            role="tab"
            type="button"
            aria-selected={i === cur}
            onClick={() => setCur(i)}
          >
            หน้า {i + 1}
            <small>{a.code || a.nickname}</small>
          </button>
        ))}
      </div>
      <div className="pbody" role="tabpanel">
        {!m ? (
          <div className="sheet">
            <div className="dmsg">
              {loading ? (
                'กำลังเปิดแฟ้มประวัติ…'
              ) : (
                <>
                  โหลดแฟ้มประวัติไม่สำเร็จ
                  <small>{error ? 'เซิร์ฟเวอร์อาจกำลังตื่น' : 'ยังไม่มีข้อมูลสมาชิก'}</small>
                  <button type="button" onClick={reload}>
                    ลองใหม่
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <article className="sheet" key={m.code} aria-label={`แฟ้มประวัติ ${m.code} ${m.name}`}>
            {cur === 0 ? <LayoutB v={toView(m, projects)} /> : <LayoutA v={toView(m, projects)} />}
          </article>
        )}
      </div>
    </>
  );
}
