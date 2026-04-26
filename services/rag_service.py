import os
from rag.loader import load_pdf
from rag.embedder import split_text, create_embeddings
from rag.vector_store import store_vectors
from rag.retriever import get_retriever

# Lazy-loaded globals

embeddings = None
vector_store = None
retriever = None

def get_embeddings():
global embeddings
if embeddings is None:
embeddings = create_embeddings()
return embeddings

def initialize_rag():
global vector_store, retriever

```
emb = get_embeddings()

# Initialize empty vector store (no local file path on server)
vector_store = store_vectors([], emb)
retriever = get_retriever(vector_store)
```

def ingest_document(file_path: str):
global vector_store, retriever

```
documents = load_pdf(file_path)
if not documents:
    return False

chunks = split_text(documents)
emb = get_embeddings()

if vector_store is None:
    vector_store = store_vectors(chunks, emb)
else:
    vector_store.add_documents(chunks)

retriever = get_retriever(vector_store)
return True
```

def query_rag(question: str):
global retriever

```
if retriever is None:
    initialize_rag()

docs = retriever.invoke(question)
return "\n".join([d.page_content for d in docs])
```
