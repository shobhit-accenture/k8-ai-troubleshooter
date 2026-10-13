import os

from kubernetes import client
from kubernetes import config


def load_kubernetes_config():
    """
    Local development:
        uses ~/.kube/config

    Containerized environment:
        uses in-cluster service account
    """

    try:
        if os.getenv("KUBERNETES_SERVICE_HOST"):
            config.load_incluster_config()
        else:
            config.load_kube_config()

    except Exception as ex:
        raise Exception(
            f"Unable to load Kubernetes configuration: {str(ex)}"
        )


def get_cluster_health():

    load_kubernetes_config()

    v1 = client.CoreV1Api()

    pods = v1.list_pod_for_all_namespaces()

    results = []

    for pod in pods.items:

        phase = pod.status.phase

        reason = ""
        restart_count = 0

        if pod.status.container_statuses:

            for container in pod.status.container_statuses:

                restart_count += container.restart_count

                if container.state.waiting:

                    reason = (
                        container.state.waiting.reason
                        or "Unknown"
                    )

                elif container.state.terminated:

                    reason = (
                        container.state.terminated.reason
                        or "Unknown"
                    )

                elif container.state.running:

                    reason = "Running"

        healthy = (
            phase == "Running"
            and reason not in [
                "CrashLoopBackOff",
                "ImagePullBackOff",
                "ErrImagePull",
                "OOMKilled",
                "CreateContainerConfigError"
            ]
        )

        results.append(
            {
                "namespace": pod.metadata.namespace,
                "pod_name": pod.metadata.name,
                "phase": phase,
                "reason": reason,
                "restart_count": restart_count,
                "healthy": healthy
            }
        )

    return results
