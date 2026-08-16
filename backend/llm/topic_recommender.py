from llm.openrouter_client import OpenRouterClient


class TopicRecommender:

    def __init__(self):
        self.llm = OpenRouterClient()

    def recommend_topic(
        self,
        resume_chunks,
        priority_entities=None,
        additional_entities=None,
        question_type="Resume",
        topic="Project",
        difficulty="Medium",
        exclude_topics=None
    ):
        """
        Recommend one specific interview topic from
        the candidate's resume.

        Priority entities are considered first.
        Previously used topics are excluded.
        """

        if priority_entities is None:
            priority_entities = []

        if additional_entities is None:
            additional_entities = []

        if exclude_topics is None:
            exclude_topics = []

        # -------------------------------------------------
        # Separate priority and additional chunks
        # -------------------------------------------------

        priority_chunks = []
        additional_chunks = []

        priority_sections = [
            entity.lower()
            for entity in priority_entities
        ]

        additional_sections = [
            entity.lower()
            for entity in additional_entities
        ]

        for chunk in resume_chunks:

            section = str(
                chunk.get("section", "")
            ).strip()

            section_lower = section.lower()

            if section_lower in priority_sections:

                priority_chunks.append(chunk)

            elif section_lower in additional_sections:

                additional_chunks.append(chunk)

        # -------------------------------------------------
        # Prefer priority chunks
        # -------------------------------------------------

        if priority_chunks:

            selected_chunks = priority_chunks

        elif additional_chunks:

            selected_chunks = additional_chunks

        else:

            selected_chunks = resume_chunks

        # -------------------------------------------------
        # Prepare resume context
        # -------------------------------------------------

        resume_context = []

        for chunk in selected_chunks:

            section = chunk.get(
                "section",
                ""
            )

            entity = chunk.get(
                "subsection",
                ""
            )

            text = chunk.get(
                "text",
                ""
            )

            resume_context.append(
                f"Section: {section}\n"
                f"Entity: {entity}\n"
                f"Content: {text}"
            )

        resume_text = "\n\n".join(
            resume_context
        )

        # -------------------------------------------------
        # Previously used topics
        # -------------------------------------------------

        if exclude_topics:

            excluded_text = ", ".join(
                exclude_topics
            )

        else:

            excluded_text = "None"

        # -------------------------------------------------
        # LLM prompt
        # -------------------------------------------------

        prompt = f"""
You are an interview topic recommendation system.

Candidate resume information:
--------------------------------
{resume_text}
--------------------------------

Interview requirements:

Question Type:
{question_type}

Topic Category:
{topic}

Difficulty:
{difficulty}

Previously used topics:
{excluded_text}

Recommend ONE new technical interview topic
from the candidate's resume.

STRICT RULES:

1. The topic MUST be explicitly supported
   by the resume.

2. Return ONLY a short topic name.

3. The topic should normally contain
   1 to 5 words.

4. Prefer a specific technology, framework,
   library, model, tool, method, or technical
   concept.

5. Do NOT return a project description.

6. Do NOT combine multiple technologies
   or concepts into one topic.

7. Do NOT invent technologies or experience.

8. Do NOT include explanations.

9. Do NOT recommend any topic listed under
   previously used topics.

10. Choose a different topic whenever
    another valid topic exists in the resume.

11. Return ONLY the topic name.
"""

        return self.llm.generate(
            prompt
        ).strip()