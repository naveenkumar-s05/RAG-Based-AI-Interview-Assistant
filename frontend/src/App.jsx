import { useRef, useState } from "react";
import "./App.css";

import {
  startInterview,
  evaluateConceptualAnswer,
  startResumeInterview,
  evaluateResumeAnswer,
  evaluateCodingAnswer,
  getInterviewResult,
  createCandidate,
  attachCandidateSession,
  saveCandidateResult,
} from "./services/api";

import Topbar from "./components/layout/Topbar";
import Footer from "./components/layout/Footer";

import LandingScreen from "./components/start/LandingScreen";
import RegistrationScreen from "./components/start/RegistrationScreen";
import ResumeUploadScreen from "./components/start/ResumeUploadScreen";
import InterviewIntroScreen from "./components/start/InterviewIntroScreen";

import ConceptualSection from "./components/interview/ConceptualSection";
import ResumeSection from "./components/interview/ResumeSection";
import CodingSection from "./components/interview/CodingSection";

import ProcessingScreen from "./components/result/ProcessingScreen";
import FinalResult from "./components/result/FinalResult";

const ROLE = "Machine Learning Engineer";

function App() {
  const resumeInputRef = useRef(null);

  // =====================================================
  // STAGE FLOW
  // =====================================================

  const [stage, setStage] = useState("landing");

  // =====================================================
  // CANDIDATE
  // =====================================================

  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateId, setCandidateId] = useState(null);

  // =====================================================
  // GENERAL
  // =====================================================

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // CONCEPTUAL
  // =====================================================

  const [conceptualQuestions, setConceptualQuestions] = useState([]);
  const [conceptualIndex, setConceptualIndex] = useState(0);
  const [conceptualEvaluation, setConceptualEvaluation] = useState(null);
  const [conceptualScores, setConceptualScores] = useState([]);
  const [conceptualSubmitted, setConceptualSubmitted] = useState(false);

  // =====================================================
  // RESUME
  // =====================================================

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeSessionId, setResumeSessionId] = useState(null);
  const [resumeQuestion, setResumeQuestion] = useState(null);
  const [resumeQuestionCount, setResumeQuestionCount] = useState(0);
  const [resumeEvaluation, setResumeEvaluation] = useState(null);
  const [resumeSubmitted, setResumeSubmitted] = useState(false);
  const [resumeScores, setResumeScores] = useState([]);
  const [resumeCompleted, setResumeCompleted] = useState(false);
  const [lastResumeResponse, setLastResumeResponse] = useState(null);

  // =====================================================
  // CODING
  // =====================================================

  const [codingQuestions, setCodingQuestions] = useState([]);
  const [codingIndex, setCodingIndex] = useState(0);
  const [code, setCode] = useState("");
  const [codingEvaluation, setCodingEvaluation] = useState(null);
  const [codingSubmitted, setCodingSubmitted] = useState(false);
  const [codingScores, setCodingScores] = useState([]);

  // =====================================================
  // FINAL RESULT
  // =====================================================

  const [finalResult, setFinalResult] = useState(null);

  // =====================================================
  // HELPERS
  // =====================================================

  const clearError = () => setError("");

  // =====================================================
  // VOICE - SPEAK QUESTION
  // =====================================================

  const speakQuestion = (questionText) => {
    if (!questionText) return;
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech synthesis is not supported.");
      return;
    }

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(questionText);
    speech.lang = "en-US";
    speech.rate = 0.95;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  // =====================================================
  // START INTERVIEW (runs candidate + question setup)
  // =====================================================

  const handleStart = async () => {
    try {
      setLoading(true);
      clearError();

      // 1. Create candidate
      const candidate = await createCandidate(
        candidateName.trim(),
        candidateEmail.trim()
      );

      if (!candidate || !candidate.success) {
        throw new Error("Unable to create candidate record.");
      }

      setCandidateId(candidate.candidate_id);

      // 2. Start conceptual + coding interview
      const data = await startInterview();

      if (!data || !data.success) {
        throw new Error("Unable to start interview.");
      }

      // 3. Prepare resume interview (analyzes the resume)
      const resumeData = await startResumeInterview(resumeFile, "Medium");

      if (!resumeData || !resumeData.success) {
        throw new Error("Unable to process resume.");
      }

      // 4. Attach candidate session
      await attachCandidateSession(
        candidate.candidate_id,
        resumeData.session_id,
        resumeFile.name
      );

      setConceptualQuestions(data.conceptual || []);
      setCodingQuestions(data.coding || []);
      setResumeSessionId(resumeData.session_id);
      setResumeQuestion({
        question_number: resumeData.question_number,
        type: resumeData.type,
        topic: resumeData.topic,
        question: resumeData.question,
        difficulty: resumeData.difficulty,
      });
      setResumeQuestionCount(resumeData.question_number);

      // Reset interview state
      setConceptualIndex(0);
      setConceptualEvaluation(null);
      setConceptualScores([]);
      setConceptualSubmitted(false);

      setResumeEvaluation(null);
      setResumeSubmitted(false);
      setResumeScores([]);
      setResumeCompleted(false);
      setLastResumeResponse(null);

      setCodingIndex(0);
      setCode("");
      setCodingEvaluation(null);
      setCodingSubmitted(false);
      setCodingScores([]);

      setFinalResult(null);
      setAnswer("");

      // Enter the conceptual round
      setStage("conceptual");

      const firstQuestion = data.conceptual?.[0];
      if (firstQuestion) {
        speakQuestion(firstQuestion.question);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to start interview.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CONCEPTUAL SUBMIT
  // =====================================================

  const handleConceptualSubmit = async () => {
    const question = conceptualQuestions[conceptualIndex];

    if (!question) {
      setError("Question not found.");
      return;
    }

    if (!answer.trim()) {
      setError("Please enter your answer.");
      return;
    }

    try {
      setLoading(true);
      clearError();

      const data = await evaluateConceptualAnswer(
        question.question,
        answer,
        question.expected_concepts,
        question.difficulty
      );

      if (!data || !data.success) {
        throw new Error("Conceptual evaluation failed.");
      }

      setConceptualEvaluation(data.evaluation);
      setConceptualScores((previous) => [
        ...previous,
        Number(data.evaluation.score),
      ]);
      setConceptualSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to evaluate answer.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CONCEPTUAL NEXT
  // =====================================================

  const handleConceptualNext = () => {
    const isLast = conceptualIndex >= conceptualQuestions.length - 1;

    // LAST CONCEPTUAL QUESTION -> resume round
    if (isLast) {
      window.speechSynthesis?.cancel();

      if (resumeQuestion?.question) {
        speakQuestion(resumeQuestion.question);
      }

      setStage("resumeInterview");
      setAnswer("");
      setConceptualSubmitted(false);
      setConceptualEvaluation(null);
      clearError();
      return;
    }

    const nextQuestion = conceptualQuestions[conceptualIndex + 1];

    if (nextQuestion) {
      speakQuestion(nextQuestion.question);
    }

    setConceptualIndex((previous) => previous + 1);
    setAnswer("");
    setConceptualSubmitted(false);
    setConceptualEvaluation(null);
    clearError();
  };

  // =====================================================
  // RESUME FILE
  // =====================================================

  const handleResumeFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (extension !== "pdf" && extension !== "docx") {
      setResumeFile(null);
      setError("Please upload a PDF or DOCX resume.");
      return;
    }

    clearError();
    setResumeFile(file);
  };

  const handleRemoveResumeFile = () => {
    setResumeFile(null);
    clearError();
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
  };

  // =====================================================
  // RESUME SUBMIT
  // =====================================================

  const handleResumeSubmit = async () => {
    if (!resumeSessionId) {
      setError("Resume interview session not found.");
      return;
    }

    if (!answer.trim()) {
      setError("Please enter your answer.");
      return;
    }

    try {
      setLoading(true);
      clearError();

      const data = await evaluateResumeAnswer(resumeSessionId, answer);

      if (!data || !data.success) {
        throw new Error("Resume evaluation failed.");
      }

      setResumeEvaluation(data.evaluation);
      setResumeScores((previous) => [
        ...previous,
        Number(data.evaluation.score),
      ]);
      setLastResumeResponse(data);
      setResumeSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to evaluate resume answer.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESUME NEXT
  // =====================================================

  const handleResumeNext = async () => {
    if (!lastResumeResponse) {
      setError("No next question information received.");
      return;
    }

    // INTERVIEW COMPLETED -> coding round
    if (lastResumeResponse.interview_completed === true) {
      window.speechSynthesis?.cancel();

      setResumeCompleted(true);
      setResumeSubmitted(false);
      setResumeEvaluation(null);
      setAnswer("");
      setStage("coding");
      setCodingIndex(0);
      setCode("");
      setCodingEvaluation(null);
      setCodingSubmitted(false);
      return;
    }

    const nextQuestion = lastResumeResponse.next_question;

    if (!nextQuestion) {
      setError("Backend did not return the next question.");
      return;
    }

    if (nextQuestion.question) {
      speakQuestion(nextQuestion.question);
    }

    setResumeQuestion({
      question_number: nextQuestion.question_number,
      type: nextQuestion.type,
      topic: nextQuestion.topic,
      question: nextQuestion.question,
      difficulty: nextQuestion.difficulty,
    });
    setResumeQuestionCount(nextQuestion.question_number);
    setResumeEvaluation(null);
    setResumeSubmitted(false);
    setAnswer("");
    setLastResumeResponse(null);
    clearError();
  };

  // =====================================================
  // CODING SUBMIT
  // =====================================================

  const handleCodingSubmit = async () => {
    const question = codingQuestions[codingIndex];

    if (!question) {
      setError("Coding question not found.");
      return;
    }

    if (!code.trim()) {
      setError("Please write your code.");
      return;
    }

    try {
      setLoading(true);
      clearError();

      const data = await evaluateCodingAnswer(
        question.question,
        code,
        question.expected_concepts,
        question.constraints,
        question.sample_input,
        question.sample_output,
        question.difficulty
      );

      if (!data || !data.success) {
        throw new Error("Coding evaluation failed.");
      }

      setCodingEvaluation(data.evaluation);
      setCodingScores((previous) => [
        ...previous,
        Number(data.evaluation.score),
      ]);
      setCodingSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to evaluate code.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CODING NEXT
  // =====================================================

  const handleCodingNext = () => {
    const isLast = codingIndex >= codingQuestions.length - 1;

    if (isLast) {
      finishInterview();
      return;
    }

    setCodingIndex((previous) => previous + 1);
    setCode("");
    setCodingEvaluation(null);
    setCodingSubmitted(false);
    clearError();
  };

  // =====================================================
  // FINISH INTERVIEW -> PROCESSING -> RESULT
  // =====================================================

  const finishInterview = async () => {
    setStage("processing");

    try {
      setLoading(true);
      clearError();

      let backendResumeResult = null;

      if (resumeSessionId) {
        try {
          const result = await getInterviewResult(resumeSessionId);
          if (result?.success) {
            backendResumeResult = result.result;
          }
        } catch (err) {
          console.warn("Could not fetch resume result:", err);
          setError(err.message || "Could not fetch resume result.");
        }
      }

      // Averages across section scores
      const conceptualAverage = calculateAverage(conceptualScores);
      const codingAverage = calculateAverage(codingScores);
      const resumeAverage = backendResumeResult
        ? Number(backendResumeResult.overall_score)
        : calculateAverage(resumeScores);

      const scores = [
        conceptualAverage,
        resumeAverage,
        codingAverage,
      ].filter((score) => score !== null && !Number.isNaN(score));

      let overall = 0;

      if (scores.length > 0) {
        overall = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        overall = Math.round(overall * 100) / 100;
      }

      const technicalKnowledge = conceptualAverage;
      const problemSolving = codingAverage;
      const logicalThinking =
        conceptualAverage !== null && codingAverage !== null
          ? Math.round((((conceptualAverage + codingAverage) / 2) * 100)) / 100
          : null;
      const programming = codingAverage;
      const communication = resumeAverage;

      let candidateResultResponse = null;

      if (candidateId) {
        try {
          candidateResultResponse = await saveCandidateResult(candidateId, {
            overall_score: overall,
            technical_knowledge: technicalKnowledge,
            problem_solving: problemSolving,
            logical_thinking: logicalThinking,
            programming,
            communication,
            conceptual_score: conceptualAverage,
            resume_score: resumeAverage,
            coding_score: codingAverage,
            status: "Completed",
          });
        } catch (err) {
          console.warn("Could not save candidate result:", err);
          setError(err.message || "Could not save your final result.");
        }
      }

      setFinalResult({
        overall,
        conceptual: conceptualAverage,
        resume: resumeAverage,
        coding: codingAverage,
        technicalKnowledge,
        problemSolving,
        logicalThinking,
        programming,
        communication,
        jobReadiness: candidateResultResponse?.job_readiness || null,
        jobReadinessConfidence:
          candidateResultResponse?.job_readiness_confidence ?? null,
        conceptualCount: conceptualScores.length,
        resumeCount: backendResumeResult
          ? backendResumeResult.total_questions
          : resumeScores.length,
        codingCount: codingScores.length,
      });

      setStage("result");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate final result.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // AVERAGE
  // =====================================================

  const calculateAverage = (scores) => {
    if (!scores || scores.length === 0) {
      return null;
    }

    const validScores = scores
      .map(Number)
      .filter((score) => !Number.isNaN(score));

    if (validScores.length === 0) {
      return null;
    }

    const total = validScores.reduce((sum, score) => sum + score, 0);
    return Math.round((total / validScores.length) * 100) / 100;
  };

  // =====================================================
  // RENDER: PRE-INTERVIEW SCREENS
  // =====================================================

  const renderScreen = () => {
    switch (stage) {
      case "landing":
        return (
          <LandingScreen onStart={() => setStage("registration")} />
        );

      case "registration":
        return (
          <RegistrationScreen
            name={candidateName}
            email={candidateEmail}
            setName={setCandidateName}
            setEmail={setCandidateEmail}
            onBack={() => setStage("landing")}
            onNext={(name, email) => {
              setCandidateName(name);
              setCandidateEmail(email);
              setStage("resume");
            }}
          />
        );

      case "resume":
        return (
          <ResumeUploadScreen
            resumeFile={resumeFile}
            resumeInputRef={resumeInputRef}
            handleResumeFileChange={handleResumeFileChange}
            onRemoveFile={handleRemoveResumeFile}
            onBack={() => setStage("registration")}
            onNext={() => setStage("intro")}
            loading={loading}
            error={error}
          />
        );

      case "intro":
        return (
          <InterviewIntroScreen
            role={ROLE}
            onStart={handleStart}
            onBack={() => setStage("resume")}
            loading={loading}
            error={error}
          />
        );

      // ===============================================
      // INTERVIEW ROUNDS
      // ===============================================

      case "conceptual":
        return (
          <ConceptualSection
            conceptualQuestions={conceptualQuestions}
            conceptualIndex={conceptualIndex}
            answer={answer}
            setAnswer={setAnswer}
            conceptualEvaluation={conceptualEvaluation}
            conceptualSubmitted={conceptualSubmitted}
            loading={loading}
            error={error}
            handleConceptualSubmit={handleConceptualSubmit}
            handleConceptualNext={handleConceptualNext}
          />
        );

      case "resumeInterview":
        return (
          <ResumeSection
            resumeQuestion={resumeQuestion}
            resumeQuestionCount={resumeQuestionCount}
            answer={answer}
            setAnswer={setAnswer}
            resumeEvaluation={resumeEvaluation}
            resumeSubmitted={resumeSubmitted}
            loading={loading}
            error={error}
            handleResumeSubmit={handleResumeSubmit}
            handleResumeNext={handleResumeNext}
          />
        );

      case "coding":
        return (
          <CodingSection
            codingQuestions={codingQuestions}
            codingIndex={codingIndex}
            code={code}
            setCode={setCode}
            codingEvaluation={codingEvaluation}
            codingSubmitted={codingSubmitted}
            loading={loading}
            error={error}
            handleCodingSubmit={handleCodingSubmit}
            handleCodingNext={handleCodingNext}
          />
        );

      // ===============================================
      // PROCESSING / RESULT
      // ===============================================

      case "processing":
        return <ProcessingScreen />;

      case "result":
        if (finalResult) {
          return <FinalResult finalResult={finalResult} />;
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <Topbar role={ROLE} />

      <main className="app-main">
        <div className={stage === "landing" ? "container container--xl" : "container"}>
          {renderScreen()}
        </div>
      </main>

      <Footer loading={loading} />
    </div>
  );
}

export default App;