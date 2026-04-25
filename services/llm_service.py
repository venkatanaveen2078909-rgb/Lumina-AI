import requests
from config import GROQ_API_KEY,MODEL

def call_groq(messages, vision=False):
    url="https://api.groq.com/openai/v1/chat/completions"

    headers={
        "Authorization":f"Bearer {GROQ_API_KEY}",
        "Content-Type":"application/json"
    }
    
    current_model = "meta-llama/llama-4-scout-17b-16e-instruct" if vision else MODEL

    data={
        "model":current_model,
        "messages":messages,
        "temperature":0
    }
    response=requests.post(url,headers=headers,json=data)
    return response.json()