export default function StatCard({
  title,
  value,
  color
}) {
  return (
    <div className={`card ${color}`}>
      <div className="cardTitle">
        {title}
      </div>

      <div className="cardValue">
        {value}
      </div>
    </div>
  );
}
