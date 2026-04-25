from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.chat import router as chat_router
from routers.rag import router as rag_router

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api/chat")
app.include_router(rag_router, prefix="/api/rag")

@app.get("/")
def read_root():
    return {
        "message": "AI MCP System is Running!", 
        "docs": "Navigate to /docs to test the API endpoints" 
    }

