from sentence_transformers import SentenceTransformer


class ResumeEmbedder:

    # Share one model instance across all candidates.
    # Loading a new SentenceTransformer per session
    # would exhaust server memory.
    _models = {}

    def __init__(
        self,
        model_name="all-MiniLM-L6-v2"
    ):
        if model_name not in ResumeEmbedder._models:
            ResumeEmbedder._models[model_name] = (
                SentenceTransformer(model_name)
            )

        self.model = ResumeEmbedder._models[model_name]

    def embed_text(self, text):
        """
        Convert one text into an embedding vector.
        """

        return self.model.encode(
            text,
            normalize_embeddings=True
        )

    def embed_chunks(self, chunks):
        """
        Convert resume chunks into embedding vectors.

        Include section and entity information so the
        embedding contains both the content and its context.
        """

        texts = []

        for chunk in chunks:

            section = chunk.get("section", "")
            entity = chunk.get("subsection", "")
            content = chunk.get("text", "")

            if entity:
                text = (
                    f"Section: {section}\n"
                    f"Entity: {entity}\n"
                    f"Content: {content}"
                )
            else:
                text = (
                    f"Section: {section}\n"
                    f"Content: {content}"
                )

            texts.append(text)

        embeddings = self.model.encode(
            texts,
            normalize_embeddings=True
        )

        return embeddings