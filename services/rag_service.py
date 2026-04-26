import os
from rag.loader import load_pdf
from rag.embedder import split_text, create_embeddings
from rag.vector_store import store_vectors
from rag.retriever import get_retriever

embeddings = None
vector_store = None
retriever = None


def initialize_rag():
    global embeddings, vector_store, retriever

    try:
        if embeddings is None:
            embeddings = create_embeddings()

        if vector_store is None:
            vector_store = store_vectors([], embeddings)

        if retriever is None:
            retriever = get_retriever(vector_store)

    except Exception as e:
        print("RAG INIT ERROR:", e)


def ingest_document(file_path: str):
    global vector_store, retriever

    initialize_rag()

    documents = load_pdf(file_path)
    if not documents:
        return False
    
    chunks = split_text(documents)
    vector_store.add_documents(chunks)

    retriever = get_retriever(vector_store)
    return True


def query_rag(question):
    global retriever

    initialize_rag()

    if retriever is None:
        return "RAG system not initialized"

    docs = retriever.invoke(question)
    return "\n".join([d.page_content for d in docs])
