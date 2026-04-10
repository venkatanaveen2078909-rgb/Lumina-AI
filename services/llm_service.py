import requests
from config import GROQ_API_KEY,MODEL

def call_groq(messages):
    url="https://api.groq.com/v1/chat/completions"
    headers={
        "Authorization":f"Bearer {GROQ_API_KEY}",
        "Content-Type":"application/json"
    }
    data={
        "model":MODEL,
        "messages":messages,
        "temperature":0
    }
    response=requests.post(url,headers=headers,json=data)
    return response.json()