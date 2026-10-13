export default function NamespaceCard({
  name,
  data
}) {
  return (
    <div className="namespaceCard">

      <h3>{name}</h3>

      <p>Total: {data.total}</p>

      <p>Healthy: {data.healthy}</p>

      <p>Unhealthy: {data.unhealthy}</p>

    </div>
  );
}
