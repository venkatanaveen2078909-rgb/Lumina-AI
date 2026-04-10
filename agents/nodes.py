from typing import TypedDict
from services.llm_service import call_groq
from mcp.tools import get_rag_tool
from mcp.context import ContextManager
import json

class AgentState(TypedDict):
    input: str
    tool: str
    tool_input: str
    tool_output: str
    final_answer: str

context_manager = ContextManager()

def agent_node(state: AgentState):
    prompt = f"""You are an AI assistant. You have access to a tool called 'RAG' which searches documents.
If you need to answer by searching the document, output EXACTLY:
TOOL: RAG
TOOL_INPUT: your search query

If you can answer without tools, or if you already have the tool output, output EXACTLY:
FINAL_ANSWER: your final answer to the user

User's query: {state['input']}
Tool output (if any): {state.get('tool_output', '')}
"""
    messages = [{"role": "system", "content": prompt}]
    result = call_groq(messages)
    
    if "choices" in result and len(result["choices"]) > 0:
        content = result["choices"][0]["message"]["content"]
    else:
        content = "FINAL_ANSWER: Sorry, something went wrong with the LLM."
        
    state["tool"] = ""
    state["tool_input"] = ""
    state["final_answer"] = ""
    
    lines = content.split('\n')
    for line in lines:
        if line.startswith("TOOL:"):
            state["tool"] = line.split("TOOL:")[1].strip()
        elif line.startswith("TOOL_INPUT:"):
            state["tool_input"] = line.split("TOOL_INPUT:")[1].strip()
        elif line.startswith("FINAL_ANSWER:"):
            # Also capture the rest of the answer if it has multiple lines
            rest = content[content.find("FINAL_ANSWER:") + 13:].strip()
            state["final_answer"] = rest
            break
            
    # fallback
    if not state["tool"] and not state["final_answer"]:
        state["final_answer"] = content
        
    return state

def tool_node(state: AgentState):
    if state["tool"] == "RAG":
        result = get_rag_tool(state["tool_input"])
        state["tool_output"] = result
    else:
        state["tool_output"] = f"Tool {state['tool']} not found."
    return state

def router(state: AgentState):
    if state["final_answer"]:
        return "end"
    if state["tool"]:
        return "tool_node"
    return "end"
