import { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  CloudCog,
  RefreshCw,
  ShieldCheck
} from "lucide-react";

import StatCard from "../components/StatCard";
import NamespaceCard from "../components/NamespaceCard";
import PodIssueCard from "../components/PodIssueCard";
import AIAnalysis from "../components/AIAnalysis";
import HealthChart from "../components/HealthChart";

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [namespaces, setNamespaces] = useState({});
  const [issues, setIssues] = useState([]);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [healthRes, namespaceRes, issueRes] =
        await Promise.all([
          axios.get("/cluster-health"),
          axios.get("/namespace-summary"),
          axios.get("/unhealthy-pods")
        ]);

      setHealth(healthRes.data);
      setNamespaces(namespaceRes.data);
      setIssues(issueRes.data);
    } catch (requestError) {
      console.error(requestError);
      setError(
        "Unable to load cluster data. Check the FastAPI service and AKS connection."
      );
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis() {
    try {
      setAnalysisLoading(true);
      setAnalysis("");

      const response =
        await axios.get("/analyze-cluster");

      setAnalysis(response.data.analysis);
    } catch (requestError) {
      console.error(requestError);
      setAnalysis(
        "AI analysis could not be completed. Check the Azure OpenAI configuration."
      );
    } finally {
      setAnalysisLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <CloudCog size={34} />
        </div>
        <h2>Loading cluster intelligence</h2>
        <p>Connecting securely to AKS...</p>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="loading-screen">
        <AlertTriangle size={36} />
        <h2>Dashboard unavailable</h2>
        <p>{error}</p>
        <button className="primary-button" onClick={loadData}>
          <RefreshCw size={18} />
          Retry
        </button>
      </div>
    );
  }

  const namespaceCount = Object.keys(namespaces).length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <CloudCog size={28} />
          </div>

          <div>
            <strong>AKS AI Troubleshooter</strong>
            <span>Kubernetes Health Platform</span>
          </div>
        </div>

        <div className="topbar-actions">
          <span className="secure-chip">
            <ShieldCheck size={17} />
            Managed Identity
          </span>

          <button className="refresh-button" onClick={loadData}>
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-label">
              LIVE AKS OPERATIONS
            </span>

            <h1>
              Clear insight into every Kubernetes workload.
            </h1>

            <p>
              Monitor cluster health, identify critical failures, and
              generate AI-assisted remediation guidance from one secure
              workspace.
            </p>

            <div className="hero-actions">
              <button
                className="hero-primary"
                onClick={runAnalysis}
              >
                Analyse cluster
              </button>

              <span className="hero-status">
                <span className="pulse" />
                AKS connected
              </span>
            </div>
          </div>

          <div className="hero-score">
            <span>Cluster health</span>
            <strong>
              {Math.round(
                (health.healthy_pods / health.total_pods) * 100
              )}%
            </strong>
            <small>
              {health.healthy_pods} of {health.total_pods} pods healthy
            </small>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard
            title="Total pods"
            value={health.total_pods}
            tone="blue"
            icon={Boxes}
            caption="Across all namespaces"
          />

          <StatCard
            title="Healthy pods"
            value={health.healthy_pods}
            tone="green"
            icon={CheckCircle2}
            caption="Operating normally"
          />

          <StatCard
            title="Active issues"
            value={health.unhealthy_pods}
            tone="red"
            icon={AlertTriangle}
            caption="Require investigation"
          />

          <StatCard
            title="Namespaces"
            value={namespaceCount}
            tone="teal"
            icon={Activity}
            caption="Currently monitored"
          />
        </section>

        <section className="overview-grid">
          <HealthChart
            healthy={health.healthy_pods}
            unhealthy={health.unhealthy_pods}
          />

          <section className="panel summary-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">CURRENT STATE</span>
                <h2>Operational summary</h2>
              </div>
            </div>

            <div className="summary-alert">
              <AlertTriangle size={25} />
              <div>
                <strong>
                  {health.unhealthy_pods} workloads require attention
                </strong>
                <p>
                  Review failures below or generate AI remediation
                  guidance.
                </p>
              </div>
            </div>

            <div className="summary-list">
              {issues.slice(0, 3).map((pod) => (
                <div key={pod.pod_name}>
                  <span>{pod.reason}</span>
                  <strong>{pod.restart_count} restarts</strong>
                </div>
              ))}
            </div>

            <button
              className="summary-action"
              onClick={runAnalysis}
            >
              Generate AI assessment
            </button>
          </section>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">WORKLOAD SEGMENTATION</span>
              <h2>Namespace health</h2>
            </div>
            <span className="section-count">
              {namespaceCount} namespaces
            </span>
          </div>

          <div className="namespace-grid">
            {Object.entries(namespaces).map(([name, data]) => (
              <NamespaceCard
                key={name}
                name={name}
                data={data}
              />
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PRIORITISED FINDINGS</span>
              <h2>Critical workloads</h2>
            </div>
            <span className="section-count danger-count">
              {issues.length} open issues
            </span>
          </div>

          <div className="issues-grid">
            {issues.map((pod) => (
              <PodIssueCard
                key={pod.pod_name}
                pod={pod}
              />
            ))}
          </div>
        </section>

        <AIAnalysis
          analysis={analysis}
          onAnalyze={runAnalysis}
          loading={analysisLoading}
        />

        <footer>
          <span>AKS AI Troubleshooter</span>
          <span>Secured with Azure Managed Identity</span>
        </footer>
      </main>
    </div>
  );
}
