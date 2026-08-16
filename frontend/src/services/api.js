const API_BASE_URL = "https://rag-based-ai-interview-assistant.onrender.com";

export async function startInterview() {
  const response = await fetch(
    `${API_BASE_URL}/interview/start`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to start interview");
  }

  return response.json();
}


export async function evaluateConceptualAnswer(
  question,
  answer,
  expectedConcepts,
  difficulty
) {
  const response = await fetch(
    `${API_BASE_URL}/interview/conceptual/evaluate`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        question,
        answer,
        expected_concepts: expectedConcepts,
        difficulty,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to evaluate conceptual answer"
    );
  }

  return response.json();
}


export async function startResumeInterview(
  resumeFile,
  difficulty = "Medium"
) {
  const formData = new FormData();

  formData.append(
    "file",
    resumeFile
  );

  formData.append(
    "difficulty",
    difficulty
  );

  const response = await fetch(
    `${API_BASE_URL}/interview/resume/start`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to start resume interview"
    );
  }

  return response.json();
}


export async function evaluateResumeAnswer(
  sessionId,
  answer
) {
  const response = await fetch(
    `${API_BASE_URL}/interview/resume/evaluate`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        session_id: sessionId,
        answer,
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(errorText);
  }

  return response.json();
}


export async function evaluateCodingAnswer(
  question,
  code,
  expectedConcepts,
  constraints,
  sampleInput,
  sampleOutput,
  difficulty
) {
  const response = await fetch(
    `${API_BASE_URL}/interview/coding/evaluate`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        question,
        code,
        expected_concepts:
          expectedConcepts,
        constraints,
        sample_input:
          sampleInput,
        sample_output:
          sampleOutput,
        difficulty,
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(errorText);
  }

  return response.json();
}


export async function getInterviewResult(
  sessionId
) {
  const response = await fetch(
    `${API_BASE_URL}/interview/result`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        session_id: sessionId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to get interview result"
    );
  }

  return response.json();
}
export async function createCandidate(
  name,
  email
) {
  const response = await fetch(
    `${API_BASE_URL}/candidates/create`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name,
        email,
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      errorText ||
      "Failed to create candidate"
    );
  }

  return response.json();
}


export async function attachCandidateSession(
  candidateId,
  sessionId,
  resumeFilename
) {
  const response = await fetch(
    `${API_BASE_URL}/candidates/${candidateId}/session`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        session_id: sessionId,
        resume_filename: resumeFilename,
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      errorText ||
      "Failed to attach interview session"
    );
  }

  return response.json();
}


export async function saveCandidateResult(
  candidateId,
  result
) {
  const response = await fetch(
    `${API_BASE_URL}/candidates/${candidateId}/result`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(result),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      errorText ||
      "Failed to save candidate result"
    );
  }

  return response.json();
}