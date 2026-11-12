import { useSettings } from '../settings.jsx';

const THEME_OPTIONS = [
  { id: 'default', label: 'Detective Default' },
  { id: 'noir', label: 'Noir Dark' },
  { id: 'light', label: 'Light Paper' },
];

const LANG_OPTIONS = [
  { id: 'th', label: 'ภาษาไทย' },
  { id: 'en', label: 'English' },
];

export default function Settings() {
  const { t, theme, setTheme, lang, setLang } = useSettings();

  return (
    <section className="view">
      <div className="eyebrow">CONTROL PANEL / 005</div>
      <h2 className="section-title">{t('settingsTitle')}</h2>
      <p className="section-sub">{t('settingsDesc')}</p>
      <div className="setting-grid">
        <div className="paper setting">
          <div className="type">VISUAL APPEARANCE</div>
          <h3>{t('themeTitle')}</h3>
          <Choices options={THEME_OPTIONS} value={theme} onChange={setTheme} />
        </div>
        <div className="paper setting">
          <div className="type">LANGUAGE CONFIGURATION</div>
          <h3>{t('langTitle')}</h3>
          <Choices options={LANG_OPTIONS} value={lang} onChange={setLang} />
          <p className="role setting-note">{t('langNote')}</p>
        </div>
      </div>
    </section>
  );
}

function Choices({ options, value, onChange }) {
  return (
    <div className="choices">
      {options.map((o) => (
        <button
          key={o.id}
          className={`choice${value === o.id ? ' selected' : ''}`}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
