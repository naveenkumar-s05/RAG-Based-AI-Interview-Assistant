import pandas as pd

from llm.topic_recommender import TopicRecommender
from llm.question_generator import ResumeQuestionGenerator


class QuestionSelector:

    def __init__(self, conceptual_path, coding_path):
        self.conceptual = pd.read_excel(conceptual_path)
        self.coding = pd.read_excel(coding_path)

    # =========================================================
    # COMMON FILTER
    # =========================================================

    def _filter_questions(
        self,
        dataframe,
        topic,
        category=None,
        difficulty=None,
        exclude_questions=None,
        exclude_concepts=None
    ):

        if exclude_questions is None:
            exclude_questions = []

        if exclude_concepts is None:
            exclude_concepts = []

        questions = dataframe[
            dataframe["topic"].str.lower() == topic.lower()
        ]

        if category:
            questions = questions[
                questions["category"].str.lower() == category.lower()
            ]

        if difficulty:
            questions = questions[
                questions["difficulty"].str.lower() == difficulty.lower()
            ]

        if exclude_questions:
            questions = questions[
                ~questions["question"].isin(exclude_questions)
            ]

        if exclude_concepts:
            questions = questions[
                ~questions["expected_concepts"].isin(exclude_concepts)
            ]

        return questions

    # =========================================================
    # CONCEPTUAL QUESTIONS
    # =========================================================

    def select_conceptual_from_blueprint(
        self,
        blueprint,
        exclude_questions=None,
        exclude_concepts=None
    ):

        if exclude_questions is None:
            exclude_questions = []

        if exclude_concepts is None:
            exclude_concepts = []

        selected_questions = []

        topics = blueprint["conceptual"]["topics"]

        for topic, topic_config in topics.items():

            categories = topic_config["categories"]
            difficulty_plan = topic_config["difficulty"]

            used_categories = set()

            for difficulty, count in difficulty_plan.items():

                if count == 0:
                    continue

                remaining = count

                # -------------------------------------------------
                # First: prefer unused categories
                # -------------------------------------------------

                for category in categories:

                    if remaining == 0:
                        break

                    if category in used_categories:
                        continue

                    questions = self._filter_questions(
                        self.conceptual,
                        topic,
                        category,
                        difficulty,
                        exclude_questions,
                        exclude_concepts
                    )

                    if len(questions) == 0:
                        continue

                    row = questions.sample(n=1).iloc[0]

                    selected_questions.append(row)

                    exclude_questions.append(
                        row["question"]
                    )

                    exclude_concepts.append(
                        row["expected_concepts"]
                    )

                    used_categories.add(category)

                    remaining -= 1

                # -------------------------------------------------
                # Second: allow category repetition
                # -------------------------------------------------

                if remaining > 0:

                    available = self._filter_questions(
                        self.conceptual,
                        topic,
                        difficulty=difficulty,
                        exclude_questions=exclude_questions,
                        exclude_concepts=exclude_concepts
                    )

                    if len(available) < remaining:
                        raise ValueError(
                            f"Not enough conceptual questions for "
                            f"{topic} - {difficulty}"
                        )

                    selected = available.sample(
                        n=remaining
                    )

                    for _, row in selected.iterrows():

                        selected_questions.append(row)

                        exclude_questions.append(
                            row["question"]
                        )

                        exclude_concepts.append(
                            row["expected_concepts"]
                        )

        total_required = (
            blueprint["conceptual"]["total_questions"]
        )

        if len(selected_questions) != total_required:
            raise ValueError(
                f"Expected {total_required} conceptual questions, "
                f"but selected {len(selected_questions)}"
            )

        return pd.DataFrame(
            selected_questions
        ).reset_index(drop=True)

    # =========================================================
    # CODING QUESTIONS
    # =========================================================

    def select_coding_from_blueprint(
        self,
        blueprint,
        exclude_questions=None,
        exclude_concepts=None
    ):

        if exclude_questions is None:
            exclude_questions = []

        if exclude_concepts is None:
            exclude_concepts = []

        selected_questions = []

        topics = blueprint["coding"]["topics"]

        for topic, topic_config in topics.items():

            difficulty_plan = topic_config["difficulty"]

            for difficulty, count in difficulty_plan.items():

                if count == 0:
                    continue

                questions = self._filter_questions(
                    dataframe=self.coding,
                    topic=topic,
                    difficulty=difficulty,
                    exclude_questions=exclude_questions,
                    exclude_concepts=exclude_concepts
                )

                if len(questions) < count:
                    raise ValueError(
                        f"Not enough coding questions for "
                        f"{topic} - {difficulty}. "
                        f"Required: {count}, "
                        f"Available: {len(questions)}"
                    )

                selected = questions.sample(
                    n=count
                )

                for _, row in selected.iterrows():

                    selected_questions.append(row)

                    exclude_questions.append(
                        row["question"]
                    )

                    exclude_concepts.append(
                        row["expected_concepts"]
                    )

        total_required = (
            blueprint["coding"]["total_questions"]
        )

        if len(selected_questions) != total_required:
            raise ValueError(
                f"Expected {total_required} coding questions, "
                f"but selected {len(selected_questions)}"
            )

        return pd.DataFrame(
            selected_questions
        ).reset_index(drop=True)

    # =========================================================
    # RESUME QUESTION
    # =========================================================

    def select_resume_question(
        self,
        resume_chunks,
        difficulty="Medium",
        priority_entities=None,
        additional_entities=None
    ):
        """
        Generate one personalized interview question
        using the candidate's resume and RAG pipeline.
        """

        if priority_entities is None:
            priority_entities = []

        if additional_entities is None:
            additional_entities = []

        # -------------------------------------------------
        # 1. Create LLM components
        # -------------------------------------------------

        topic_recommender = TopicRecommender()

        question_generator = ResumeQuestionGenerator()

        # -------------------------------------------------
        # 2. Recommend a topic
        # -------------------------------------------------

        recommended_topic = (
            topic_recommender.recommend_topic(
                resume_chunks=resume_chunks,
                priority_entities=priority_entities,
                additional_entities=additional_entities,
                question_type="Resume",
                topic="Project",
                difficulty=difficulty
            )
        )

        # -------------------------------------------------
        # 3. Create embedding model
        # -------------------------------------------------

        from embeddings.embedder import ResumeEmbedder

        from faiss_store.vector_store import (
            FAISSVectorStore
        )

        from retrieval.retriever import (
            ResumeRetriever
        )

        embedder = ResumeEmbedder()

        # -------------------------------------------------
        # 4. Create embeddings for resume chunks
        # -------------------------------------------------

        embeddings = embedder.embed_chunks(
            resume_chunks
        )

        # -------------------------------------------------
        # 5. Create FAISS vector store
        # -------------------------------------------------

        vector_store = FAISSVectorStore(
            dimension=384
        )

        vector_store.add(
            embeddings,
            resume_chunks
        )

        # -------------------------------------------------
        # 6. Create retriever
        # -------------------------------------------------

        retriever = ResumeRetriever(
            vector_store,
            embedder
        )

        # -------------------------------------------------
        # 7. Retrieve relevant resume context
        # -------------------------------------------------

        retrieved_chunks = retriever.retrieve(
            recommended_topic,
            top_k=3
        )

        # -------------------------------------------------
        # 8. Generate personalized question
        # -------------------------------------------------

        question = (
            question_generator.generate_question(
                topic=recommended_topic,
                retrieved_chunks=retrieved_chunks,
                difficulty=difficulty
            )
        )

        # -------------------------------------------------
        # 9. Return result
        # -------------------------------------------------

        return {
            "question": question,
            "topic": recommended_topic,
            "retrieved_chunks": retrieved_chunks
        }