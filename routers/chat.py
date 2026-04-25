from fastapi import APIRouter
from pydantic import BaseModel
from agents.graph import graph

router=APIRouter()

from typing import Optional

class ChatRequest(BaseModel):
    message: str
    image_data: Optional[str] = None

@router.post("/chat")
def chat(request:ChatRequest):
    state={
        "input": request.message,
        "image_data": request.image_data,

        "tool": "",
        "tool_input": "",
        "tool_output": "",
        "final_answer": ""
    }

    result=graph.invoke(state)
    return {
        "answer":result["final_answer"]
    }

