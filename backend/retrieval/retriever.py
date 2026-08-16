class ResumeRetriever:

    def __init__(self, vector_store, embedder):
        """
        Retriever uses an existing embedding model.

        This avoids loading Sentence Transformer
        multiple times.
        """

        self.vector_store = vector_store
        self.embedder = embedder

    def retrieve(self, topic, top_k=3):
        """
        Retrieve the most relevant resume chunks
        for a recommended interview topic.
        """

        query_embedding = self.embedder.embed_text(
            topic
        )

        results = self.vector_store.search(
            query_embedding,
            top_k=top_k
        )

        return results