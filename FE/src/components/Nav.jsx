import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSettings } from '../settings.jsx';
import logo from '../assets/detective.png';

const LINKS = [
  { to: '/', key: 'navHome', end: true },
  { to: '/team', key: 'navTeam' },
  { to: '/projects', key: 'navProjects' },
  { to: '/chat', key: 'navChat' },
  { to: '/settings', key: 'navSettings', icon: '⚙ ' },
];

export default function Nav() {
  const { t } = useSettings();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // ปิดเมนูมือถือทุกครั้งที่เปลี่ยนหน้า
  useEffect(() => setOpen(false), [pathname]);

  const linkClass = ({ isActive }) => `navbtn${isActive ? ' active' : ''}`;

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <img src={logo} alt="" width="60" height="45" />
          <div>
            <strong>404 Brain Not Found</strong>
            <small>DETECTIVE DEVELOPMENT TEAM</small>
          </div>
        </Link>
        <button
          className="mobile-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label={t('menu')}
          aria-expanded={open}
          aria-controls="navlinks"
        >
          ☰
        </button>
        <div className={`links${open ? ' open' : ''}`} id="navlinks">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.icon}
              {t(l.key)}
            </NavLink>
          ))}
          <NavLink to="/contact" className={(s) => `${linkClass(s)} contact`}>
            {t('navContact')}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
