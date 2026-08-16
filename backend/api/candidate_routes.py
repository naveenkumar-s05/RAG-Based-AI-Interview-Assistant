import os
import re
import uuid

from datetime import datetime, timezone

from dotenv import load_dotenv

from fastapi import APIRouter, HTTPException

from pydantic import (
    BaseModel,
    field_validator
)

from pymongo import (
    MongoClient,
    ASCENDING,
    DESCENDING
)


# =====================================================
# LOAD ENVIRONMENT VARIABLES
# =====================================================

load_dotenv()


# =====================================================
# ROUTER
# =====================================================

router = APIRouter(
    prefix="/candidates",
    tags=["Candidates"]
)


# =====================================================
# MONGODB ATLAS CONFIGURATION
# =====================================================

MONGODB_URI = os.getenv(
    "MONGODB_URI"
)


if not MONGODB_URI:

    raise RuntimeError(
        "MONGODB_URI is not configured in .env"
    )


# =====================================================
# MONGODB CLIENT
# =====================================================

client = MongoClient(
    MONGODB_URI
)


# =====================================================
# DATABASE
# =====================================================

database = client[
    "AIInterviewAssistant"
]


# =====================================================
# COLLECTION
# =====================================================

candidates_collection = database[
    "candidates"
]


# =====================================================
# DATABASE INDEXES
# =====================================================

candidates_collection.create_index(
    [
        (
            "candidate_id",
            ASCENDING
        )
    ],
    unique=True
)


candidates_collection.create_index(
    [
        (
            "created_at",
            DESCENDING
        )
    ]
)


# =====================================================
# CANDIDATE CREATE MODEL
# =====================================================

class CandidateCreate(BaseModel):

    name: str

    email: str


    @field_validator("email")
    @classmethod
    def validate_email(
        cls,
        value
    ):

        value = value.strip().lower()


        if not re.fullmatch(
            r"[^\s@]+@[^\s@]+\.[^\s@]+",
            value
        ):

            raise ValueError(
                "Invalid email address."
            )


        return value


# =====================================================
# SESSION UPDATE MODEL
# =====================================================

class CandidateSessionUpdate(BaseModel):

    session_id: str

    resume_filename: str | None = None


# =====================================================
# RESULT UPDATE MODEL
# =====================================================

class CandidateResultUpdate(BaseModel):

    overall_score: float | None = None

    technical_knowledge: float | None = None

    problem_solving: float | None = None

    logical_thinking: float | None = None

    programming: float | None = None

    communication: float | None = None

    conceptual_score: float | None = None

    resume_score: float | None = None

    coding_score: float | None = None

    status: str = "Completed"


# =====================================================
# CREATE CANDIDATE
# =====================================================

@router.post("/create")
def create_candidate(
    payload: CandidateCreate
):

    candidate_id = str(
        uuid.uuid4()
    )


    created_at = datetime.now(
        timezone.utc
    ).isoformat()


    candidate_document = {

        "candidate_id":
            candidate_id,

        "name":
            payload.name.strip(),

        "email":
            payload.email,

        "resume_filename":
            None,

        "interview_session_id":
            None,

        # ---------------------------------------------
        # FINAL SCORES
        # ---------------------------------------------

        "overall_score":
            None,

        "technical_knowledge":
            None,

        "problem_solving":
            None,

        "logical_thinking":
            None,

        "programming":
            None,

        "communication":
            None,

        # ---------------------------------------------
        # SECTION SCORES
        # ---------------------------------------------

        "conceptual_score":
            None,

        "resume_score":
            None,

        "coding_score":
            None,

        # ---------------------------------------------
        # STATUS
        # ---------------------------------------------

        "status":
            "Started",

        # ---------------------------------------------
        # TIMESTAMPS
        # ---------------------------------------------

        "created_at":
            created_at,

        "completed_at":
            None
    }


    try:

        candidates_collection.insert_one(
            candidate_document
        )

    except Exception as error:

        print(
            "MongoDB insert error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create candidate."
        )


    return {

        "success":
            True,

        "candidate_id":
            candidate_id,

        "name":
            payload.name.strip(),

        "email":
            payload.email
    }


# =====================================================
# ATTACH INTERVIEW SESSION
# =====================================================

@router.patch(
    "/{candidate_id}/session"
)
def attach_session(

    candidate_id: str,

    payload: CandidateSessionUpdate

):

    result = candidates_collection.update_one(

        {
            "candidate_id":
                candidate_id
        },

        {
            "$set": {

                "interview_session_id":
                    payload.session_id,

                "resume_filename":
                    payload.resume_filename
            }
        }

    )


    # ---------------------------------------------
    # Candidate does not exist
    # ---------------------------------------------

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found."
        )


    return {

        "success":
            True,

        "candidate_id":
            candidate_id
    }


# =====================================================
# SAVE FINAL CANDIDATE RESULT
# =====================================================

@router.patch(
    "/{candidate_id}/result"
)
def update_candidate_result(

    candidate_id: str,

    payload: CandidateResultUpdate

):

    completed_at = datetime.now(
        timezone.utc
    ).isoformat()


    result = candidates_collection.update_one(

        {
            "candidate_id":
                candidate_id
        },

        {
            "$set": {

                # -------------------------------------
                # OVERALL
                # -------------------------------------

                "overall_score":
                    payload.overall_score,

                # -------------------------------------
                # SKILL ASSESSMENT
                # -------------------------------------

                "technical_knowledge":
                    payload.technical_knowledge,

                "problem_solving":
                    payload.problem_solving,

                "logical_thinking":
                    payload.logical_thinking,

                "programming":
                    payload.programming,

                "communication":
                    payload.communication,

                # -------------------------------------
                # SECTION SCORES
                # -------------------------------------

                "conceptual_score":
                    payload.conceptual_score,

                "resume_score":
                    payload.resume_score,

                "coding_score":
                    payload.coding_score,

                # -------------------------------------
                # STATUS
                # -------------------------------------

                "status":
                    payload.status,

                # -------------------------------------
                # COMPLETION TIME
                # -------------------------------------

                "completed_at":
                    completed_at
            }
        }

    )


    # ---------------------------------------------
    # Candidate does not exist
    # ---------------------------------------------

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found."
        )


    return {

        "success":
            True,

        "candidate_id":
            candidate_id,

        "status":
            payload.status
    }


# =====================================================
# GET ALL CANDIDATES
# =====================================================

@router.get("")
def get_candidates():

    cursor = candidates_collection.find(
        {},
        {
            "_id": 0
        }
    ).sort(
        "created_at",
        DESCENDING
    )


    candidates = list(
        cursor
    )


    return {

        "success":
            True,

        "candidates":
            candidates
    }