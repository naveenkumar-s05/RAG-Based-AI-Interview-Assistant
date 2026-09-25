from pathlib import Path
import os
import tempfile
import uuid

from dotenv import load_dotenv

load_dotenv()

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from api.candidate_routes import router as candidate_router
# =====================================================
# ENGINE
# =====================================================

from engine.question_selector import QuestionSelector
from engine.interview_controller import InterviewController


# =====================================================
# LLM
# =====================================================

from llm.openrouter_client import OpenRouterClient
from llm.resume_interviewer import ResumeInterviewer


# =====================================================
# RESUME
# =====================================================

from resume.extractor import ResumeExtractor
from resume.chunker import ResumeChunker


# =====================================================
# CONFIG
# =====================================================

from config.blueprint import BLUEPRINTS


# =====================================================
# SCHEMAS
# =====================================================

from api.schemas import (
    AnswerRequest,
    CodingAnswerRequest,
    ResumeAnswerRequest,InterviewResultRequest
)


# =====================================================
# APPLICATION
# =====================================================

app = FastAPI(
    title="AI Interview Assistant API",
    description="Backend API for AI-powered technical interviews",
    version="1.0.0"
)

app.include_router(
    candidate_router
)
# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,"
            "http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# =====================================================
# PATHS
# =====================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_DIR = BASE_DIR / "data"

CONCEPTUAL_PATH = str(
    DATA_DIR / "conceptual_questions.xlsx"
)

CODING_PATH = str(
    DATA_DIR / "coding_questions.xlsx"
)


# =====================================================
# ROLE
# =====================================================

DEFAULT_ROLE = "Machine Learning Engineer"


# =====================================================
# RESUME INTERVIEW SESSIONS
# =====================================================

resume_sessions = {}


# =====================================================
# ROOT
# =====================================================

@app.get("/")
def root():

    return {
        "success": True,
        "message": "AI Interview Assistant API is running"
    }


# =====================================================
# HEALTH
# =====================================================

@app.get("/health")
def health():

    return {
        "success": True,
        "status": "healthy"
    }


# =====================================================
# START TECHNICAL INTERVIEW
# =====================================================

@app.post("/interview/start")
def start_interview():

    # -------------------------------------------------
    # Load blueprint
    # -------------------------------------------------

    blueprint = BLUEPRINTS[
        DEFAULT_ROLE
    ]


    # -------------------------------------------------
    # Create selector
    # -------------------------------------------------

    selector = QuestionSelector(

        CONCEPTUAL_PATH,

        CODING_PATH

    )


    # -------------------------------------------------
    # Select conceptual questions
    # -------------------------------------------------

    conceptual_questions = (
        selector.select_conceptual_from_blueprint(
            blueprint
        )
    )


    # -------------------------------------------------
    # Select coding questions
    # -------------------------------------------------

    coding_questions = (
        selector.select_coding_from_blueprint(
            blueprint
        )
    )


    # -------------------------------------------------
    # Convert conceptual questions
    # -------------------------------------------------

    conceptual = []

    for _, row in conceptual_questions.iterrows():

        conceptual.append({

            "question":
                row["question"],

            "topic":
                row["topic"],

            "category":
                row["category"],

            "difficulty":
                row["difficulty"],

            "expected_concepts":
                row["expected_concepts"]

        })


    # -------------------------------------------------
    # Convert coding questions
    # -------------------------------------------------

    coding = []

    for _, row in coding_questions.iterrows():

        coding.append({

            "question":
                row["question"],

            "topic":
                row["topic"],

            "difficulty":
                row["difficulty"],

            "expected_concepts":
                row["expected_concepts"],

            "constraints":
                row["constraints"],

            "sample_input":
                row["sample_input"],

            "sample_output":
                row["sample_output"]

        })


    # -------------------------------------------------
    # Return interview questions
    # -------------------------------------------------

    return {

        "success": True,

        "role": DEFAULT_ROLE,

        "conceptual": conceptual,

        "coding": coding

    }


# =====================================================
# CONCEPTUAL ANSWER EVALUATION
# =====================================================

