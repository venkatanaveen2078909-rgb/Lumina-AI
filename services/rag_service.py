from rag.loader import load_pdf
from rag.embedder import split_text, create_embeddings
from rag.vector_store import store_vectors
from rag.retriever import get_retriever


documents = load_pdf("C:\\Users\\Tumma\\OneDrive\\Desktop\\Unit-3 - ER Model.pdf")
chunks = split_text(documents)
embeddings = create_embeddings()
db = store_vectors(chunks, embeddings)
retriever = get_retriever(db)


def query_rag(question):
    docs = retriever.invoke(question)
    return "\n".join([d.page_content for d in docs])