from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class RAGRequest(BaseModel):
    query: str

@router.post("/query")
def query_rag_endpoint(request: RAGRequest):
    from services.rag_service import query_rag
    result = query_rag(request.query)
    return {"result": result}
