import {
  Boxes,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function NamespaceCard({
  name,
  data
}) {
  const isHealthy = data.unhealthy === 0;
  const percentage = data.total
    ? Math.round((data.healthy / data.total) * 100)
    : 0;

  return (
    <article
      className={`namespace-card ${
        isHealthy ? "namespace-good" : "namespace-bad"
      }`}
    >
      <div className="namespace-card-header">
        <div className="namespace-icon">
          <Boxes size={21} />
        </div>

        <div>
          <h3>{name}</h3>
          <span>
            {isHealthy ? "Operating normally" : "Attention required"}
          </span>
        </div>

        <span
          className={`namespace-state ${
            isHealthy ? "state-good" : "state-bad"
          }`}
        >
          {isHealthy ? "Healthy" : "At risk"}
        </span>
      </div>

      <div className="namespace-progress">
        <span style={{ width: `${percentage}%` }} />
      </div>

      <div className="namespace-metrics">
        <div>
          <Boxes size={16} />
          <span>Total</span>
          <strong>{data.total}</strong>
        </div>

        <div>
          <CheckCircle2 size={16} />
          <span>Healthy</span>
          <strong>{data.healthy}</strong>
        </div>

        <div>
          <AlertTriangle size={16} />
          <span>Issues</span>
          <strong>{data.unhealthy}</strong>
        </div>
      </div>
    </article>
  );
}
