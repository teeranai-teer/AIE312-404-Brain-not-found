export default function Tags({ items = [] }) {
  return (
    <div className="tags">
      {items.map((s) => (
        <span className="tag" key={s}>
          {s}
        </span>
      ))}
    </div>
  );
}
