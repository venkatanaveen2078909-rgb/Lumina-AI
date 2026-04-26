def split_text(documents):
    # simple splitter (keep yours if already working)
    return documents


def create_embeddings():
    # 🚀 Dummy lightweight embeddings (no torch, no model)
    class DummyEmbeddings:
        def embed_documents(self, texts):
            return [[0.0] * 384 for _ in texts]

        def embed_query(self, text):
            return [0.0] * 384

    return DummyEmbeddings()
