from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings

def split_text(documents):
    if not documents:
        return []
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    return splitter.split_documents(documents)

def create_embeddings():
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
