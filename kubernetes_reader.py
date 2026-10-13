import os

from kubernetes import client
from kubernetes import config


def load_kubernetes_config():
    """
    Load Kubernetes configuration.

    Returns:
        True  -> Kubernetes connection available
        False -> Kubernetes connection unavailable
    """

    try:

        if os.getenv("KUBERNETES_SERVICE_HOST"):
            config.load_incluster_config()
        else:
            config.load_kube_config()

        return True

    except Exception:
        return False


def get_cluster_health():

    connected = load_kubernetes_config()

    if not connected:

        return [
            {
                "namespace": "unknown",
                "pod_name": "kubernetes-not-connected",
                "phase": "Unknown",
                "reason": "Kubernetes configuration unavailable",
                "restart_count": 0,
                "healthy": False
            }
        ]

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

                if (
                    container.state.waiting
                    and container.state.waiting.reason
                ):
                    reason = (
                        container.state.waiting.reason
                    )

                elif (
                    container.state.terminated
                    and container.state.terminated.reason
                ):
                    reason = (
                        container.state.terminated.reason
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
