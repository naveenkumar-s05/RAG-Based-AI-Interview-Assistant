from llm.openrouter_client import OpenRouterClient
from engine.question_selector import QuestionSelector
from llm.resume_interviewer import ResumeInterviewer


class InterviewController:

    def __init__(
        self,
        resume_chunks,
        conceptual_path,
        coding_path
    ):
        """
        Connect the existing interview components.
        """

        self.resume_interviewer = ResumeInterviewer(
            resume_chunks
        )

        self.question_selector = QuestionSelector(
            conceptual_path,
            coding_path
        )

        self.llm = OpenRouterClient()

    # =====================================================
    # CONCEPTUAL ANSWER EVALUATION
    # =====================================================

    def evaluate_conceptual_answer(
        self,
        question,
        candidate_answer,
        expected_concepts,
        difficulty
    ):
        """
        Evaluate a conceptual interview answer.
        """

        if not candidate_answer.strip():

            return {
                "score": 0,
                "status": "Incorrect",
                "feedback": "No answer was provided."
            }

        prompt = f"""
You are an AI technical interviewer.

Evaluate the candidate's answer to a conceptual
technical interview question.

Question:
{question}

Difficulty:
{difficulty}

Expected concepts:
{expected_concepts}

Candidate's answer:
{candidate_answer}

Evaluate based on:

1. Technical correctness
2. Understanding of the concept
3. Relevance to the question
4. Coverage of the expected concepts

Do not judge grammar or communication style.

STRICT RULES:

1. Score from 0 to 10.

2. Status must be exactly one of:

Correct
Partially Correct
Incorrect

3. Compare the answer against the expected concepts.

4. Do not require information that is not
   represented in the expected concepts.

5. Give short feedback.

6. Return ONLY valid JSON.

Format:

{{
    "score": 0,
    "status": "Incorrect",
    "feedback": "Short explanation"
}}
"""

        response = self.llm.generate(
            prompt
        ).strip()

        response = (
            response
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        try:

            return self._parse_evaluation(
                response
            )

        except Exception:

            return {
                "score": 0,
                "status": "Incorrect",
                "feedback": "Unable to evaluate the answer."
            }

    # =====================================================
    # CODING ANSWER EVALUATION
    # =====================================================

    def evaluate_coding_answer(
        self,
        question,
        candidate_code,
        expected_concepts,
        constraints,
        sample_input,
        sample_output,
        difficulty
    ):
        """
        Evaluate a candidate's coding solution.
        """

        if not candidate_code.strip():

            return {
                "score": 0,
                "status": "Incorrect",
                "feedback": "No code was provided."
            }

        prompt = f"""
You are an AI coding interviewer.

Evaluate the candidate's submitted code.

Coding question:
{question}

Difficulty:
{difficulty}

Expected concepts:
{expected_concepts}

Constraints:
{constraints}

Sample input:
{sample_input}

Expected sample output:
{sample_output}

Candidate's code:
--------------------------------
{candidate_code}
--------------------------------

Evaluate the solution based on:

1. Whether it solves the given problem.
2. Correctness of the algorithm.
3. Whether the expected concepts are used appropriately.
4. Handling of relevant edge cases.
5. Time complexity.
6. Space complexity.
7. Whether the code would produce the expected output.

IMPORTANT:

Do not require the candidate to use exactly
the same implementation as the expected solution.

A different valid algorithm should receive
full credit.

STRICT RULES:

1. Score from 0 to 10.

2. Status must be exactly one of:

Correct
Partially Correct
Incorrect

3. Give concise feedback.

4. Do not penalize formatting or variable naming
   unless it affects correctness.

5. Do not invent execution results.

6. If the code has a syntax error, classify it
   as Incorrect.

7. If the algorithm is logically correct but has
   a minor issue, consider Partially Correct.

8. Return ONLY valid JSON.

Format:

{{
    "score": 0,
    "status": "Incorrect",
    "feedback": "Short explanation"
}}
"""

        response = self.llm.generate(
            prompt
        ).strip()

        response = (
            response
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        try:

            return self._parse_evaluation(
                response
            )

        except Exception:

            return {
                "score": 0,
                "status": "Incorrect",
                "feedback": "Unable to evaluate the code."
            }

    # =====================================================
    # PARSE EVALUATION
    # =====================================================

    def _parse_evaluation(
        self,
        response
    ):
        """
        Convert LLM evaluation into a safe dictionary.
        """

        import json

        evaluation = json.loads(
            response
        )

        # -------------------------------------------------
        # Score
        # -------------------------------------------------

        try:

            score = int(
                evaluation.get(
                    "score",
                    0
                )
            )

        except (
            ValueError,
            TypeError
        ):

            score = 0

        score = max(
            0,
            min(
                10,
                score
            )
        )

        # -------------------------------------------------
        # Status
        # -------------------------------------------------

        valid_statuses = {
            "Correct",
            "Partially Correct",
            "Incorrect"
        }

        status = evaluation.get(
            "status",
            "Incorrect"
        )

        if status not in valid_statuses:

            status = "Incorrect"

        # -------------------------------------------------
        # Feedback
        # -------------------------------------------------

        feedback = str(
            evaluation.get(
                "feedback",
                "No feedback available."
            )
        ).strip()

        return {
            "score": score,
            "status": status,
            "feedback": feedback
        }

    # =====================================================
    # CONCEPTUAL SECTION
    # =====================================================

    def run_conceptual_section(
        self,
        blueprint
    ):
        """
        Select, ask, and evaluate conceptual questions.
        """

        questions = (
            self.question_selector
            .select_conceptual_from_blueprint(
                blueprint
            )
        )

        results = []

        print("\n")
        print("=" * 70)
        print("                 CONCEPTUAL INTERVIEW")
        print("=" * 70)

        for index, row in questions.iterrows():

            print(
                "\n" + "-" * 70
            )

            print(
                f"CONCEPTUAL QUESTION "
                f"{index + 1}"
            )

            print(
                f"Topic: {row['topic']}"
            )

            print(
                f"Difficulty: "
                f"{row['difficulty']}"
            )

            print(
                f"\nQuestion: "
                f"{row['question']}"
            )

            candidate_answer = input(
                "\nCandidate Answer: "
            ).strip()

            # -------------------------------------------------
            # Evaluate answer
            # -------------------------------------------------

            evaluation = (
                self.evaluate_conceptual_answer(
                    question=row["question"],
                    candidate_answer=candidate_answer,
                    expected_concepts=row[
                        "expected_concepts"
                    ],
                    difficulty=row["difficulty"]
                )
            )

            print(
                "\n===== CONCEPTUAL EVALUATION ====="
            )

            print(
                f"Score: "
                f"{evaluation['score']}/10"
            )

            print(
                f"Status: "
                f"{evaluation['status']}"
            )

            print(
                f"Feedback: "
                f"{evaluation['feedback']}"
            )

            results.append({
                "question_number": index + 1,
                "type": "conceptual",
                "topic": row["topic"],
                "difficulty": row["difficulty"],
                "question": row["question"],
                "expected_concepts": row[
                    "expected_concepts"
                ],
                "candidate_answer": candidate_answer,
                "score": evaluation["score"],
                "status": evaluation["status"],
                "feedback": evaluation["feedback"]
            })

        return results

    # =====================================================
    # RESUME SECTION
    # =====================================================

    def run_resume_section(
        self,
        min_questions=7,
        max_questions=10,
        max_follow_ups=2,
        difficulty="Medium",
        priority_entities=None,
        additional_entities=None
    ):
        """
        Run the existing ResumeInterviewer.
        """

        print("\n")
        print("=" * 70)
        print("                    RESUME INTERVIEW")
        print("=" * 70)

        result = (
            self.resume_interviewer
            .run_resume_interview(
                min_questions=min_questions,
                max_questions=max_questions,
                max_follow_ups=max_follow_ups,
                difficulty=difficulty,
                priority_entities=priority_entities,
                additional_entities=additional_entities
            )
        )

        return result

    # =====================================================
    # CODING SECTION
    # =====================================================

    def run_coding_section(
        self,
        blueprint
    ):
        """
        Select, ask, and evaluate coding questions.
        """

        questions = (
            self.question_selector
            .select_coding_from_blueprint(
                blueprint
            )
        )

        results = []

        print("\n")
        print("=" * 70)
        print("                    CODING INTERVIEW")
        print("=" * 70)

        for index, row in questions.iterrows():

            print(
                "\n" + "-" * 70
            )

            print(
                f"CODING QUESTION "
                f"{index + 1}"
            )

            print(
                f"Topic: {row['topic']}"
            )

            print(
                f"Difficulty: "
                f"{row['difficulty']}"
            )

            print(
                f"\nQuestion: "
                f"{row['question']}"
            )

            print(
                f"\nConstraints: "
                f"{row['constraints']}"
            )

            print(
                f"\nSample Input: "
                f"{row['sample_input']}"
            )

            print(
                f"Sample Output: "
                f"{row['sample_output']}"
            )

            # -------------------------------------------------
            # Candidate code
            # -------------------------------------------------

            print(
                "\nEnter your code."
            )

            print(
                "Type END on a new line when finished."
            )

            code_lines = []

            while True:

                line = input()

                if line.strip() == "END":
                    break

                code_lines.append(line)

            candidate_code = "\n".join(
                code_lines
            )

            # -------------------------------------------------
            # Evaluate code
            # -------------------------------------------------

            evaluation = (
                self.evaluate_coding_answer(
                    question=row["question"],
                    candidate_code=candidate_code,
                    expected_concepts=row[
                        "expected_concepts"
                    ],
                    constraints=row["constraints"],
                    sample_input=row["sample_input"],
                    sample_output=row["sample_output"],
                    difficulty=row["difficulty"]
                )
            )

            print(
                "\n===== CODING EVALUATION ====="
            )

            print(
                f"Score: "
                f"{evaluation['score']}/10"
            )

            print(
                f"Status: "
                f"{evaluation['status']}"
            )

            print(
                f"Feedback: "
                f"{evaluation['feedback']}"
            )

            results.append({
                "question_number": index + 1,
                "type": "coding",
                "topic": row["topic"],
                "difficulty": row["difficulty"],
                "question": row["question"],
                "expected_concepts": row[
                    "expected_concepts"
                ],
                "constraints": row["constraints"],
                "sample_input": row["sample_input"],
                "sample_output": row["sample_output"],
                "candidate_code": candidate_code,
                "score": evaluation["score"],
                "status": evaluation["status"],
                "feedback": evaluation["feedback"]
            })

        return results

    # =====================================================
    # FINAL SCORE
    # =====================================================

    def calculate_final_score(
        self,
        conceptual_results,
        resume_results,
        coding_results
    ):
        """
        Calculate the final interview score.

        Conceptual = 33.33%
        Resume     = 33.33%
        Coding     = 33.33%
        """

        # -------------------------------------------------
        # Conceptual score
        # -------------------------------------------------

        conceptual_scores = [
            item["score"]
            for item in conceptual_results
            if "score" in item
        ]

        if conceptual_scores:

            conceptual_score = (
                sum(conceptual_scores)
                / len(conceptual_scores)
            )

        else:

            conceptual_score = 0

        # -------------------------------------------------
        # Resume score
        # -------------------------------------------------

        if resume_results.get(
            "maximum_score",
            0
        ) > 0:

            resume_score = (
                resume_results["total_score"]
                / resume_results["maximum_score"]
            ) * 10

        else:

            resume_score = 0

        # -------------------------------------------------
        # Coding score
        # -------------------------------------------------

        coding_scores = [
            item["score"]
            for item in coding_results
            if "score" in item
        ]

        if coding_scores:

            coding_score = (
                sum(coding_scores)
                / len(coding_scores)
            )

        else:

            coding_score = 0

        # -------------------------------------------------
        # Overall score
        # -------------------------------------------------

        overall_score = (
            conceptual_score
            + resume_score
            + coding_score
        ) / 3

        return {
            "conceptual_score": round(
                conceptual_score,
                2
            ),

            "resume_score": round(
                resume_score,
                2
            ),

            "coding_score": round(
                coding_score,
                2
            ),

            "overall_score": round(
                overall_score,
                2
            ),

            "overall_percentage": round(
                overall_score * 10,
                2
            )
        }

    # =====================================================
    # COMPLETE INTERVIEW
    # =====================================================

    def run_interview(
        self,
        blueprint,
        resume_min_questions=7,
        resume_max_questions=10,
        max_follow_ups=2,
        resume_difficulty="Medium",
        priority_entities=None,
        additional_entities=None
    ):
        """
        Complete interview order:

        1. Conceptual
        2. Resume
        3. Coding
        4. Final score
        """

        # =================================================
        # 1. CONCEPTUAL
        # =================================================

        conceptual_results = (
            self.run_conceptual_section(
                blueprint
            )
        )

        # =================================================
        # 2. RESUME
        # =================================================

        resume_results = (
            self.run_resume_section(
                min_questions=resume_min_questions,
                max_questions=resume_max_questions,
                max_follow_ups=max_follow_ups,
                difficulty=resume_difficulty,
                priority_entities=priority_entities,
                additional_entities=additional_entities
            )
        )

        # =================================================
        # 3. CODING
        # =================================================

        coding_results = (
            self.run_coding_section(
                blueprint
            )
        )

        # =================================================
        # 4. FINAL SCORE
        # =================================================

        final_score = (
            self.calculate_final_score(
                conceptual_results=conceptual_results,
                resume_results=resume_results,
                coding_results=coding_results
            )
        )

        # =================================================
        # DISPLAY FINAL SCORE
        # =================================================

        print("\n")
        print("=" * 70)
        print("                    FINAL RESULT")
        print("=" * 70)

        print(
            f"\nConceptual Score: "
            f"{final_score['conceptual_score']}/10"
        )

        print(
            f"Resume Score: "
            f"{final_score['resume_score']}/10"
        )

        print(
            f"Coding Score: "
            f"{final_score['coding_score']}/10"
        )

        print(
            f"\nOverall Score: "
            f"{final_score['overall_score']}/10"
        )

        print(
            f"Overall Percentage: "
            f"{final_score['overall_percentage']}%"
        )

        print("=" * 70)

        # =================================================
        # RETURN COMPLETE RESULT
        # =================================================

        return {
            "conceptual": conceptual_results,
            "resume": resume_results,
            "coding": coding_results,
            "final_score": final_score
        }