async function loadDashboard() {

    const health =
        await fetch("/cluster-health")
        .then(r => r.json());

    document.getElementById(
        "totalPods"
    ).innerText = health.total_pods;

    document.getElementById(
        "healthyPods"
    ).innerText = health.healthy_pods;

    document.getElementById(
        "unhealthyPods"
    ).innerText = health.unhealthy_pods;

    const namespaces =
        await fetch("/namespace-summary")
        .then(r => r.json());

    let tbody =
        document.querySelector(
            "#namespaceTable tbody"
        );

    tbody.innerHTML = "";

    Object.keys(namespaces).forEach(ns => {

        let row = `
        <tr>
            <td>${ns}</td>
            <td>${namespaces[ns].total}</td>
            <td>${namespaces[ns].healthy}</td>
            <td>${namespaces[ns].unhealthy}</td>
        </tr>
        `;

        tbody.innerHTML += row;
    });

    const pods =
        await fetch("/unhealthy-pods")
        .then(r => r.json());

    let issues =
        document.getElementById(
            "issues"
        );

    issues.innerHTML = "";

    pods.forEach(pod => {

        issues.innerHTML += `
        <div class="issue-card">
            <b>${pod.pod_name}</b><br>
            ${pod.reason}
        </div>
        `;
    });
}

async function runAnalysis(){

    document.getElementById(
        "analysis"
    ).innerText =
        "Running AI analysis...";

    const result =
        await fetch("/analyze-cluster")
        .then(r => r.json());

    document.getElementById(
        "analysis"
    ).innerText =
        result.analysis;
}

loadDashboard();
