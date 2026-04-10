from langgraph.graph import StateGraph, END
from agents.nodes import AgentState, agent_node, tool_node, router

workflow = StateGraph(AgentState)

workflow.add_node("agent", agent_node)
workflow.add_node("tool", tool_node)

workflow.set_entry_point("agent")

workflow.add_conditional_edges(
    "agent",
    router,
    {
        "tool_node": "tool",
        "end": END
    }
)
workflow.add_edge("tool", "agent")

graph = workflow.compile()
