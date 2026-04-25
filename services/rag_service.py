import os
from rag.loader import load_pdf
from rag.embedder import split_text, create_embeddings
from rag.vector_store import store_vectors
from rag.retriever import get_retriever

# Global vector store and embeddings
embeddings = create_embeddings()
vector_store = None
retriever = None

def initialize_rag():
    global vector_store, retriever
    # Load default document if it exists, otherwise start empty
    default_path = "C:\\Users\\Tumma\\OneDrive\\Desktop\\Unit-3 - ER Model.pdf"
    if os.path.exists(default_path):
        documents = load_pdf(default_path)
        chunks = split_text(documents)
        vector_store = store_vectors(chunks, embeddings)
        retriever = get_retriever(vector_store)
    else:
        # Initialize with empty store
        vector_store = store_vectors([], embeddings)
        retriever = get_retriever(vector_store)

def ingest_document(file_path: str):
    global vector_store, retriever
    documents = load_pdf(file_path)
    if not documents:
        return False
    
    chunks = split_text(documents)
    
    if vector_store is None:
        vector_store = store_vectors(chunks, embeddings)
    else:
        vector_store.add_documents(chunks)
    
    retriever = get_retriever(vector_store)
    return True

def query_rag(question):
    global retriever
    if retriever is None:
        initialize_rag()
    
    docs = retriever.invoke(question)
    return "\n".join([d.page_content for d in docs])

# Initialize on load
initialize_rag()