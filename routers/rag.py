from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import shutil
import os

router = APIRouter()

class RAGRequest(BaseModel):
    query: str

@router.post("/query")
def query_rag_endpoint(request: RAGRequest):
    from services.rag_service import query_rag
    result = query_rag(request.query)
    return {"result": result}

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Create temp directory if it doesn't exist
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    
    file_path = os.path.join(temp_dir, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        from services.rag_service import ingest_document
        success = ingest_document(file_path)
        
        if success:
            return {"message": f"Successfully ingested {file.filename}", "filename": file.filename}
        else:
            raise HTTPException(status_code=500, detail="Failed to process document")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Optionally delete the file after ingestion or keep it
        # os.remove(file_path)
        pass

