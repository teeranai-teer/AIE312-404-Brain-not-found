import logo from '../assets/detective.webp';

// ถ้าสมาชิกมีรูป (member.photo เป็น URL) ใช้รูปนั้น ไม่มีก็ใช้รูปนักสืบแทน
export default function MemberPhoto({ member, className = '' }) {
  return (
    <div className={`photo ${className}`}>
      <img
        src={member.photo || logo}
        alt={member.photo ? member.name : ''}
        className={member.photo ? 'real' : ''}
        loading="lazy"
      />
    </div>
  );
}
