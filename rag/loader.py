import os
from langchain_community.document_loaders import PyPDFLoader
import logging

def load_pdf(file_path: str):
    if not os.path.exists(file_path):
        logging.warning(f"File {file_path} not found. Returning empty list.")
        return []
    loader = PyPDFLoader(file_path)
    return loader.load()
