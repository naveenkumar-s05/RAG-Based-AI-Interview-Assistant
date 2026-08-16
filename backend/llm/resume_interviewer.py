import json
from llm.topic_recommender import TopicRecommender
from llm.question_generator import ResumeQuestionGenerator
from llm.openrouter_client import OpenRouterClient

from embeddings.embedder import ResumeEmbedder
from faiss_store.vector_store import FAISSVectorStore
from retrieval.retriever import ResumeRetriever


class ResumeInterviewer:

    def __init__(self, resume_chunks):
        """
        Initialize the Resume RAG interview system.

        The resume chunks belong to ONE candidate.
        """

        self.resume_chunks = resume_chunks

        # -------------------------------------------------
        # LLM components
        # -------------------------------------------------

        self.topic_recommender = TopicRecommender()

        self.question_generator = ResumeQuestionGenerator()

        self.llm = OpenRouterClient()

        # -------------------------------------------------
        # Embedding + FAISS
        # -------------------------------------------------

        self.embedder = ResumeEmbedder()

        embeddings = self.embedder.embed_chunks(
            resume_chunks
        )

        self.vector_store = FAISSVectorStore(
            dimension=384
        )

        self.vector_store.add(
            embeddings,
            resume_chunks
        )

        self.retriever = ResumeRetriever(
            self.vector_store,
            self.embedder
        )

    # =====================================================
    # MAIN QUESTION
    # =====================================================

    def generate_main_question(
        self,
        difficulty="Medium",
        priority_entities=None,
        additional_entities=None,
        exclude_topics=None
    ):
        """
        Generate one resume-based interview question.
        """

        if priority_entities is None:
            priority_entities = []

        if additional_entities is None:
            additional_entities = []

        if exclude_topics is None:
            exclude_topics = []

        # -------------------------------------------------
        # 1. Recommend topic
        # -------------------------------------------------

        topic = self.topic_recommender.recommend_topic(
            resume_chunks=self.resume_chunks,
            priority_entities=priority_entities,
            additional_entities=additional_entities,
            question_type="Resume",
            topic="Project",
            difficulty=difficulty,
            exclude_topics=exclude_topics
        )

        # -------------------------------------------------
        # 2. Retrieve relevant resume context
        # -------------------------------------------------

        retrieved_chunks = self.retriever.retrieve(
            topic,
            top_k=3
        )

        # -------------------------------------------------
        # 3. Generate question
        # -------------------------------------------------

        question = self.question_generator.generate_question(
            topic=topic,
            retrieved_chunks=retrieved_chunks,
            difficulty=difficulty
        )

        return {
            "topic": topic,
            "question": question,
            "retrieved_chunks": retrieved_chunks
        }

    # =====================================================
    # MULTIPLE RESUME QUESTIONS
    # =====================================================

    def generate_resume_questions(
        self,
        min_questions=6,
        max_questions=10,
        difficulty="Medium",
        priority_entities=None,
        additional_entities=None
    ):
        """
        Generate multiple unique resume-based
        interview questions.
        """

        if priority_entities is None:
            priority_entities = []

        if additional_entities is None:
            additional_entities = []

        questions = []

        used_topics = []
        used_questions = []

        attempts = 0
        max_attempts = max_questions * 3

        # -------------------------------------------------
        # Generate questions until maximum is reached
        # -------------------------------------------------

        while len(questions) < max_questions:

            attempts += 1

            # Prevent infinite loop
            if attempts > max_attempts:
                break

            # -------------------------------------------------
            # Generate one new question
            # -------------------------------------------------

            result = self.generate_main_question(
                difficulty=difficulty,
                priority_entities=priority_entities,
                additional_entities=additional_entities,
                exclude_topics=used_topics
            )

            topic = result["topic"]
            question = result["question"]

            # -------------------------------------------------
            # Avoid duplicate topics
            # -------------------------------------------------

            if topic.lower() in [
                t.lower()
                for t in used_topics
            ]:
                continue

            # -------------------------------------------------
            # Avoid duplicate questions
            # -------------------------------------------------

            if question.lower() in [
                q.lower()
                for q in used_questions
            ]:
                continue

            # -------------------------------------------------
            # Store question
            # -------------------------------------------------

            questions.append({
                "question_number": len(questions) + 1,
                "topic": topic,
                "question": question,
                "retrieved_chunks": result[
                    "retrieved_chunks"
                ]
            })

            used_topics.append(topic)
            used_questions.append(question)

        # -------------------------------------------------
        # Validate minimum
        # -------------------------------------------------

        if len(questions) < min_questions:

            raise ValueError(
                f"Could generate only "
                f"{len(questions)} resume questions. "
                f"Minimum required: {min_questions}"
            )

        return questions

    # =====================================================
    # FOLLOW-UP QUESTION
    # =====================================================

    def generate_follow_up(
        self,
        topic,
        previous_question,
        candidate_answer,
        retrieved_chunks,
        difficulty="Medium"
    ):
        """
        Generate one short, adaptive follow-up question
        based primarily on the candidate's answer.
        """

        context_parts = []

        for result in retrieved_chunks:

            chunk = result["chunk"]

            context_parts.append(
                f"Section: {chunk.get('section', '')}\n"
                f"Entity: {chunk.get('subsection', '')}\n"
                f"Content: {chunk.get('text', '')}"
            )

        resume_context = "\n\n".join(
            context_parts
        )

        # -------------------------------------------------
        # Follow-up prompt
        # -------------------------------------------------

        prompt = f"""
You are an AI technical interviewer.

Topic:
{topic}

Difficulty:
{difficulty}

Previous question:
{previous_question}

Candidate's answer:
{candidate_answer}

Relevant resume evidence:
--------------------------------
{resume_context}
--------------------------------

Generate ONE short adaptive follow-up question.

STRICT RULES:

1. Keep the question between 8 and 18 words.

2. Ask exactly ONE question.

3. Focus on ONE technical concept.

4. The candidate's answer is the PRIMARY basis
   for the follow-up.

5. Identify one technical point from the answer
   that can be explored further.

6. The follow-up must remain related to the
   previous question.

7. Do NOT simply repeat the previous question.

8. Do NOT ask about an unrelated topic.

9. Do NOT assume an implementation detail that
   the candidate did not mention.

10. If the candidate mentions a specific
    technique, method, component, or decision,
    explore that point.

11. If the candidate gives a vague answer,
    ask a simple conceptual question about
    the same topic.

12. If the candidate says "I don't know",
    ask a simpler conceptual question about
    the same topic.

13. Do NOT combine multiple concepts.

14. Do NOT ask:

    "What did you implement?"
    "How did you implement it?"
    "Which method did you use?"

    unless the candidate explicitly mentioned
    performing that implementation.

15. Prefer natural interview questions such as:

    "Why is ... useful?"
    "How does ... work?"
    "What is the benefit of ...?"
    "Why would you choose ...?"

16. Return ONLY the question.

17. Do not provide an answer or explanation.
"""

        return self.llm.generate(
            prompt
        ).strip()
    # =====================================================
    # EVALUATE ANSWER FOR FOLLOW-UP
    # =====================================================

    def evaluate_answer_for_follow_up(
        self,
        topic,
        previous_question,
        candidate_answer,
        difficulty="Medium"
    ):
        """
        Decide whether the candidate's answer contains
        a point worth exploring with a follow-up question.
        """

        prompt = f"""
You are an AI technical interviewer.

Topic:
{topic}

Difficulty:
{difficulty}

Previous question:
{previous_question}

Candidate's answer:
{candidate_answer}

Decide whether a follow-up question would meaningfully
test the candidate's understanding.

A follow-up SHOULD be asked when:
- the candidate mentions an interesting technical point
  that can be explored further
- the answer is partially correct
- the answer is vague but can be clarified
- the candidate gives a reason that can be examined deeper
- the candidate mentions a technical concept that needs
  further explanation

A follow-up SHOULD NOT be asked when:
- the answer is already sufficiently complete
- there is no meaningful point to explore
- asking another question would simply repeat the same concept
- the candidate clearly answered the question completely

Return ONLY one word:
YES

or
NO
"""

        result = self.llm.generate(
            prompt
        ).strip().upper()

        return result == "YES"


    # =====================================================
    # PROCESS CANDIDATE ANSWER
    # =====================================================

    def process_candidate_answer(
        self,
        topic,
        previous_question,
        candidate_answer,
        retrieved_chunks,
        difficulty="Medium"
    ):
        """
        Decide whether to generate a follow-up question
        based on the candidate's answer.
        """

        should_follow_up = (
            self.evaluate_answer_for_follow_up(
                topic=topic,
                previous_question=previous_question,
                candidate_answer=candidate_answer,
                difficulty=difficulty
            )
        )

        if not should_follow_up:

            return {
                "follow_up_required": False,
                "follow_up_question": None
            }

        follow_up = self.generate_follow_up(
            topic=topic,
            previous_question=previous_question,
            candidate_answer=candidate_answer,
            retrieved_chunks=retrieved_chunks,
            difficulty=difficulty
        )

        return {
            "follow_up_required": True,
            "follow_up_question": follow_up
        }

   # =====================================================
