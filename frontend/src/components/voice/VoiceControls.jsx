import { useEffect, useRef, useState } from "react";

function VoiceControls({
  question,
  onTranscript,
  disabled = false,
}) {
  const recognitionRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);

  // =====================================================
  // CHECK SPEECH RECOGNITION SUPPORT
  // =====================================================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    // Browser does not support speech recognition
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // ===================================================
    // START
    // ===================================================

    recognition.onstart = () => {
      setIsListening(true);
    };

    // ===================================================
    // RESULT
    // ===================================================

    recognition.onresult = (event) => {
      let finalText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const result = event.results[i];

        if (result.isFinal) {
          finalText += result[0].transcript;
        }
      }

      if (finalText.trim()) {
        setTranscript((previous) => {
          const updated =
            `${previous} ${finalText}`.trim();

          if (typeof onTranscript === "function") {
            onTranscript(updated);
          }

          return updated;
        });
      }
    };

    // ===================================================
    // ERROR
    // ===================================================

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
    };

    // ===================================================
    // END
    // ===================================================

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {
      try {
        recognition.stop();
      } catch (error) {
        // Recognition already stopped
      }

      recognitionRef.current = null;
    };

  }, [onTranscript]);


  // =====================================================
  // SPEAK QUESTION
  // =====================================================

  const speakQuestion = () => {

    if (!question) {
      return;
    }

    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      console.error(
        "Speech synthesis is not supported."
      );

      return;
    }

    // Stop current speech
    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(
        question
      );

    speech.lang = "en-US";
    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.speak(
      speech
    );
  };


  // =====================================================
  // START RECORDING
  // =====================================================

  const startListening = () => {

    const recognition =
      recognitionRef.current;

    if (!recognition) {
      console.error(
        "Speech recognition is not available."
      );

      return;
    }

    // Stop question speech
    if (
      window.speechSynthesis
    ) {
      window.speechSynthesis.cancel();
    }

    // Clear previous transcript
    setTranscript("");

    if (typeof onTranscript === "function") {
      onTranscript("");
    }

    try {

      recognition.start();

    } catch (error) {

      console.log(
        "Recognition already running."
      );

    }
  };


  // =====================================================
  // STOP RECORDING
  // =====================================================

  const stopListening = () => {

    const recognition =
      recognitionRef.current;

    if (!recognition) {
      return;
    }

    try {
      recognition.stop();
    } catch (error) {
      console.log(
        "Recognition already stopped."
      );
    }

    setIsListening(false);
  };


  // =====================================================
  // CLEAR TRANSCRIPT
  // =====================================================

  const clearTranscript = () => {

    setTranscript("");

    if (typeof onTranscript === "function") {
      onTranscript("");
    }
  };


  // =====================================================
  // UNSUPPORTED BROWSER
  // =====================================================

  if (!supported) {

    return (
      <div
        style={{
          marginTop: "20px",
          padding: "14px",
          borderRadius: "10px",
          background: "#fff7ed",
          color: "#9a3412",
          fontSize: "13px",
        }}
      >
        Voice input is not supported in this
        browser. Please use Google Chrome.
      </div>
    );
  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        marginTop: "24px",
        padding: "20px",
        borderRadius: "14px",
        border: "1px solid #e4e7f0",
        background: "#fafbff",
      }}
    >

      {/* =================================================
          QUESTION VOICE
          ================================================= */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "18px",
        }}
      >

        <button
          type="button"
          onClick={speakQuestion}
          disabled={
            disabled || !question
          }
          style={{
            padding: "10px 16px",
            borderRadius: "9px",
            border: "1px solid #dfe3f0",
            background: "#ffffff",
            color: "#4f5bd5",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🔊 Replay Question
        </button>

      </div>


      {/* =================================================
          RECORDING CONTROLS
          ================================================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >

        {!isListening ? (

          <button
            type="button"
            onClick={startListening}
            disabled={disabled}
            style={{
              padding: "11px 18px",
              borderRadius: "9px",
              border: "none",
              background: "#5965d8",
              color: "#ffffff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🎙 Start Recording
          </button>

        ) : (

          <button
            type="button"
            onClick={stopListening}
            style={{
              padding: "11px 18px",
              borderRadius: "9px",
              border: "none",
              background: "#dc4c4c",
              color: "#ffffff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🛑 Stop Recording
          </button>

        )}


        {isListening && (

          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              color: "#dc4c4c",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <span>●</span>

            Recording...

          </span>

        )}

      </div>


      {/* =================================================
          TRANSCRIPT
          ================================================= */}

      <div
        style={{
          marginTop: "18px",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >

          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#4b556b",
            }}
          >
            Your Spoken Answer
          </span>


          {transcript && (

            <button
              type="button"
              onClick={clearTranscript}
              style={{
                border: "none",
                background: "transparent",
                color: "#737b8e",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Clear
            </button>

          )}

        </div>


        <div
          style={{
            minHeight: "90px",
            padding: "13px",
            borderRadius: "10px",
            border: "1px solid #dfe3f0",
            background: "#ffffff",
            color:
              transcript
                ? "#27314a"
                : "#9aa1b2",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >

          {transcript ||
            "Your spoken answer will appear here..."}

        </div>

      </div>

    </div>
  );
}

export default VoiceControls;