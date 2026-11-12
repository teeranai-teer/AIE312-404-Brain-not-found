import { createContext, useContext, useEffect, useState } from 'react';
import { dict } from './i18n.js';

// เก็บค่าที่ผู้ใช้ตั้งไว้ (ธีม + ภาษา) และให้ทุกหน้าเรียกใช้ผ่าน useSettings()
const SettingsContext = createContext(null);

export const THEMES = ['default', 'noir', 'light'];
export const LANGS = ['th', 'en'];

function load(key, allowed, fallback) {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* โหมดไม่ระบุตัวตนบางเบราว์เซอร์เขียน localStorage ไม่ได้ ก็ไม่เป็นไร */
  }
}

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(() => load('detective-theme', THEMES, 'default'));
  const [lang, setLang] = useState(() => load('detective-lang', LANGS, 'th'));

  useEffect(() => {
    document.body.classList.remove('theme-noir', 'theme-light');
    if (theme !== 'default') document.body.classList.add(`theme-${theme}`);
    save('detective-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    save('detective-lang', lang);
  }, [lang]);

  // t('navHome') → ข้อความตามภาษาที่เลือก ถ้าไม่มีคำแปลใช้ภาษาไทยแทน
  const t = (key, vars = {}) => {
    let text = dict[lang][key] ?? dict.th[key] ?? key;
    for (const [name, value] of Object.entries(vars)) text = text.replace(`{${name}}`, value);
    return text;
  };

  // pick(member, 'bio') → member.bio_en ถ้าเลือกอังกฤษและมีข้อมูล ไม่งั้นใช้ member.bio
  const pick = (obj, field) => {
    if (!obj) return '';
    if (lang === 'en' && obj[`${field}_en`]) return obj[`${field}_en`];
    return obj[field] ?? '';
  };

  return (
    <SettingsContext.Provider value={{ theme, setTheme, lang, setLang, t, pick }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
