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

import CandidateForm from "./components/start/CandidateForm";
import StartScreen from "./components/start/StartScreen";
import ConceptualSection from "./components/interview/ConceptualSection";
import ResumeSection from "./components/interview/ResumeSection";
import CodingSection from "./components/interview/CodingSection";
import FinalResult from "./components/result/FinalResult";


function App() {

  const resumeInputRef = useRef(null);


  // =====================================================
  // CANDIDATE
  // =====================================================

  const [candidateName, setCandidateName] =
    useState("");

  const [candidateEmail, setCandidateEmail] =
    useState("");

  const [candidateId, setCandidateId] =
    useState(null);


  // =====================================================
  // GENERAL
  // =====================================================

  const [started, setStarted] =
    useState(false);

  const [section, setSection] =
    useState("conceptual");

  const [answer, setAnswer] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // =====================================================
  // CONCEPTUAL
  // =====================================================

  const [conceptualQuestions, setConceptualQuestions] =
    useState([]);

  const [conceptualIndex, setConceptualIndex] =
    useState(0);

  const [conceptualEvaluation, setConceptualEvaluation] =
    useState(null);

  const [conceptualScores, setConceptualScores] =
    useState([]);

  const [conceptualSubmitted, setConceptualSubmitted] =
    useState(false);


  // =====================================================
  // RESUME
  // =====================================================

  const [resumeFile, setResumeFile] =
    useState(null);

  const [resumeSessionId, setResumeSessionId] =
    useState(null);

  const [resumeQuestion, setResumeQuestion] =
    useState(null);

  const [resumeQuestionCount, setResumeQuestionCount] =
    useState(0);

  const [resumeEvaluation, setResumeEvaluation] =
    useState(null);

  const [resumeSubmitted, setResumeSubmitted] =
    useState(false);

  const [resumeScores, setResumeScores] =
    useState([]);

  const [resumeCompleted, setResumeCompleted] =
    useState(false);

  const [lastResumeResponse, setLastResumeResponse] =
    useState(null);


  // =====================================================
  // CODING
  // =====================================================

  const [codingQuestions, setCodingQuestions] =
    useState([]);

  const [codingIndex, setCodingIndex] =
    useState(0);

  const [code, setCode] =
    useState("");

  const [codingEvaluation, setCodingEvaluation] =
    useState(null);

  const [codingSubmitted, setCodingSubmitted] =
    useState(false);

  const [codingScores, setCodingScores] =
    useState([]);


  // =====================================================
  // FINAL RESULT
  // =====================================================

  const [finalResult, setFinalResult] =
    useState(null);


  // =====================================================
  // ERROR
  // =====================================================

  const clearError = () => {
    setError("");
  };


  // =====================================================
  // VOICE - SPEAK QUESTION
  // =====================================================

  const speakQuestion = (questionText) => {

    if (!questionText) {
      return;
    }

    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      console.warn(
        "Speech synthesis is not supported."
      );

      return;
    }

    // Stop any currently playing speech
    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(
        questionText
      );

    speech.lang = "en-US";
    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.speak(
      speech
    );
  };


  // =====================================================
  // START INTERVIEW
  // =====================================================

  const handleStart = async () => {

    // ---------------------------------------------------
    // Candidate validation
    // ---------------------------------------------------

    if (!candidateName.trim()) {

      setError(
        "Please enter your full name."
      );

      return;
    }


    if (!candidateEmail.trim()) {

      setError(
        "Please enter your email address."
      );

      return;
    }


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(candidateEmail)) {

      setError(
        "Please enter a valid email address."
      );

      return;
    }


    if (!resumeFile) {

      setError(
        "Please upload your resume first."
      );

      return;
    }


    try {

      setLoading(true);

      clearError();


      // -------------------------------------------------
      // 1. Create candidate
      // -------------------------------------------------

      const candidate =
        await createCandidate(
          candidateName.trim(),
          candidateEmail.trim()
        );


      if (
        !candidate ||
        !candidate.success
      ) {

        throw new Error(
          "Unable to create candidate record."
        );

      }


      setCandidateId(
        candidate.candidate_id
      );


      // -------------------------------------------------
      // 2. Start conceptual + coding interview
      // -------------------------------------------------

      const data =
        await startInterview();


      if (
        !data ||
        !data.success
      ) {

        throw new Error(
          "Unable to start interview."
        );

      }


      // -------------------------------------------------
      // 3. Prepare resume interview
      // -------------------------------------------------

      const resumeData =
        await startResumeInterview(
          resumeFile,
          "Medium"
        );


      if (
        !resumeData ||
        !resumeData.success
      ) {

        throw new Error(
          "Unable to process resume."
        );

      }


      // -------------------------------------------------
      // 4. Attach candidate session
      // -------------------------------------------------

      await attachCandidateSession(
        candidate.candidate_id,
        resumeData.session_id,
        resumeFile.name
      );


      // -------------------------------------------------
      // Set conceptual questions
      // -------------------------------------------------

      setConceptualQuestions(
        data.conceptual || []
      );


      // -------------------------------------------------
      // Set coding questions
      // -------------------------------------------------

      setCodingQuestions(
        data.coding || []
      );


      // -------------------------------------------------
      // Resume session
      // -------------------------------------------------

      setResumeSessionId(
        resumeData.session_id
      );


      // -------------------------------------------------
      // First resume question
      // -------------------------------------------------

      setResumeQuestion({

        question_number:
          resumeData.question_number,

        type:
          resumeData.type,

        topic:
          resumeData.topic,

        question:
          resumeData.question,

        difficulty:
          resumeData.difficulty

      });


      setResumeQuestionCount(
        resumeData.question_number
      );


      // -------------------------------------------------
      // Reset conceptual
      // -------------------------------------------------

      setConceptualIndex(0);

      setConceptualEvaluation(null);

      setConceptualScores([]);

      setConceptualSubmitted(false);


      // -------------------------------------------------
      // Reset resume
      // -------------------------------------------------

      setResumeEvaluation(null);

      setResumeSubmitted(false);

      setResumeScores([]);

      setResumeCompleted(false);

      setLastResumeResponse(null);


      // -------------------------------------------------
      // Reset coding
      // -------------------------------------------------

      setCodingIndex(0);

      setCode("");

      setCodingEvaluation(null);

      setCodingSubmitted(false);

      setCodingScores([]);


      // -------------------------------------------------
      // Reset final result
      // -------------------------------------------------

      setFinalResult(null);

      setAnswer("");


      // -------------------------------------------------
      // Start conceptual
      // -------------------------------------------------

      setStarted(true);

      setSection("conceptual");


      // -------------------------------------------------
      // SPEAK FIRST CONCEPTUAL QUESTION
      // -------------------------------------------------

      const firstQuestion =
        data.conceptual?.[0];


      if (firstQuestion) {

        speakQuestion(
          firstQuestion.question
        );

      }


    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Failed to start interview."
      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // CONCEPTUAL SUBMIT
  // =====================================================

  const handleConceptualSubmit =
    async () => {

      const question =
        conceptualQuestions[
          conceptualIndex
        ];


      if (!question) {

        setError(
          "Question not found."
        );

        return;
      }


      if (!answer.trim()) {

        setError(
          "Please enter your answer."
        );

        return;
      }


      try {

        setLoading(true);

        clearError();


        const data =
          await evaluateConceptualAnswer(
            question.question,
            answer,
            question.expected_concepts,
            question.difficulty
          );


        if (
          !data ||
          !data.success
        ) {

          throw new Error(
            "Conceptual evaluation failed."
          );

        }


        setConceptualEvaluation(
          data.evaluation
        );


        setConceptualScores(
          previous => [
            ...previous,
            Number(
              data.evaluation.score
            )
          ]
        );


        setConceptualSubmitted(
          true
        );


      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Failed to evaluate answer."
        );


      } finally {

        setLoading(false);

      }

    };


  // =====================================================
  // CONCEPTUAL NEXT
  // =====================================================

  const handleConceptualNext = () => {

    const isLast =
      conceptualIndex >=
      conceptualQuestions.length - 1;


    // ---------------------------------------------------
    // LAST CONCEPTUAL QUESTION
    // ---------------------------------------------------

    if (isLast) {

      // Stop any conceptual speech
      if (
        window.speechSynthesis
      ) {

        window.speechSynthesis.cancel();

      }


      // -------------------------------------------------
      // SPEAK FIRST RESUME QUESTION
      // -------------------------------------------------

      if (
        resumeQuestion &&
        resumeQuestion.question
      ) {

        speakQuestion(
          resumeQuestion.question
        );

      }


      setSection("resume");

      setAnswer("");

      setConceptualSubmitted(
        false
      );

      setConceptualEvaluation(
        null
      );

      clearError();

      return;
    }


    // ---------------------------------------------------
    // GET NEXT CONCEPTUAL QUESTION
    // ---------------------------------------------------

    const nextIndex =
      conceptualIndex + 1;


    const nextQuestion =
      conceptualQuestions[
        nextIndex
      ];


    // ---------------------------------------------------
    // SPEAK NEXT CONCEPTUAL QUESTION
    // ---------------------------------------------------

    if (nextQuestion) {

      speakQuestion(
        nextQuestion.question
      );

    }


    // ---------------------------------------------------
    // Move to next conceptual question
    // ---------------------------------------------------

    setConceptualIndex(
      previous =>
        previous + 1
    );


    setAnswer("");

    setConceptualSubmitted(
      false
    );

    setConceptualEvaluation(
      null
    );

    clearError();

  };


  // =====================================================
  // RESUME FILE
  // =====================================================

  const handleResumeFileChange =
    event => {

      const file =
        event.target.files?.[0];


      if (!file) {
        return;
      }


      const extension =
        file.name
          .split(".")
          .pop()
          .toLowerCase();


      if (
        extension !== "pdf" &&
        extension !== "docx"
      ) {

        setResumeFile(null);

        setError(
          "Please upload a PDF or DOCX resume."
        );

        return;
      }


      clearError();

      setResumeFile(file);

    };


  // =====================================================
  // RESUME SUBMIT
  // =====================================================

  const handleResumeSubmit =
    async () => {

      if (!resumeSessionId) {

        setError(
          "Resume interview session not found."
        );

        return;
      }


      if (!answer.trim()) {

        setError(
          "Please enter your answer."
        );

        return;
      }


      try {

        setLoading(true);

        clearError();


        const data =
          await evaluateResumeAnswer(
            resumeSessionId,
            answer
          );


        if (
          !data ||
          !data.success
        ) {

          throw new Error(
            "Resume evaluation failed."
          );

        }


        setResumeEvaluation(
          data.evaluation
        );


        setResumeScores(
          previous => [
            ...previous,
            Number(
              data.evaluation.score
            )
          ]
        );


        setLastResumeResponse(
          data
        );


        setResumeSubmitted(
          true
        );


      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Failed to evaluate resume answer."
        );


      } finally {

        setLoading(false);

      }

    };


  // =====================================================
  // RESUME NEXT
  // =====================================================

  const handleResumeNext =
    async () => {

      if (!lastResumeResponse) {

        setError(
          "No next question information received."
        );

        return;
      }


      // -------------------------------------------------
      // INTERVIEW COMPLETED
      // -------------------------------------------------

      if (
        lastResumeResponse.interview_completed ===
        true
      ) {

        // Stop any resume question speech
        if (
          window.speechSynthesis
        ) {

          window.speechSynthesis.cancel();

        }


        setResumeCompleted(
          true
        );

        setResumeSubmitted(
          false
        );

        setResumeEvaluation(
          null
        );

        setAnswer("");

        setSection("coding");

        setCodingIndex(0);

        setCode("");

        setCodingEvaluation(
          null
        );

        setCodingSubmitted(
          false
        );

        return;
      }


      // -------------------------------------------------
      // GET NEXT RESUME QUESTION
      // -------------------------------------------------

      const nextQuestion =
        lastResumeResponse.next_question;


      if (!nextQuestion) {

        setError(
          "Backend did not return the next question."
        );

        return;
      }


      // -------------------------------------------------
      // SPEAK NEXT RESUME QUESTION
      // -------------------------------------------------

      if (
        nextQuestion.question
      ) {

        speakQuestion(
          nextQuestion.question
        );

      }


      // -------------------------------------------------
      // SET NEXT RESUME QUESTION
      // -------------------------------------------------

      setResumeQuestion({

        question_number:
          nextQuestion.question_number,

        type:
          nextQuestion.type,

        topic:
          nextQuestion.topic,

        question:
          nextQuestion.question,

        difficulty:
          nextQuestion.difficulty

      });


      setResumeQuestionCount(
        nextQuestion.question_number
      );


      setResumeEvaluation(
        null
      );

      setResumeSubmitted(
        false
      );

      setAnswer("");

      setLastResumeResponse(
        null
      );

      clearError();

    };


  // =====================================================
  // CODING SUBMIT
  // =====================================================

  const handleCodingSubmit =
    async () => {

      const question =
        codingQuestions[
          codingIndex
        ];


      if (!question) {

        setError(
          "Coding question not found."
        );

        return;
      }


      if (!code.trim()) {

        setError(
          "Please write your code."
        );

        return;
      }


      try {

        setLoading(true);

        clearError();


        const data =
          await evaluateCodingAnswer(
            question.question,
            code,
            question.expected_concepts,
            question.constraints,
            question.sample_input,
            question.sample_output,
            question.difficulty
          );


        if (
          !data ||
          !data.success
        ) {

          throw new Error(
            "Coding evaluation failed."
          );

        }


        setCodingEvaluation(
          data.evaluation
        );


        setCodingScores(
          previous => [
            ...previous,
            Number(
              data.evaluation.score
            )
          ]
        );


        setCodingSubmitted(
          true
        );


      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Failed to evaluate code."
        );


      } finally {

        setLoading(false);

      }

    };


  // =====================================================
  // CODING NEXT
  // =====================================================

  const handleCodingNext =
    () => {

      const isLast =
        codingIndex >=
        codingQuestions.length - 1;


      if (isLast) {

        finishInterview();

        return;
      }


      setCodingIndex(
        previous =>
          previous + 1
      );


      setCode("");

      setCodingEvaluation(
        null
      );

      setCodingSubmitted(
        false
      );

      clearError();

    };


  // =====================================================
  // FINAL RESULT
  // =====================================================

  const finishInterview =
    async () => {

      try {

        setLoading(true);

        clearError();


        let backendResumeResult =
          null;


        // -------------------------------------------------
        // Get resume result
        // -------------------------------------------------

        if (resumeSessionId) {

          try {

            const result =
              await getInterviewResult(
                resumeSessionId
              );


            if (
              result?.success
            ) {

              backendResumeResult =
                result.result;

            }


          } catch (err) {

            console.warn(
              "Could not fetch resume result:",
              err
            );

          }

        }


        // -------------------------------------------------
        // Calculate averages
        // -------------------------------------------------

        const conceptualAverage =
          calculateAverage(
            conceptualScores
          );


        const codingAverage =
          calculateAverage(
            codingScores
          );


        const resumeAverage =
          backendResumeResult
            ? Number(
                backendResumeResult.overall_score
              )
            : calculateAverage(
                resumeScores
              );


        // -------------------------------------------------
        // Overall
        // -------------------------------------------------

        const scores = [
          conceptualAverage,
          resumeAverage,
          codingAverage
        ].filter(
          score =>
            score !== null &&
            !Number.isNaN(score)
        );


        let overall = 0;


        if (scores.length > 0) {

          overall =
            scores.reduce(
              (sum, score) =>
                sum + score,
              0
            ) / scores.length;


          overall =
            Math.round(
              overall * 100
            ) / 100;

        }


        // -------------------------------------------------
        // Skill scores
        // -------------------------------------------------

        const technicalKnowledge =
          conceptualAverage;


        const problemSolving =
          codingAverage;


        const logicalThinking =
          conceptualAverage !== null &&
          codingAverage !== null
            ? Math.round(
                (
                  (
                    conceptualAverage +
                    codingAverage
                  ) / 2
                ) * 100
              ) / 100
            : null;


        const programming =
          codingAverage;


        const communication =
          resumeAverage;


        // -------------------------------------------------
        // Save candidate result
        // -------------------------------------------------

        if (candidateId) {

          await saveCandidateResult(
            candidateId,
            {
              overall_score:
                overall,

              technical_knowledge:
                technicalKnowledge,

              problem_solving:
                problemSolving,

              logical_thinking:
                logicalThinking,

              programming:
                programming,

              communication:
                communication,

              conceptual_score:
                conceptualAverage,

              resume_score:
                resumeAverage,

              coding_score:
                codingAverage,

              status:
                "Completed"
            }
          );

        }


        // -------------------------------------------------
        // Final result
        // -------------------------------------------------

        setFinalResult({

          overall,

          conceptual:
            conceptualAverage,

          resume:
            resumeAverage,

          coding:
            codingAverage,

          technicalKnowledge,

          problemSolving,

          logicalThinking,

          programming,

          communication,

          conceptualCount:
            conceptualScores.length,

          resumeCount:
            backendResumeResult
              ? backendResumeResult.total_questions
              : resumeScores.length,

          codingCount:
            codingScores.length

        });


        setSection("result");


      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Failed to generate final result."
        );


      } finally {

        setLoading(false);

      }

    };


  // =====================================================
  // AVERAGE
  // =====================================================

  const calculateAverage =
    scores => {

      if (
        !scores ||
        scores.length === 0
      ) {

        return null;

      }


      const validScores =
        scores
          .map(Number)
          .filter(
            score =>
              !Number.isNaN(score)
          );


      if (
        validScores.length === 0
      ) {

        return null;

      }


      const total =
        validScores.reduce(
          (sum, score) =>
            sum + score,
          0
        );


      return Math.round(
        (
          total /
          validScores.length
        ) * 100
      ) / 100;

    };


  // =====================================================
  // START SCREEN
  // =====================================================

  if (!started) {

    return (

      <StartScreen

        resumeFile={
          resumeFile
        }

        resumeInputRef={
          resumeInputRef
        }

        handleResumeFileChange={
          handleResumeFileChange
        }

        setResumeFile={
          setResumeFile
        }

        clearError={
          clearError
        }

        setError={
          setError
        }

        error={
          error
        }

        handleStart={
          handleStart
        }

        loading={
          loading
        }

        candidateName={
          candidateName
        }

        candidateEmail={
          candidateEmail
        }

        setCandidateName={
          setCandidateName
        }

        setCandidateEmail={
          setCandidateEmail
        }

      />

    );

  }


  // =====================================================
  // CONCEPTUAL
  // =====================================================

  if (
    section === "conceptual"
  ) {

    return (

      <ConceptualSection

        conceptualQuestions={
          conceptualQuestions
        }

        conceptualIndex={
          conceptualIndex
        }

        answer={
          answer
        }

        setAnswer={
          setAnswer
        }

        conceptualEvaluation={
          conceptualEvaluation
        }

        conceptualSubmitted={
          conceptualSubmitted
        }

        loading={
          loading
        }

        error={
          error
        }

        handleConceptualSubmit={
          handleConceptualSubmit
        }

        handleConceptualNext={
          handleConceptualNext
        }

      />

    );

  }


  // =====================================================
  // RESUME
  // =====================================================

  if (
    section === "resume"
  ) {

    return (

      <ResumeSection

        resumeQuestion={
          resumeQuestion
        }

        resumeQuestionCount={
          resumeQuestionCount
        }

        answer={
          answer
        }

        setAnswer={
          setAnswer
        }

        resumeEvaluation={
          resumeEvaluation
        }

        resumeSubmitted={
          resumeSubmitted
        }

        loading={
          loading
        }

        error={
          error
        }

        handleResumeSubmit={
          handleResumeSubmit
        }

        handleResumeNext={
          handleResumeNext
        }

      />

    );

  }


  // =====================================================
  // CODING
  // =====================================================

  if (
    section === "coding"
  ) {

    return (

      <CodingSection

        codingQuestions={
          codingQuestions
        }

        codingIndex={
          codingIndex
        }

        code={
          code
        }

        setCode={
          setCode
        }

        codingEvaluation={
          codingEvaluation
        }

        codingSubmitted={
          codingSubmitted
        }

        loading={
          loading
        }

        error={
          error
        }

        handleCodingSubmit={
          handleCodingSubmit
        }

        handleCodingNext={
          handleCodingNext
        }

      />

    );

  }


  // =====================================================
  // RESULT
  // =====================================================

  if (
    section === "result" &&
    finalResult
  ) {

    return (

      <FinalResult
        finalResult={
          finalResult
        }
      />

    );

  }


  return null;
}


export default App;