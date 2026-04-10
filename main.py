from fastapi import FastAPI
from routers.chat import router as chat_router
from routers.rag import router as rag_router

app=FastAPI()
app.include_router(chat_router, prefix="/api/chat")
app.include_router(rag_router, prefix="/api/rag")

@app.get("/")
def read_root():
    return {
        "message": "AI MCP System is Running!", 
        "docs": "Navigate to /docs to test the API endpoints" 
    }
