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


def load_kubernetes_config():

    try:

        if os.getenv("KUBERNETES_SERVICE_HOST"):
            config.load_incluster_config()

            return {
                "connected": True,
                "authentication": "in-cluster"
            }

        subscription_id = os.getenv(
            "AZURE_SUBSCRIPTION_ID"
        )

        resource_group = os.getenv(
            "AKS_RESOURCE_GROUP"
        )

        cluster_name = os.getenv(
            "AKS_CLUSTER_NAME"
        )

        if not all([
            subscription_id,
            resource_group,
            cluster_name
        ]):
            return {
                "connected": False,
                "authentication": "missing-settings",
                "error": (
                    "Missing AKS environment variables"
                )
            }

        credential = DefaultAzureCredential()

        client_aks = ContainerServiceClient(
            credential,
            subscription_id
        )

        credential_result = (
            client_aks.managed_clusters
            .list_cluster_user_credentials(
                resource_group,
                cluster_name
            )
        )

        kubeconfig_value = (
            credential_result.kubeconfigs[0].value
        )

        if isinstance(kubeconfig_value, bytes):
            kubeconfig_bytes = kubeconfig_value

        elif isinstance(
            kubeconfig_value,
            bytearray
        ):
            kubeconfig_bytes = bytes(
                kubeconfig_value
            )

        elif isinstance(kubeconfig_value, str):

            stripped_value = (
                kubeconfig_value.strip()
            )

            if stripped_value.startswith(
                ("apiVersion:", "{")
            ):
                kubeconfig_bytes = (
                    stripped_value.encode(
                        "utf-8"
                    )
                )
            else:
                kubeconfig_bytes = (
                    base64.b64decode(
                        stripped_value
                    )
                )
        else:
            return {
                "connected": False,
                "authentication": "managed-identity",
                "error": (
                    "Unsupported kubeconfig format"
                )
            }

        with tempfile.NamedTemporaryFile(
            delete=False
        ) as temp_file:

            temp_file.write(
                kubeconfig_bytes
            )

            kubeconfig_path = (
                temp_file.name
            )

        config.load_kube_config(
            config_file=kubeconfig_path
        )

        return {
            "connected": True,
            "authentication": "managed-identity"
        }

    except Exception as error:

        return {
            "connected": False,
            "authentication": "managed-identity",
            "error": str(error)
        }


def get_cluster_health():

    connection = (
        load_kubernetes_config()
    )

    if not connection["connected"]:

        return [
            {
                "namespace": "unknown",
                "pod_name":
                    "kubernetes-not-connected",
                "phase": "Unknown",
                "reason": connection.get(
                    "error",
                    "Kubernetes "
                    "configuration "
                    "unavailable"
                ),
                "restart_count": 0,
                "healthy": False,
                "authentication":
                    connection.get(
                        "authentication",
                        "unknown"
                    )
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

            for container_status in (
                pod.status.container_statuses
            ):

                restart_count += (
                    container_status.restart_count
                )

                if (
                    container_status.state.waiting
                    and
                    container_status.state.waiting.reason
                ):
                    reason = (
                        container_status
                        .state
                        .waiting
                        .reason
                    )

                elif (
                    container_status
                    .state
                    .terminated
                    and
                    container_status
                    .state
                    .terminated
                    .reason
                ):
                    reason = (
                        
