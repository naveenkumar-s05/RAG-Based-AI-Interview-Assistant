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
from database.mongodb import candidates_collection
from pymongo import ASCENDING, DESCENDING
from ml.predictor import predict_job_readiness

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
        # XGBOOST JOB READINESS
        # ---------------------------------------------
        "job_readiness":
            None,

        "job_readiness_confidence":
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


    # =================================================
    # XGBOOST JOB READINESS PREDICTION
    # =================================================

    job_readiness = None

    job_readiness_confidence = None


    # -------------------------------------------------
    # Make prediction only when all five skill scores
    # are available
    # -------------------------------------------------

    if (
        payload.technical_knowledge is not None
        and
        payload.problem_solving is not None
        and
        payload.logical_thinking is not None
        and
        payload.programming is not None
        and
        payload.communication is not None
    ):

        prediction = predict_job_readiness(

            technical_knowledge=
                payload.technical_knowledge,

            problem_solving=
                payload.problem_solving,

            logical_thinking=
                payload.logical_thinking,

            programming_coding=
                payload.programming,

            communication=
                payload.communication
        )


        job_readiness = prediction[
            "job_readiness"
        ]

        job_readiness_confidence = prediction[
            "confidence"
        ]


    # =================================================
    # SAVE RESULT TO MONGODB
    # =================================================

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
                # XGBOOST JOB READINESS
                # -------------------------------------

                "job_readiness":
                    job_readiness,

                "job_readiness_confidence":
                    job_readiness_confidence,


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


    # =================================================
    # CANDIDATE DOES NOT EXIST
    # =================================================

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found."
        )


    # =================================================
    # RESPONSE
    # =================================================

    return {

        "success":
            True,

        "candidate_id":
            candidate_id,

        "status":
            payload.status,

        "job_readiness":
            job_readiness,

        "job_readiness_confidence":
            job_readiness_confidence
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