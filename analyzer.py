import os
import json

from openai import AzureOpenAI


def get_client():

    endpoint = os.getenv(
        "AZURE_OPENAI_ENDPOINT"
    )

    api_key = os.getenv(
        "AZURE_OPENAI_API_KEY"
    )

    deployment = os.getenv(
        "AZURE_OPENAI_DEPLOYMENT"
    )

    if not endpoint:
        raise Exception(
            "AZURE_OPENAI_ENDPOINT not configured"
        )

    if not api_key:
        raise Exception(
            "AZURE_OPENAI_API_KEY not configured"
        )

    if not deployment:
        raise Exception(
            "AZURE_OPENAI_DEPLOYMENT not configured"
        )

    client = AzureOpenAI(
        api_key=api_key,
        api_version="2024-12-01-preview",
        azure_endpoint=endpoint
    )

    return client, deployment


def executive_summary(cluster_data):

    client, deployment = get_client()

    prompt = f"""
You are a Kubernetes operations manager.

Create a SHORT executive cluster summary.

Format:

Overall Health:

Total Pods:
Healthy Pods:
Unhealthy Pods:

Top Issues:

Top Recommendation:

Confidence Level:

Data:

{json.dumps(cluster_data, indent=2)}
"""

    response = client.chat.completions.create(
        model=deployment,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    return response.choices[0].message.content


def teach_kubernetes(topic):

    client, deployment = get_client()

    prompt = f"""
You are a Kubernetes trainer.

Topic:

{topic}

Explain:

1. What it is
2. Why it exists
3. Common issues
4. Useful kubectl commands
5. Real-world example

Keep it beginner friendly.
"""

    response = client.chat.completions.create(
        model=deployment,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    return response.choices[0].message.content
