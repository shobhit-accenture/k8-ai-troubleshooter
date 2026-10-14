import { useEffect, useState } from "react";
import axios from "axios";

import StatCard from "../components/StatCard";
import NamespaceCard from "../components/NamespaceCard";
import PodIssueCard from "../components/PodIssueCard";
import AIAnalysis from "../components/AIAnalysis";

export default function Dashboard() {

  const [health, setHealth] = useState(null);
  const [namespaces, setNamespaces] = useState({});
  const [issues, setIssues] = useState([]);
  const [analysis, setAnalysis] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const healthData =
      await axios.get("/cluster-health");

    setHealth(healthData.data);

    const ns =
      await axios.get(
        "/namespace-summary"
      );

    setNamespaces(ns.data);

    const pods =
      await axios.get(
        "/unhealthy-pods"
      );

    setIssues(pods.data);
  }

  async function runAnalysis() {

    setAnalysis(
      "Running AI Analysis..."
    );

    const result =
      await axios.get(
        "/analyze-cluster"
      );

    setAnalysis(
      result.data.analysis
    );
  }

  if (!health)
    return <h1>Loading...</h1>;

  return (

    <div className="container">

      <div className="hero">

  <h1>
    AKS AI Troubleshooter
  </h1>

  <p>
    AI Powered Kubernetes Health Platform
  </p>

</div>

      <div className="cards">

        <StatCard
          title="Total Pods"
          value={health.total_pods}
          color="blue"
        />

        <StatCard
          title="Healthy Pods"
          value={health.healthy_pods}
          color="green"
        />

        <StatCard
          title="Issues"
          value={health.unhealthy_pods}
          color="red"
        />

        <StatCard
          title="Namespaces"
          value={
          Object.keys(namespaces).length
          }
          color="green"
          />

      </div>

      <h2>Namespaces</h2>

      <div className="namespaces">

        {
          Object.entries(
            namespaces
          ).map(
            ([name,data]) =>
              (
                <NamespaceCard
                  key={name}
                  name={name}
                  data={data}
                />
              )
          )
        }

      </div>

      <h2>Unhealthy Workloads</h2>

      <div className="issues">

        {
          issues.map(
            pod =>
              (
                <PodIssueCard
                  key={pod.pod_name}
                  pod={pod}
                />
              )
          )
        }

      </div>

      <AIAnalysis
        analysis={analysis}
        onAnalyze={runAnalysis}
      />

    </div>

  );
}
