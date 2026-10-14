import {
  BrainCircuit,
  Sparkles,
  LoaderCircle
} from "lucide-react";

export default function AIAnalysis({
  analysis,
  onAnalyze,
  loading
}) {
  return (
    <section className="panel ai-panel">
      <div className="panel-heading">
        <div className="ai-heading">
          <span className="ai-icon">
            <BrainCircuit size={24} />
          </span>

          <div>
            <span className="eyebrow">AZURE OPENAI</span>
            <h2>AI root cause analysis</h2>
          </div>
        </div>

        <button
          className="primary-button"
          onClick={onAnalyze}
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle className="spin" size={18} />
              Analysing
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analyse cluster
            </>
          )}
        </button>
      </div>

      {!analysis ? (
        <div className="ai-placeholder">
          <Sparkles size={28} />
          <div>
            <strong>Generate an intelligent cluster assessment</strong>
            <p>
              Review root causes, operational impact, remediation steps,
              and priority order for current workload issues.
            </p>
          </div>
        </div>
      ) : (
        <div className="analysis-text">
          {analysis}
        </div>
      )}
    </section>
  );
}
