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

    const namespaceData =
      await axios.get("/namespace-summary");

    setNamespaces(namespaceData.data);

    const issueData =
      await axios.get("/unhealthy-pods");

    setIssues(issueData.data);
  }

  async function runAnalysis() {

    setAnalysis(
      "Running AI Root Cause Analysis..."
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
    return (
      <h2 style={{
        padding:"40px"
      }}>
        Loading Kubernetes Data...
      </h2>
    );

  return (

    <div className="container">

      <div className="hero">

        <h1>
          🚀 AKS AI Troubleshooter
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
            Object.keys(
              namespaces
            ).length
          }
          color="green"
        />

      </div>

      <h2
        style={{
          marginBottom:"20px"
        }}
      >
        Namespace Health
      </h2>

      <div className="namespaces">

        {
          Object.entries(
            namespaces
          ).map(
            ([name,data]) => (

              <NamespaceCard
                key={name}
                name={name}
                data={data}
              />

            )
          )
        }

      </div>

      <h2
        style={{
          marginTop:"40px",
          marginBottom:"20px"
        }}
      >
        Critical Issues
      </h2>

      {
        issues.map(
          pod => (

            <PodIssueCard
              key={
                pod.pod_name
              }
              pod={pod}
            />

          )
        )
      }

      <AIAnalysis
        analysis={analysis}
        onAnalyze={runAnalysis}
      />

    </div>

  );
}
