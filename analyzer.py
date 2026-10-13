import os
from openai import AzureOpenAI


def analyze_cluster(pods):

    unhealthy = [
        p for p in pods
        if not p["healthy"]
    ]

    if not unhealthy:
        return {
            "summary": "Cluster is healthy",
            "recommendations": []
        }

    prompt = f"""
Analyze this AKS cluster health data.

Unhealthy Pods:
{unhealthy}

Provide:
1. Root causes
2. Impact
3. Recommendations
4. Priority order
"""

    client = AzureOpenAI(
        api_key=os.getenv(
            "AZURE_OPENAI_API_KEY"
        ),
        api_version="2024-12-01-preview",
        azure_endpoint=os.getenv(
            "AZURE_OPENAI_ENDPOINT"
        )
    )

    response = client.chat.completions.create(
        model=os.getenv(
            "AZURE_OPENAI_DEPLOYMENT"
        ),
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return {
        "analysis":
            response.choices[0]
            .message
            .content
    }
