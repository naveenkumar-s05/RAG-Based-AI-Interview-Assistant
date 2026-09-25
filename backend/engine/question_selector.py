import pandas as pd

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

    