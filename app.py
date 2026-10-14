from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from analyzer import analyze_cluster
from fastapi.responses import FileResponse

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from kubernetes_reader import get_cluster_health
from analyzer import (
    executive_summary,
    teach_kubernetes
)

app = FastAPI(
    title="AKS AI Troubleshooter",
    version="2.0"
)

app.mount(
    "/assets",
    StaticFiles(
        directory="static/assets"
    ),
    name="assets"
)

class TeachMeRequest(BaseModel):
    topic: str

@app.get("/ui")
def react_ui():
    return FileResponse(
        "static/index.html"
    )

@app.get("/version")
def version():
    return {
        "version": "133bccb"
    }

@app.get("/ui")
def react_ui():
    return FileResponse(
        "static/index.html"
    )
    
@app.get("/")
def root():

    return {
        "service": "AKS AI Troubleshooter",
        "status": "running"
    }

@app.get("/unhealthy-pods")
def unhealthy_pods():

    pods = get_cluster_health()

    return [
        pod
        for pod in pods
        if not pod["healthy"]
    ]

@app.get("/analyze-cluster")
def analyze_cluster_endpoint():

    pods = get_cluster_health()

    return analyze_cluster(pods)

@app.get("/namespace-summary")
def namespace_summary():

    pods = get_cluster_health()

    summary = {}

    for pod in pods:

        ns = pod["namespace"]

        if ns not in summary:

            summary[ns] = {
                "total": 0,
                "healthy": 0,
                "unhealthy": 0
            }

        summary[ns]["total"] += 1

        if pod["healthy"]:
            summary[ns]["healthy"] += 1
        else:
            summary[ns]["unhealthy"] += 1

    return summary

@app.get("/pod/{pod_name}")
def pod_details(pod_name: str):

    pods = get_cluster_health()

    for pod in pods:

        if pod["pod_name"] == pod_name:
            return pod

    return {
        "error": "Pod not found"
    }

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


@app.get("/cluster-health")
def cluster_health():

    pods = get_cluster_health()

    healthy = len(
        [p for p in pods if p["healthy"]]
    )

    unhealthy = len(pods) - healthy

    return {
        "overall_status":
            "Healthy"
            if unhealthy == 0
            else "Unhealthy",

        "total_pods": len(pods),
        "healthy_pods": healthy,
        "unhealthy_pods": unhealthy,
        "pods": pods
    }


@app.post("/executive-summary")
def executive():

    cluster_data = get_cluster_health()

    summary = executive_summary(
        cluster_data
    )

    return {
        "summary": summary
    }


@app.post("/teach-me")
def teach_me(
    request: TeachMeRequest
):

    lesson = teach_kubernetes(
        request.topic
    )

    return {
        "topic": request.topic,
        "lesson": lesson
    }


@app.get("/dashboard")
def dashboard():

    cluster = get_cluster_health()

    healthy_pods = len(
        [p for p in cluster if p["healthy"]]
    )

    unhealthy_pods = len(
        [p for p in cluster if not p["healthy"]]
    )

    issues = {}

    for pod in cluster:

        reason = pod["reason"]

        if (
            reason
            and reason != "Running"
        ):
            issues[reason] = (
                issues.get(reason, 0) + 1
            )

    return {
        "overall_status":
            "Healthy"
            if unhealthy_pods == 0
            else "Unhealthy",

        "healthy_pods":
            healthy_pods,

        "unhealthy_pods":
            unhealthy_pods,

        "top_issues":
            issues
    }

