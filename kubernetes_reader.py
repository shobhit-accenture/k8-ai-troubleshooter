import base64
import os
import tempfile

from azure.identity import DefaultAzureCredential
from azure.mgmt.containerservice import ContainerServiceClient
from kubernetes import client, config


PROBLEM_REASONS = {
    "CrashLoopBackOff",
    "ImagePullBackOff",
    "ErrImagePull",
    "OOMKilled",
    "CreateContainerConfigError",
    "RunContainerError",
    "InvalidImageName"
}


def running_in_container_apps():
    return bool(
        os.getenv("IDENTITY_ENDPOINT")
        or os.getenv("MSI_ENDPOINT")
        or os.getenv("CONTAINER_APP_NAME")
    )


def create_aks_kubeconfig_with_managed_identity():
    subscription_id = os.getenv("AZURE_SUBSCRIPTION_ID")
    resource_group = os.getenv("AKS_RESOURCE_GROUP")
    cluster_name = os.getenv("AKS_CLUSTER_NAME")

    missing = []

    if not subscription_id:
        missing.append("AZURE_SUBSCRIPTION_ID")

    if not resource_group:
        missing.append("AKS_RESOURCE_GROUP")

    if not cluster_name:
        missing.append("AKS_CLUSTER_NAME")

    if missing:
        raise RuntimeError(
            "Missing environment variables: "
            + ", ".join(missing)
        )

    credential = DefaultAzureCredential(
        exclude_interactive_browser_credential=True
    )

    aks_client = ContainerServiceClient(
        credential=credential,
        subscription_id=subscription_id
    )

    credential_result = (
        aks_client.managed_clusters
        .list_cluster_user_credentials(
            resource_group_name=resource_group,
            resource_name=cluster_name
        )
    )

    if not credential_result.kubeconfigs:
        raise RuntimeError(
            "AKS returned no cluster user kubeconfig."
        )

    kubeconfig_value = (
        credential_result.kubeconfigs[0].value
    )

    if isinstance(kubeconfig_value, bytes):
        kubeconfig_bytes = kubeconfig_value

    elif isinstance(kubeconfig_value, bytearray):
        kubeconfig_bytes = bytes(kubeconfig_value)

    elif isinstance(kubeconfig_value, str):
        stripped_value = kubeconfig_value.strip()

        if stripped_value.startswith(
            ("apiVersion:", "{")
        ):
            kubeconfig_bytes = stripped_value.encode(
                "utf-8"
            )
        else:
            kubeconfig_bytes = base64.b64decode(
                stripped_value
            )

    else:
        raise RuntimeError(
            "Unsupported kubeconfig value type: "
            f"{type(kubeconfig_value).__name__}"
        )

    kubeconfig_path = os.path.join(
        tempfile.gettempdir(),
        "aks-container-app-kubeconfig"
    )

    with open(kubeconfig_path, "wb") as kubeconfig_file:
        kubeconfig_file.write(kubeconfig_bytes)

    return kubeconfig_path


def load_kubernetes_config():
    try:
        if running_in_container_apps():
            kubeconfig_path = (
                create_aks_kubeconfig_with_managed_identity()
            )

            config.load_kube_config(
                config_file=kubeconfig_path
            )

            return {
                "connected": True,
                "authentication": "managed-identity"
            }

        config.load_kube_config()

        return {
            "connected": True,
            "authentication": "local-kubeconfig"
        }

    except Exception as error:
        return {
            "connected": False,
            "authentication": "unavailable",
            "error": str(error)
        }


def get_cluster_health():
    connection = load_kubernetes_config()

    if not connection["connected"]:
        return [
            {
                "namespace": "unknown",
                "pod_name": "kubernetes-not-connected",
                "phase": "Unknown",
                "reason": connection.get(
                    "error",
                    "Kubernetes configuration unavailable"
                ),
                "restart_count": 0,
                "healthy": False,
                "authentication": connection.get(
                    "authentication",
                    "unknown"
                )
            }
        ]

    try:
        v1 = client.CoreV1Api()

        pods = v1.list_pod_for_all_namespaces(
            _request_timeout=30
        )

    except Exception as error:
        return [
            {
                "namespace": "unknown",
                "pod_name": "kubernetes-api-error",
                "phase": "Unknown",
                "reason": str(error),
                "restart_count": 0,
                "healthy": False,
                "authentication": connection[
                    "authentication"
                ]
            }
        ]

    results = []

    for pod in pods.items:
        phase = pod.status.phase or "Unknown"
        reason = ""
        restart_count = 0

        if pod.status.container_statuses:
            for container_status in (
                pod.status.container_statuses
            ):
                restart_count += (
                    container_status.restart_count or 0
                )

                state = container_status.state

                if state.waiting:
                    reason = (
                        state.waiting.reason or "Waiting"
                    )

                elif state.terminated:
                    reason = (
                        state.terminated.reason
                        or "Terminated"
                    )

                elif state.running and not reason:
                    reason = "Running"

                last_state = container_status.last_state

                if (
                    last_state
                    and last_state.terminated
                    and last_state.terminated.reason
                    in PROBLEM_REASONS
                ):
                    reason = last_state.terminated.reason

        healthy = (
            phase == "Running"
            and reason not in PROBLEM_REASONS
        )

        results.append(
            {
                "namespace": pod.metadata.namespace,
                "pod_name": pod.metadata.name,
                "phase": phase,
                "reason": reason,
                "restart_count": restart_count,
                "healthy": healthy,
                "authentication": connection[
                    "authentication"
                ]
            }
        )

    return results
