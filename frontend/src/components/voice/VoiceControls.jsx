import { useEffect, useRef, useState } from "react";
import Button from "../common/Button";
import Icon from "../common/Icon";

function VoiceControls({
  question,
  onTranscript,
  disabled = false,
}) {
  // =====================================================
  // REFS
  // =====================================================

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const isRecognitionRunningRef = useRef(false);
  const restartTimeoutRef = useRef(null);
  const transcriptRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);

  // =====================================================
  // STATE
  // =====================================================

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);

  // =====================================================
  // KEEP LATEST CALLBACK
  // =====================================================

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // =====================================================
  // SPEECH RECOGNITION SETUP
  // =====================================================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("SpeechRecognition is not supported in this browser.");
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      isRecognitionRunningRef.current = true;
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        }
      }

      if (!finalText.trim()) return;

      const updatedTranscript = `${transcriptRef.current} ${finalText}`.trim();
      transcriptRef.current = updatedTranscript;
      setTranscript(updatedTranscript);

      if (typeof onTranscriptRef.current === "function") {
        setTimeout(() => {
          if (typeof onTranscriptRef.current === "function") {
            onTranscriptRef.current(updatedTranscript);
          }
        }, 0);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      isRecognitionRunningRef.current = false;

      if (
        event.error === "no-speech" ||
        event.error === "network" ||
        event.error === "aborted"
      ) {
        return;
      }

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed" ||
        event.error === "audio-capture"
      ) {
        console.error("Microphone issue:", event.error);
        shouldListenRef.current = false;
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      isRecognitionRunningRef.current = false;

      if (shouldListenRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (!shouldListenRef.current || isRecognitionRunningRef.current) return;
          try {
            recognition.start();
          } catch {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = setTimeout(() => {
              if (shouldListenRef.current && !isRecognitionRunningRef.current) {
                try {
                  recognition.start();
                } catch {}
              }
            }, 1000);
          }
        }, 700);
      } else {
        setIsListening(false);
      }
    };

    return () => {
      shouldListenRef.current = false;
      clearTimeout(restartTimeoutRef.current);
      try {
        recognition.stop();
      } catch {}
      recognitionRef.current = null;
      isRecognitionRunningRef.current = false;
    };
  }, []);

  // =====================================================
  // SPEAK QUESTION
  // =====================================================

  const speakQuestion = () => {
    if (!question) return;
    if (!window.speechSynthesis) {
      console.error("Speech synthesis is not supported.");
      return;
    }

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(question);
    speech.lang = "en-US";
    speech.rate = 0.95;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  // =====================================================
  // START LISTENING
  // =====================================================

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      console.error("Speech recognition is not available.");
      return;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    shouldListenRef.current = true;
    transcriptRef.current = "";
    setTranscript("");

    if (typeof onTranscriptRef.current === "function") {
      onTranscriptRef.current("");
    }

    if (isRecognitionRunningRef.current) {
      setIsListening(true);
      return;
    }

    try {
      recognition.start();
    } catch {
      setIsListening(true);
    }
  };

  // =====================================================
  // STOP LISTENING
  // =====================================================

  const stopListening = () => {
    const recognition = recognitionRef.current;
    shouldListenRef.current = false;
    clearTimeout(restartTimeoutRef.current);

    if (!recognition) {
      setIsListening(false);
      return;
    }

    try {
      recognition.stop();
    } catch {}
    isRecognitionRunningRef.current = false;
    setIsListening(false);
  };

  // =====================================================
  // CLEAR TRANSCRIPT
  // =====================================================

  const clearTranscript = () => {
    transcriptRef.current = "";
    setTranscript("");
    if (typeof onTranscriptRef.current === "function") {
      onTranscriptRef.current("");
    }
  };

  // =====================================================
  // UNSUPPORTED BROWSER
  // =====================================================

  if (!supported) {
    return (
      <div className="voice-unsupported">
        Speech recognition is not supported in this browser. Please use Google
        Chrome or Microsoft Edge.
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="voice-panel">
      <div className="voice-row">
        <Button variant="secondary" onClick={speakQuestion} disabled={disabled || !question}>
          <Icon name="volume" size={17} />
          Replay Question
        </Button>

        {!isListening ? (
          <Button variant="primary" onClick={startListening} disabled={disabled}>
            <Icon name="mic" size={17} />
            Start Recording
          </Button>
        ) : (
          <Button variant="danger" onClick={stopListening}>
            <Icon name="stop" size={17} />
            Stop Recording
          </Button>
        )}

        {isListening && (
          <span className="voice-recording">
            <span className="rec-dot" />
            Recording…
          </span>
        )}
      </div>

      <div className="voice-transcript">
        <div className="voice-transcript-head">
          <span>Your Spoken Answer</span>
          {transcript && (
            <button type="button" onClick={clearTranscript}>
              Clear
            </button>
          )}
        </div>

        <div className={`voice-transcript-box${!transcript ? " voice-transcript-box--empty" : ""}`}>
          {transcript || "Your spoken answer will appear here…"}
        </div>
      </div>
    </div>
  );
}

export default VoiceControls;