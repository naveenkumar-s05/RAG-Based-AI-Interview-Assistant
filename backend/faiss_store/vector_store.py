import faiss
import numpy as np


class FAISSVectorStore:

    def __init__(self, dimension=384):
        """
        Create a FAISS index for normalized embeddings.

        384 is the dimension produced by
        all-MiniLM-L6-v2.
        """

        self.dimension = dimension

        # Inner Product + normalized vectors
        # = cosine similarity
        self.index = faiss.IndexFlatIP(
            dimension
        )

        # Store the original chunks.
        # FAISS stores vectors, not our text/metadata.
        self.chunks = []

    # =========================================================
    # ADD CHUNKS
    # =========================================================

    def add(self, embeddings, chunks):

        embeddings = np.asarray(
            embeddings,
            dtype="float32"
        )

        if embeddings.ndim == 1:
            embeddings = embeddings.reshape(
                1, -1
            )

        if embeddings.shape[1] != self.dimension:
            raise ValueError(
                f"Expected embedding dimension "
                f"{self.dimension}, "
                f"got {embeddings.shape[1]}"
            )

        if len(embeddings) != len(chunks):
            raise ValueError(
                "Number of embeddings and chunks "
                "must be the same."
            )

        self.index.add(
            embeddings
        )

        self.chunks.extend(
            chunks
        )

    # =========================================================
    # SEARCH
    # =========================================================

    def search(
        self,
        query_embedding,
        top_k=3
    ):

        if self.index.ntotal == 0:
            return []

        query_embedding = np.asarray(
            query_embedding,
            dtype="float32"
        )

        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(
                1, -1
            )

        if query_embedding.shape[1] != self.dimension:
            raise ValueError(
                f"Expected query dimension "
                f"{self.dimension}, "
                f"got {query_embedding.shape[1]}"
            )

        top_k = min(
            top_k,
            self.index.ntotal
        )

        scores, indices = self.index.search(
            query_embedding,
            top_k
        )

        results = []

        for score, index in zip(
            scores[0],
            indices[0]
        ):

            if index == -1:
                continue

            results.append({
                "score": float(score),
                "chunk": self.chunks[index]
            })

        return results

    # =========================================================
    # COUNT
    # =========================================================

    def size(self):

        return self.index.ntotal