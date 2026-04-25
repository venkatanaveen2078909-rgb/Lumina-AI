from typing import TypedDict
from services.llm_service import call_groq
from mcp.tools import get_rag_tool
from mcp.context import ContextManager
import json

class AgentState(TypedDict):
    input: str
    image_data: str
    tool: str
    tool_input: str
    tool_output: str
    final_answer: str

context_manager = ContextManager()

def agent_node(state: AgentState):
    prompt = f"""You are a highly intelligent and helpful AI assistant, similar to ChatGPT's most premium version. 
You can answer general questions about coding, science, history, or anything else.
You also have access to a 'RAG' tool which can search through any documents the user has uploaded.

CRITICAL INSTRUCTIONS:
1. If the user refers to "this document", "my resume", or asks you to analyze/rate/summarize something that implies an uploaded file, you MUST use the RAG tool to search for relevant content first.
2. When using the RAG tool, make your TOOL_INPUT broad enough to catch the main content.
3. Once you receive the 'Tool output', you MUST act like a smart assistant and actually ANSWER the user's question using that context. Do NOT just copy-paste the tool output.

IMAGE GENERATION CAPABILITY:
If the user asks you to generate, create, or draw an image, you can do so by returning a markdown image in your FINAL_ANSWER formatted EXACTLY like this:
![Image Description](https://image.pollinations.ai/prompt/PROMPT-WITH-HYPHENS)
Replace PROMPT-WITH-HYPHENS with a highly detailed, descriptive prompt for the image, replacing all spaces with hyphens (-). Do not use special characters or parameters.
Example: ![A futuristic city](https://image.pollinations.ai/prompt/a-futuristic-city-at-night-with-flying-cars)

If you need to use the tool to get more info, output EXACTLY:
TOOL: RAG
TOOL_INPUT: your search query

If you already have enough information from the 'Tool output', or if the question doesn't require documents, output EXACTLY:
FINAL_ANSWER: your comprehensive, well-formatted response.

Tool output (if any): {state.get('tool_output', '')}
"""

    image_data = state.get("image_data")
    if image_data:
        # Vision request
        user_content = [
            {"type": "text", "text": state['input']},
            {"type": "image_url", "image_url": {"url": image_data}}
        ]
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_content}
        ]
        result = call_groq(messages, vision=True)
    else:
        # Text request
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": state['input']}
        ]
        result = call_groq(messages, vision=False)

    
    if "choices" in result and len(result["choices"]) > 0:
        content = result["choices"][0]["message"]["content"]
    else:
        error_msg = result.get("error", {}).get("message", "Unknown error")
        print(f"LLM Error: {error_msg}")
        content = f"FINAL_ANSWER: Sorry, I encountered an error with the LLM: {error_msg}"

        
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
