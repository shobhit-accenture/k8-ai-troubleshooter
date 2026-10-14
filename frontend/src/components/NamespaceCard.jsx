export default function NamespaceCard({
  name,
  data
}) {

  const healthy =
    data.unhealthy === 0;

  return (

    <div
      className={
        healthy
          ? "namespaceCard healthyNs"
          : "namespaceCard badNs"
      }
    >
      <h3>{name}</h3>

      <p>
        Total Pods:
        {" "}
        {data.total}
      </p>

      <p>
        Healthy:
        {" "}
        {data.healthy}
      </p>

      <p>
        Unhealthy:
        {" "}
        {data.unhealthy}
      </p>

    </div>

  );
}
