// แสดงคำตอบของ AI ที่เขียนมาเป็น Markdown แบบง่าย
// รองรับ: **ตัวหนา**, รายการ "* " หรือ "- ", รายการเลข "1. ", และย่อหน้า
// ไม่ใช้ innerHTML เลย ข้อความจาก AI จึงไม่สามารถแทรกโค้ด HTML เข้ามาในหน้าได้

// แปลง **ตัวหนา** ในหนึ่งบรรทัดเป็น <strong>
function inline(text, keyPrefix) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

export default function RichText({ text }) {
  const blocks = [];
  let list = null; // { ordered, items: [] }

  const flush = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const raw of String(text ?? '').split('\n')) {
    const line = raw.trim();
    const bullet = line.match(/^[*\-•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);

    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (!list || list.ordered !== ordered) {
        flush();
        list = { ordered, items: [] };
      }
      list.items.push((bullet || numbered)[1]);
    } else if (line === '') {
      flush();
    } else {
      flush();
      blocks.push(line);
    }
  }
  flush();

  return blocks.map((b, i) => {
    if (typeof b === 'string') return <p key={i}>{inline(b, i)}</p>;
    const List = b.ordered ? 'ol' : 'ul';
    return (
      <List key={i}>
        {b.items.map((item, j) => (
          <li key={j}>{inline(item, `${i}-${j}`)}</li>
        ))}
      </List>
    );
  });
}
