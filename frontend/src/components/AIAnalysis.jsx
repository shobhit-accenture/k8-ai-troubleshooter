export default function AIAnalysis({
  analysis,
  onAnalyze
}) {
  return (
    <div className="analysisPanel">

      <h2>
        🤖 AI Analysis
      </h2>

      <button onClick={onAnalyze}>
        Analyze Cluster
      </button>

      <div className="analysisText">
        {analysis}
      </div>

    </div>
  );
}
