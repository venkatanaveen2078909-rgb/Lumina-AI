from fastapi import APIRouter
from pydantic import BaseModel
from agents.graph import graph

router=APIRouter()

class ChatRequest(BaseModel):
    message:str

@router.post("/chat")
def chat(request:ChatRequest):
    state={
        "input": request.message,
        "tool": "",
        "tool_input": "",
        "tool_output": "",
        "final_answer": ""
    }

    result=graph.invoke(state)
    return {
        "answer":result["final_answer"]
    }

