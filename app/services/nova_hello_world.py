import os
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("NOVA_API_KEY"),
    base_url="https://api.nova.amazon.com/v1"
)

response = client.chat.completions.create(
    model="nova-2-lite-v1",
    messages=[{
            "role": "system",
            "content": "You are a helpful assistant"
        },
        {
            "role": "user",
            "content": "Hello! How are you?"
        },
    ],
    stream=False
)

print(response.choices[0].message.content)