@app.post(
    "/interview/conceptual/evaluate"
)
def evaluate_conceptual_answer(
    request: AnswerRequest
):

    # -------------------------------------------------
    # Create controller WITHOUT running __init__
    #
    # This prevents ResumeInterviewer / FAISS
    # initialization for conceptual evaluation.
    #
    # InterviewController itself is NOT modified.
    # -------------------------------------------------

    controller = InterviewController.__new__(
        InterviewController
    )


    # -------------------------------------------------
    # Initialize only required LLM
    # -------------------------------------------------

    controller.llm = OpenRouterClient()


    # -------------------------------------------------
    # Use existing evaluation method
    # -------------------------------------------------

    evaluation = (
        controller.evaluate_conceptual_answer(

            question=request.question,

            candidate_answer=request.answer,

            expected_concepts=
                request.expected_concepts,

            difficulty=request.difficulty

        )
    )


    # -------------------------------------------------
    # Return
    # -------------------------------------------------

    return {

        "success": True,

        "evaluation": evaluation

    }


# =====================================================
# CODING ANSWER EVALUATION
# =====================================================

@app.post(
    "/interview/coding/evaluate"
)
def evaluate_coding_answer(
    request: CodingAnswerRequest
):

    # -------------------------------------------------
    # Create controller WITHOUT running __init__
    # -------------------------------------------------

    controller = InterviewController.__new__(
        InterviewController
    )


    # -------------------------------------------------
    # Initialize only required LLM
    # -------------------------------------------------

    controller.llm = OpenRouterClient()


    # -------------------------------------------------
    # Use existing coding evaluator
    # -------------------------------------------------

    evaluation = (
        controller.evaluate_coding_answer(

            question=request.question,

            candidate_code=request.code,

            expected_concepts=
                request.expected_concepts,

            constraints=request.constraints,

            sample_input=
                request.sample_input,

            sample_output=
                request.sample_output,

            difficulty=request.difficulty

        )
    )


    # -------------------------------------------------
    # Return
    # -------------------------------------------------

    return {

        "success": True,

        "evaluation": evaluation

    }


# =====================================================
# START RESUME INTERVIEW
# =====================================================

@app.post(
    "/interview/resume/start"
)
async def start_resume_interview(

    file: UploadFile = File(...),

    difficulty: str = Form("Medium")

):

    # -------------------------------------------------
    # Validate filename
    # -------------------------------------------------

    if not file.filename:

        raise HTTPException(

            status_code=400,

            detail="No resume file was provided."

        )


    # -------------------------------------------------
    # Get extension
    # -------------------------------------------------

    extension = os.path.splitext(
        file.filename
    )[1].lower()


    # -------------------------------------------------
    # Validate extension
    # -------------------------------------------------

    if extension not in {
        ".pdf",
        ".docx"
    }:

        raise HTTPException(

            status_code=400,

            detail=(
                "Only PDF and DOCX resumes "
                "are supported."
            )

        )


    temp_path = None


    try:

        # -------------------------------------------------
        # Read uploaded file
        # -------------------------------------------------

        file_bytes = await file.read()


        # -------------------------------------------------
        # Save temporary file
        # -------------------------------------------------

        with tempfile.NamedTemporaryFile(

            delete=False,

            suffix=extension

        ) as temp_file:

            temp_file.write(
                file_bytes
            )

            temp_path = temp_file.name


        # -------------------------------------------------
        # Extract resume
        # -------------------------------------------------

        extractor = ResumeExtractor()

        extracted_items = extractor.extract(
            temp_path
        )


        if not extracted_items:

            raise HTTPException(

                status_code=400,

                detail=(
                    "No content could be "
                    "extracted from the resume."
                )

            )


        # -------------------------------------------------
        # Create chunks
        # -------------------------------------------------

        chunker = ResumeChunker()

        resume_chunks = chunker.create_chunks(
            extracted_items
        )


        if not resume_chunks:

            raise HTTPException(

                status_code=400,

                detail=(
                    "No resume chunks could "
                    "be created."
                )

            )


        # -------------------------------------------------
        # Create ResumeInterviewer
        # -------------------------------------------------

        interviewer = ResumeInterviewer(
            resume_chunks
        )


        # -------------------------------------------------
        # Generate first MAIN question
        # -------------------------------------------------

        first_question = (
            interviewer.generate_main_question(

                difficulty=difficulty

            )
        )


        # -------------------------------------------------
        # Create session ID
        # -------------------------------------------------

        session_id = str(
            uuid.uuid4()
        )


        # -------------------------------------------------
        # Store session
        # -------------------------------------------------

        resume_sessions[
            session_id
        ] = {

            "interviewer":
                interviewer,

            "difficulty":
                difficulty,

            "question_number":
                1,

            "max_questions":
                10,

            "max_follow_ups":
                2,

            "follow_up_questions":
                0,

            "main_questions":
                1,

            # First two main questions cannot
            # generate follow-up questions.
            "main_question_count":
                1,

            "used_topics": [

                first_question[
                    "topic"
                ]

            ],

            "history": [],

            "completed":
                False,

            "current_question": {

                "question_number":
                    1,

                "type":
                    "main",

                "topic":
                    first_question[
                        "topic"
                    ],

                "question":
                    first_question[
                        "question"
                    ],

                "retrieved_chunks":
                    first_question[
                        "retrieved_chunks"
                    ]

            }

        }


        # -------------------------------------------------
        # Return first question
        # -------------------------------------------------

        return {

            "success": True,

            "session_id":
                session_id,

            "question_number":
                1,

            "type":
                "main",

            "topic":
                first_question[
                    "topic"
                ],

            "question":
                first_question[
                    "question"
                ],

            "difficulty":
                difficulty,

            "chunks":
                len(resume_chunks)

        }


    finally:

        # -------------------------------------------------
        # Delete temporary file
        # -------------------------------------------------

        if (

            temp_path

            and os.path.exists(
                temp_path
            )

        ):

            os.remove(
                temp_path
            )


