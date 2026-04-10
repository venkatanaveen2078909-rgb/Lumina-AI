from services.rag_service import query_rag

def get_rag_tool(query: str):
    """Uses RAG to get the answer"""
    return query_rag(query)
