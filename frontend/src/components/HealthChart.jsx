import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";

export default function HealthChart({
  healthy,
  unhealthy
}) {
  const total = healthy + unhealthy;
  const percentage = total
    ? Math.round((healthy / total) * 100)
    : 0;

  const data = [
    { name: "Healthy", value: healthy, color: "#00a651" },
    { name: "Unhealthy", value: unhealthy, color: "#e5484d" }
  ];

  return (
    <section className="panel health-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">LIVE CLUSTER</span>
          <h2>Cluster health</h2>
        </div>

        <span className="live-chip">
          <span className="live-dot" />
          Connected
        </span>
      </div>

      <div className="health-content">
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={255}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={76}
                outerRadius={105}
                paddingAngle={5}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {data.map((item) => (
                  <Cell
                    key={item.name}
                    fill={item.color}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #dce9e1",
                  boxShadow: "0 10px 30px rgba(20,70,45,.12)"
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="chart-center">
            <strong>{percentage}%</strong>
            <span>healthy</span>
          </div>
        </div>

        <div className="health-legend">
          <div className="legend-item">
            <span className="legend-marker legend-good" />
            <div>
              <strong>{healthy}</strong>
              <span>Healthy pods</span>
            </div>
          </div>

          <div className="legend-item">
            <span className="legend-marker legend-bad" />
            <div>
              <strong>{unhealthy}</strong>
              <span>Require attention</span>
            </div>
          </div>

          <div className="health-message">
            {unhealthy === 0
              ? "All monitored workloads are healthy."
              : `${unhealthy} workload${unhealthy === 1 ? "" : "s"} require attention.`}
          </div>
        </div>
      </div>
    </section>
  );
}