# =====================================================
# RESUME ANSWER EVALUATION
# =====================================================

@app.post(
    "/interview/resume/evaluate"
)
def evaluate_resume_answer(
    request: ResumeAnswerRequest
):

    # =================================================
    # GET SESSION
    # =================================================

    session = resume_sessions.get(
        request.session_id
    )


    if session is None:

        raise HTTPException(

            status_code=404,

            detail=(
                "Resume interview session not found. "
                "Please start a new resume interview."
            )

        )


    # -------------------------------------------------
    # Check completed
    # -------------------------------------------------

    if session.get(
        "completed",
        False
    ):

        raise HTTPException(

            status_code=400,

            detail=(
                "This resume interview "
                "has already completed."
            )

        )


    # =================================================
    # GET SESSION DATA
    # =================================================

    interviewer = session[
        "interviewer"
    ]

    current_question = session[
        "current_question"
    ]

    difficulty = session[
        "difficulty"
    ]


    # =================================================
    # CURRENT QUESTION
    # =================================================

    question = current_question[
        "question"
    ]

    topic = current_question[
        "topic"
    ]

    retrieved_chunks = (
        current_question[
            "retrieved_chunks"
        ]
    )


    # =================================================
    # EVALUATE ANSWER
    # =================================================

    evaluation = (
        interviewer.evaluate_candidate_answer(

            topic=topic,

            question=question,

            candidate_answer=
                request.answer,

            retrieved_chunks=
                retrieved_chunks,

            difficulty=difficulty

        )
    )


    # =================================================
    # STORE ANSWER
    # =================================================

    session["history"].append({

        "question_number":
            session[
                "question_number"
            ],

        "type":
            current_question[
                "type"
            ],

        "topic":
            topic,

        "question":
            question,

        "answer":
            request.answer,

        "evaluation":
            evaluation

    })


    # =================================================
    # CHECK MAXIMUM QUESTIONS
    # =================================================

    if (
        session["question_number"]
        >= session["max_questions"]
    ):

        session["completed"] = True

        return {

            "success": True,

            "evaluation":
                evaluation,

            "interview_completed":
                True,

            "next_question":
                None

        }


    # =================================================
    # FOLLOW-UP DECISION
    # =================================================

    # Follow-ups are allowed only after the first
    # two MAIN questions have been completed.

    current_type = current_question[
        "type"
    ]

    main_question_count = session.get(
        "main_question_count",
        1
    )

    allow_follow_up = (

        current_type == "main"

        and

        main_question_count > 2

        and

        session[
            "follow_up_questions"
        ]
        <
        session[
            "max_follow_ups"
        ]

    )


    # =================================================
    # FOLLOW-UP
    # =================================================

    if allow_follow_up:

        follow_up_result = (
            interviewer.process_candidate_answer(

                topic=topic,

                previous_question=question,

                candidate_answer=
                    request.answer,

                retrieved_chunks=
                    retrieved_chunks,

                difficulty=difficulty

            )
        )


        if (
            follow_up_result[
                "follow_up_required"
            ]
        ):

            follow_up_question = (
                follow_up_result[
                    "follow_up_question"
                ]
            )


            # -------------------------------------------------
            # Increment total question count
            # -------------------------------------------------

            session[
                "question_number"
            ] += 1


            session[
                "follow_up_questions"
            ] += 1


            # -------------------------------------------------
            # Store current follow-up
            # -------------------------------------------------

            session[
                "current_question"
            ] = {

                "question_number":
                    session[
                        "question_number"
                    ],

                "type":
                    "follow_up",

                "topic":
                    topic,

                "question":
                    follow_up_question,

                "retrieved_chunks":
                    retrieved_chunks

            }


            # -------------------------------------------------
            # Return follow-up
            # -------------------------------------------------

            return {

                "success": True,

                "evaluation":
                    evaluation,

                "next_question": {

                    "question_number":
                        session[
                            "question_number"
                        ],

                    "type":
                        "follow_up",

                    "topic":
                        topic,

                    "question":
                        follow_up_question,

                    "difficulty":
                        difficulty

                },

                "interview_completed":
                    False

            }


    # =================================================
    # NO FOLLOW-UP
    # → GENERATE NEXT MAIN QUESTION
    # =================================================

    session[
        "question_number"
    ] += 1


    # =================================================
    # GENERATE NEXT MAIN QUESTION
    # =================================================

    used_topics = session.get(

        "used_topics",

        []

    )


    next_question = (
        interviewer.generate_main_question(

            difficulty=difficulty,

            exclude_topics=used_topics

        )
    )


    # -------------------------------------------------
    # Get next question information
    # -------------------------------------------------

    next_topic = (
        next_question[
            "topic"
        ]
    )

    next_question_text = (
        next_question[
            "question"
        ]
    )


    # -------------------------------------------------
    # Add topic to used topics
    # -------------------------------------------------

    used_topics.append(
        next_topic
    )


    session[
        "used_topics"
    ] = used_topics


    # =================================================
    # STORE NEXT MAIN QUESTION
    # =================================================

    session[
        "current_question"
    ] = {

        "question_number":
            session[
                "question_number"
            ],

        "type":
            "main",

        "topic":
            next_topic,

        "question":
            next_question_text,

        "retrieved_chunks":
            next_question[
                "retrieved_chunks"
            ]

    }


    session[
        "main_questions"
    ] += 1


    session[
        "main_question_count"
    ] += 1


    # =================================================
    # RETURN NEXT MAIN QUESTION
    # =================================================

    return {

        "success": True,

        "evaluation":
            evaluation,

        "next_question": {

            "question_number":
                session[
                    "question_number"
                ],

            "type":
                "main",

            "topic":
                next_topic,

            "question":
                next_question_text,

            "difficulty":
                difficulty

        },

        "interview_completed":
            False

    }


