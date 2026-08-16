from llm.openrouter_client import OpenRouterClient


class ResumeQuestionGenerator:

    def __init__(self):
        self.llm = OpenRouterClient()

    def generate_question(
        self,
        topic,
        retrieved_chunks,
        difficulty="Medium"
    ):
        """
        Generate one short, resume-grounded interview question.
        """

        context_parts = []

        for result in retrieved_chunks:

            chunk = result["chunk"]

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

            context_parts.append(
                f"Section: {section}\n"
                f"Entity: {entity}\n"
                f"Content: {text}"
            )

        resume_context = "\n\n".join(
            context_parts
        )

        prompt = f"""
You are an AI technical interviewer.

Recommended topic:
{topic}

Difficulty:
{difficulty}

Candidate resume evidence:
--------------------------------
{resume_context}
--------------------------------

Generate ONE short technical interview question.

STRICT RULES:

1. Ask exactly ONE question.

2. Keep it between 10 and 20 words.

3. Focus on exactly ONE technical concept.

4. The question MUST be directly supported
   by the resume evidence.

5. You may ask about:
   - a technology explicitly mentioned
   - a model explicitly mentioned
   - a dataset explicitly mentioned
   - a tool explicitly mentioned
   - a method explicitly mentioned
   - a role explicitly mentioned
   - a project feature explicitly mentioned

6. Do NOT assume an implementation detail
   that the resume does not explicitly mention.

7. Do NOT invent:
   - APIs
   - algorithms
   - configuration
   - metrics
   - architecture details
   - implementation methods
   - results

8. If the resume only says a technology was used,
   ask about its purpose, role, or basic concept.

9. Do NOT combine multiple concepts.

10. Avoid long questions.

11. Prefer natural questions such as:
    "Why did you use...?"
    "What is the purpose of...?"
    "What role does... play?"
    "How does... work?"

12. Return ONLY the question.

13. Do not provide an answer or explanation.
"""

        return self.llm.generate(
            prompt
        ).strip()