import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";

export default function HealthChart({
  healthy,
  unhealthy
}) {

  const data = [
    {
      name: "Healthy",
      value: healthy
    },
    {
      name: "Unhealthy",
      value: unhealthy
    }
  ];

  const COLORS = [
    "#22c55e",
    "#ef4444"
  ];

  return (

    <div className="chartCard">

      <h2>
        Cluster Health
      </h2>

      <PieChart
        width={350}
        height={300}
      >

        <Pie
          data={data}
          dataKey="value"
          outerRadius={100}
        >

          {
            data.map(
              (_, index) => (
                <Cell
                  key={index}
                  fill={
                    COLORS[index]
                  }
                />
              )
            )
          }

        </Pie>

        <Tooltip />
        <Legend />

      </PieChart>

    </div>

  );

}
