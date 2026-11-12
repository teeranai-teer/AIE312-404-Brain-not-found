# FE — 404 Brain Not Found

React + Vite + react-router-dom (JavaScript)

## รันในเครื่อง

```bash
cd FE
npm install
cp .env.example .env     # ตั้ง VITE_API_URL (เว้นว่าง = ใช้ข้อมูลปลอม)
npm run dev              # เปิด http://localhost:5173
```

- `VITE_API_URL` ว่าง → **โหมดจำลอง** ใช้ข้อมูลจาก `src/data/mockPortfolio.js` และ `src/mockApi.js`
  (พิมพ์ `#error` ในแชตเพื่อทดสอบหน้าตอน error)
- `VITE_API_URL=http://localhost:3000` → เรียก BE จริง (ต้องรัน BE ด้วย)

## หน้าในเว็บ

| Route | หน้า |
|---|---|
| `/` | Home |
| `/team` | สมาชิกทั้งหมด |
| `/team/:id` | โปรไฟล์รายคน |
| `/projects` | ผลงาน |
| `/chat` | AI Chat (ประวัติแฟ้มสนทนาเก็บใน localStorage, ข้อความโหลดจาก BE) |
| `/settings` | ธีม + ภาษา TH/EN |
| `/contact` | ช่องทางติดต่อ |

## โครงไฟล์หลัก

```
src/
  api.js            ที่เดียวที่เรียก BE (getPortfolio, sendMessage, getHistory)
  mockApi.js        BE ปลอม ใช้ตอนไม่มี VITE_API_URL
  errors.js         ApiError + แปลง error เป็นข้อความ
  portfolio.jsx     โหลด /api/portfolio ครั้งเดียวแล้วแชร์ทุกหน้า
  settings.jsx      ธีม + ภาษา + ฟังก์ชัน t() / pick()
  sessions.js       รายการแฟ้มสนทนาใน localStorage
  i18n.js           คำแปล TH/EN
  pages/            หน้าแต่ละหน้า
  components/       ชิ้นส่วนที่ใช้ซ้ำ
```

## รูปแบบข้อมูลที่ FE คาดหวังจาก `GET /api/portfolio`

```json
{
  "group": {
    "name": "", "tagline": "", "description": "", "description_en": "",
    "contact": { "email": "", "github": "" },
    "projects": [
      { "id": "unilink", "title": "", "description": "", "description_en": "",
        "tags": [], "icon": "plant | factory | robot | web" }
    ]
  },
  "members": [
    { "id": "tonn", "code": "AGENT-001", "name": "", "role": "", "bio": "", "bio_en": "",
      "skills": [], "projects": ["unilink"], "photo": null,
      "contact": { "email": "", "github": "" } }
  ]
}
```

field ที่ลงท้าย `_en` ไม่บังคับ ถ้าไม่มีจะแสดงภาษาไทยแทน

## Deploy (Render Static Site)

- Root Directory: `FE`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment: `VITE_API_URL=<URL ของ BE บน Render>`
- Redirects/Rewrites: Source `/*` → Destination `/index.html` → Action **Rewrite**
  (ถ้าไม่ตั้ง รีเฟรชหน้า `/chat` จะเจอ 404)
