export default function StatCard({
  title,
  value,
  icon: Icon,
  tone = "green",
  caption
}) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-card-top">
        <span className="stat-icon">
          {Icon && <Icon size={22} strokeWidth={2.2} />}
        </span>
        <span className="status-dot" />
      </div>

      <div className="stat-value">{value}</div>
      <div className="stat-title">{title}</div>

      {caption && (
        <div className="stat-caption">{caption}</div>
      )}
    </article>
  );
}
