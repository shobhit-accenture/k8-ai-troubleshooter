import {
  AlertTriangle,
  RotateCcw,
  Boxes
} from "lucide-react";

function getSeverity(reason) {
  if (
    reason === "OOMKilled" ||
    reason === "CrashLoopBackOff" ||
    reason === "Error"
  ) {
    return "critical";
  }

  return "warning";
}

export default function PodIssueCard({ pod }) {
  const severity = getSeverity(pod.reason);

  return (
    <article className={`issue-card issue-${severity}`}>
      <div className="issue-icon">
        <AlertTriangle size={22} />
      </div>

      <div className="issue-main">
        <div className="issue-title-row">
          <h3>{pod.pod_name}</h3>
          <span className={`severity-badge severity-${severity}`}>
            {severity}
          </span>
        </div>

        <div className="issue-meta">
          <span>
            <Boxes size={15} />
            {pod.namespace}
          </span>

          <span>
            <RotateCcw size={15} />
            {pod.restart_count} restarts
          </span>
        </div>
      </div>

      <div className="reason-pill">
        {pod.reason}
      </div>
    </article>
  );
}