# RUN RESUME INTERVIEW
# =====================================================

    def run_resume_interview(
        self,
        min_questions=7,
        max_questions=10,
        max_follow_ups=2,
        difficulty="Medium",
        priority_entities=None,
        additional_entities=None
    ):
        """
        Run the resume interview.

        Main questions and follow-up questions both count
        toward the total question count.

        Follow-ups are optional and are based on the
        candidate's answer.
        """

        if priority_entities is None:
            priority_entities = []

        if additional_entities is None:
            additional_entities = []

        total_questions = 0

        main_questions = 0

        follow_up_questions = 0

        used_topics = []

        interview_questions = []

        attempts = 0

        max_attempts = max_questions * 3

        # =================================================
        # INTERVIEW LOOP
        # =================================================

        while total_questions < max_questions:

            attempts += 1

            if attempts > max_attempts:
                break

            # ---------------------------------------------
            # Generate main question
            # ---------------------------------------------

            result = self.generate_main_question(
                difficulty=difficulty,
                priority_entities=priority_entities,
                additional_entities=additional_entities,
                exclude_topics=used_topics
            )

            topic = result["topic"]

            question = result["question"]

            # ---------------------------------------------
            # Avoid duplicate topics
            # ---------------------------------------------

            if topic.lower() in [
                t.lower()
                for t in used_topics
            ]:
                continue

            used_topics.append(topic)

            # ---------------------------------------------
            # Count main question
            # ---------------------------------------------

            total_questions += 1

            main_questions += 1

            print("\n" + "=" * 60)

            print(
                f"RESUME QUESTION {total_questions}"
            )

            print(
                "Type: Main"
            )

            print(
                f"Topic: {topic}"
            )

            print(
                f"Question: {question}"
            )

            # ---------------------------------------------
            # Candidate answer
            # ---------------------------------------------

            candidate_answer = input(
                "\nCandidate Answer: "
            ).strip()

            # ---------------------------------------------
            # Evaluate candidate answer
            # ---------------------------------------------

            evaluation = self.evaluate_candidate_answer(
                topic=topic,
                question=question,
                candidate_answer=candidate_answer,
                retrieved_chunks=result[
                    "retrieved_chunks"
                ],
                difficulty=difficulty
            )

            # ---------------------------------------------
            # Display evaluation
            # ---------------------------------------------

            print("\n===== ANSWER EVALUATION =====")

            print(
                f"Score: {evaluation['score']}/10"
            )

            print(
                f"Status: {evaluation['status']}"
            )

            print(
                f"Feedback: {evaluation['feedback']}"
            )

            # ---------------------------------------------
            # Store main question
            # ---------------------------------------------

            interview_questions.append({
                "question_number": total_questions,
                "type": "main",
                "topic": topic,
                "question": question,
                "candidate_answer": candidate_answer,
                "score": evaluation["score"],
                "status": evaluation["status"],
                "feedback": evaluation["feedback"]
            })

            # ---------------------------------------------
            # Check follow-up limit
            # ---------------------------------------------

            if follow_up_questions >= max_follow_ups:

                if total_questions >= min_questions:
                    break

                continue

            # ---------------------------------------------
            # Decide whether follow-up is needed
            # ---------------------------------------------

            follow_up_result = self.process_candidate_answer(
                topic=topic,
                previous_question=question,
                candidate_answer=candidate_answer,
                retrieved_chunks=result[
                    "retrieved_chunks"
                ],
                difficulty=difficulty
            )

            # ---------------------------------------------
            # Generate follow-up if required
            # ---------------------------------------------

            if (
                follow_up_result["follow_up_required"]
                and follow_up_questions < max_follow_ups
                and total_questions < max_questions
            ):

                follow_up_question = (
                    follow_up_result[
                        "follow_up_question"
                    ]
                )

                total_questions += 1

                follow_up_questions += 1

                print("\n" + "-" * 60)

                print(
                    f"RESUME QUESTION {total_questions}"
                )

                print(
                    "Type: Follow-up"
                )

                print(
                    f"Topic: {topic}"
                )

                print(
                    f"Question: {follow_up_question}"
                )

                # -----------------------------------------
                # Follow-up answer
                # -----------------------------------------

                follow_up_answer = input(
                    "\nCandidate Answer: "
                ).strip()

                # -----------------------------------------
                # Evaluate follow-up answer
                # -----------------------------------------

                follow_up_evaluation = (
                    self.evaluate_candidate_answer(
                        topic=topic,
                        question=follow_up_question,
                        candidate_answer=follow_up_answer,
                        retrieved_chunks=result[
                            "retrieved_chunks"
                        ],
                        difficulty=difficulty
                    )
                )

                # -----------------------------------------
                # Display follow-up evaluation
                # -----------------------------------------

                print(
                    "\n===== FOLLOW-UP EVALUATION ====="
                )

                print(
                    f"Score: "
                    f"{follow_up_evaluation['score']}/10"
                )

                print(
                    f"Status: "
                    f"{follow_up_evaluation['status']}"
                )

                print(
                    f"Feedback: "
                    f"{follow_up_evaluation['feedback']}"
                )

                # -----------------------------------------
                # Store follow-up
                # -----------------------------------------

                interview_questions.append({
                    "question_number": total_questions,
                    "type": "follow_up",
                    "topic": topic,
                    "question": follow_up_question,
                    "candidate_answer": follow_up_answer,
                    "score": follow_up_evaluation["score"],
                    "status": follow_up_evaluation["status"],
                    "feedback": follow_up_evaluation["feedback"]
                })

            # ---------------------------------------------
            # Stop after minimum requirement
            # ---------------------------------------------

            if total_questions >= min_questions:

                break

        # =================================================
        # VALIDATION
        # =================================================

        if total_questions < min_questions:

            raise ValueError(
                f"Could generate only "
                f"{total_questions} resume questions. "
                f"Minimum required: {min_questions}"
            )

        # =================================================
        # CALCULATE TOTAL SCORE
        # =================================================

        total_score = sum(
            item["score"]
            for item in interview_questions
        )

        maximum_score = (
            total_questions * 10
        )

        if maximum_score > 0:

            percentage = (
                total_score /
                maximum_score
            ) * 100

        else:

            percentage = 0

        # =================================================
        # RETURN RESULT
        # =================================================

        return {
            "total_questions": total_questions,

            "main_questions": main_questions,

            "follow_up_questions": follow_up_questions,

            "total_score": total_score,

            "maximum_score": maximum_score,

            "percentage": round(
                percentage,
                2
            ),

            "questions": interview_questions
        }

    # =====================================================
    # EVALUATE CANDIDATE ANSWER
    # =====================================================

    def evaluate_candidate_answer(
        self,
        topic,
        question,
        candidate_answer,
        retrieved_chunks,
        difficulty="Medium"
    ):
        """
        Evaluate a resume-based interview answer using
        medium-strict, human-like evaluation.
        """

        if not candidate_answer or not candidate_answer.strip():
            return {
                "score": 0,
                "status": "Incorrect",
                "feedback": "No answer was provided."
            }

        context_parts = []

        for result in retrieved_chunks:
            chunk = result["chunk"]

            context_parts.append(
                f"Section: {chunk.get('section', '')}\n"
                f"Entity: {chunk.get('subsection', '')}\n"
                f"Content: {chunk.get('text', '')}"
            )

        resume_context = "\n\n".join(
            context_parts
        )

        prompt = f"""
You are an AI technical interviewer evaluating a candidate's answer
during a real technical interview.

Evaluation style: MEDIUM STRICTNESS and HUMAN-LIKE.

Topic:
{topic}

Difficulty:
{difficulty}

Interview question:
{question}

Candidate's answer:
{candidate_answer}

Relevant resume evidence:
--------------------------------
{resume_context}
--------------------------------

Evaluate the candidate based on the actual meaning and technical
understanding of the answer, not exact wording or keyword matching.

Consider:
1. Technical correctness
2. Understanding of the concept
3. Relevance to the question
4. Completeness
5. Quality of reasoning or explanation

HUMAN-LIKE EVALUATION RULES:

- Accept different wording from the expected explanation.
- Do not require exact keywords.
- Do not require textbook definitions.
- Accept simple explanations when the underlying meaning is correct.
- Accept examples and analogies when they demonstrate understanding.
- Accept technically valid alternative explanations.
- Accept conversational answers such as "basically", "I think", or
  "in simple terms" when the technical meaning is correct.
- Minor grammar, spelling, sentence structure, filler words, and
  speech-to-text mistakes should not significantly reduce the score.
- Do not penalize the candidate simply because they did not mention
  every minor detail.
- A short answer can receive a high score if it clearly demonstrates
  the core concept correctly.

PARTIAL UNDERSTANDING:

- If the core concept is correct but a minor detail is missing,
  give reasonable credit.
- If the candidate understands only part of the concept, give a
  partial score.
- If the candidate gives a technically correct alternative answer,
  accept it even if it differs from the resume context or expected
  wording.

PENALIZE WHEN:

- The core concept is incorrect.
- The candidate demonstrates significant misunderstanding.
- The answer contradicts the technical concept.
- The answer is mostly irrelevant.
- The candidate gives reasoning that would lead to an incorrect
  implementation.

SCORING:

9-10: Excellent understanding; technically correct and well explained.
7-8: Good understanding; core concept is correct with minor gaps.
5-6: Partial understanding; significant concepts are missing or
     partially misunderstood.
3-4: Weak understanding; major technical issues are present.
0-2: Incorrect, irrelevant, or no meaningful understanding.

IMPORTANT:

- Evaluate like a human technical interviewer.
- Focus on meaning, correctness, reasoning, and relevance.
- Do not use keyword matching as the primary scoring method.
- Do not require exact wording.
- Do not judge grammar or communication style.
- Do not invent information that the candidate did not provide.
- Do not penalize information that was not required by the question.

Return ONLY valid JSON.

Use exactly this format:

{{
    "score": 0,
    "status": "Incorrect",
    "feedback": "Short explanation"
}}

Status must be exactly one of:
Correct
Partially Correct
Incorrect
"""

        response = self.llm.generate(
            prompt
        ).strip()

        response = response.replace(
            "```json",
            ""
        ).replace(
            "```",
            ""
        ).strip()

        try:
            evaluation = json.loads(
                response
            )
        except json.JSONDecodeError:
            return {
                "score": 0,
                "status": "Incorrect",
                "feedback": "Unable to evaluate the answer."
            }

        try:
            score = float(
                evaluation.get("score", 0)
            )
        except (ValueError, TypeError):
            score = 0

        score = max(
            0,
            min(10, score)
        )

        status = evaluation.get(
            "status",
            "Incorrect"
        )

        if status not in {
            "Correct",
            "Partially Correct",
            "Incorrect"
        }:
            status = "Incorrect"

        feedback = str(
            evaluation.get(
                "feedback",
                "No feedback available."
            )
        ).strip()

        return {
            "score": round(score, 2),
            "status": status,
            "feedback": feedback
        }