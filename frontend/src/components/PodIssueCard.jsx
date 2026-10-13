export default function PodIssueCard({
  pod
}) {
  return (
    <div className="issueCard">

      <h4>{pod.pod_name}</h4>

      <p>{pod.reason}</p>

      <p>
        Restarts: {pod.restart_count}
      </p>

    </div>
  );
}
