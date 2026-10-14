export default function PodIssueCard({
  pod
}) {

  return (

    <div className="issueCard">

      <h3>
        🚨 {pod.pod_name}
      </h3>

      <p>
        Restarts:
        {" "}
        {pod.restart_count}
      </p>

      <div className="severity">
        {pod.reason}
      </div>

    </div>

  );

}
