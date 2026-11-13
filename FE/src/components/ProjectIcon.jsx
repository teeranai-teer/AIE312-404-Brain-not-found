// ไอคอนลายเส้นของแต่ละโปรเจกต์ — JSON ส่งมาแค่ชื่อ เช่น "icon": "robot"
const PATHS = {
  plant: (
    <>
      <path d="M55 90V49M55 53Q22 50 24 22Q51 24 55 53ZM55 63Q88 61 88 30Q62 31 55 63Z" />
      <path d="M32 90h46l-5 18H37Z" />
    </>
  ),
  factory: (
    <>
      <path d="M15 101V55l24 14V55l24 14V42h36v59Z" />
      <path d="M72 42V20h17v22M23 85h12m9 0h12m13 0h12" />
    </>
  ),
  robot: (
    <>
      <rect x="22" y="32" width="76" height="62" rx="10" />
      <path d="M60 32V16m-7 0h14M38 58h8m27 0h8M39 79q21 13 42 0M13 53v23m94-23v23" />
    </>
  ),
  web: (
    <>
      <rect x="10" y="19" width="100" height="82" rx="6" />
      <path d="M10 39h100M23 29h3m8 0h3m8 0h3M24 52h29v35H24Zm39 0h33M63 64h33M63 76h24" />
    </>
  ),
  // ใช้เมื่อไม่รู้จักชื่อไอคอน
  file: (
    <>
      <path d="M30 12h42l20 20v76H30Z" />
      <path d="M72 12v20h20M42 52h38M42 66h38M42 80h24" />
    </>
  ),
};

export default function ProjectIcon({ name }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      {PATHS[name] ?? PATHS.file}
    </svg>
  );
}