# =====================================================
# FINAL INTERVIEW RESULT
# =====================================================

@app.post("/interview/result")
def get_interview_result(
    request: InterviewResultRequest
):

    # -------------------------------------------------
    # Get resume interview session
    # -------------------------------------------------

    session = resume_sessions.get(
        request.session_id
    )

    if session is None:

        raise HTTPException(
            status_code=404,

            detail=(
                "Interview session not found."
            )
        )


    # -------------------------------------------------
    # Get completed answers
    # -------------------------------------------------

    history = session.get(
        "history",
        []
    )


    if not history:

        raise HTTPException(
            status_code=400,

            detail=(
                "No interview answers "
                "have been recorded yet."
            )
        )


    # -------------------------------------------------
    # Collect scores
    # -------------------------------------------------

    scores = []

    for item in history:

        evaluation = item.get(
            "evaluation",
            {}
        )

        score = evaluation.get(
            "score"
        )

        if isinstance(
            score,
            (int, float)
        ):

            scores.append(
                score
            )


    # -------------------------------------------------
    # Calculate overall score
    # -------------------------------------------------

    if scores:

        overall_score = round(
            sum(scores) / len(scores),
            2
        )

    else:

        overall_score = 0


    # -------------------------------------------------
    # Count question types
    # -------------------------------------------------

    main_questions = 0

    follow_up_questions = 0


    for item in history:

        if item.get(
            "type"
        ) == "main":

            main_questions += 1

        elif item.get(
            "type"
        ) == "follow_up":

            follow_up_questions += 1


    # -------------------------------------------------
    # Completion status
    # -------------------------------------------------

    completed = session.get(
        "completed",
        False
    )


    # -------------------------------------------------
    # Return result
    # -------------------------------------------------

    return {

        "success": True,

        "completed": completed,

        "session_id":
            request.session_id,

        "result": {

            "overall_score":
                overall_score,

            "total_questions":
                len(history),

            "main_questions":
                main_questions,

            "follow_up_questions":
                follow_up_questions,

            "scores":
                scores

        }

    }