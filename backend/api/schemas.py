from pydantic import BaseModel


class StartInterviewRequest(BaseModel):

    role: str = "Machine Learning Engineer"


class AnswerRequest(BaseModel):

    question: str

    answer: str

    expected_concepts: str

    difficulty: str = "Medium"


class CodingAnswerRequest(BaseModel):

    question: str

    code: str

    expected_concepts: str

    constraints: str

    sample_input: str

    sample_output: str

    difficulty: str = "Medium"

class ResumeAnswerRequest(BaseModel):

    session_id: str

    answer: str

class InterviewResultRequest(BaseModel):

    session_id: str