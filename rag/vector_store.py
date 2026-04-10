from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

def store_vectors(chunks, embeddings):
    if not chunks:
        # Create an empty vector store if there are no chunks
        return FAISS.from_documents([Document(page_content="Empty document store")], embeddings)
    db = FAISS.from_documents(chunks, embeddings)
    return db
