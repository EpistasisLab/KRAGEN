from openai import AzureOpenAI

def get_embedding(api_key,api_base,api_version,deployment_name, text_to_embed):
    client = AzureOpenAI(
        api_key=api_key,
        api_version=api_version,
        azure_endpoint = api_base
    )
    response = client.embeddings.create(
        model=deployment_name,
        input=text_to_embed
    )

    return response.data[0].embedding