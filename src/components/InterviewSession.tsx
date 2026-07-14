import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, Loader2, ChevronRight, AlertCircle, Volume2, VolumeX, Square, Sparkles, BrainCircuit, ArrowLeft, Timer, Lightbulb, Info } from 'lucide-react';
import { Domain, InterviewQuestion, InterviewerPersona } from '../types';
import { generateNextQuestion, evaluateResponse } from '../services/geminiService';
import { cn } from '../lib/utils';

interface InterviewSessionProps {
  domain: Domain;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  persona: InterviewerPersona;
  resumeOrJD?: string;
  onComplete: (questions: InterviewQuestion[]) => void;
  onCancel: () => void;
}

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TOTAL_QUESTIONS = 10;

interface VoiceWaveVisualizerProps {
  isListening: boolean;
}

const VoiceWaveVisualizer: React.FC<VoiceWaveVisualizerProps> = ({ isListening }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isListening) {
      cleanup();
      drawIdle();
      return;
    }

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        drawWave();
      } catch (err) {
        console.warn("Audio Context init failed, falling back to simulated visualizer", err);
        drawSimulatedWave();
      }
    };

    initAudio();

    return () => {
      cleanup();
    };
  }, [isListening]);

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (e) {}
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const drawIdle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw an elegant idle line
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.2)'; // semi-transparent orange
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  const drawWave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    if (!ctx || !analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!isListening) return;
      animationRef.current = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#151619';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gradient for line
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#f97316'); // orange-500
      gradient.addColorStop(0.5, '#ef4444'); // red-500
      gradient.addColorStop(1, '#ec4899'); // pink-500

      ctx.lineWidth = 3;
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw dynamic pulsing elements
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += Math.abs(dataArray[i] - 128);
      }
      const volume = sum / bufferLength;
      const glowOpacity = Math.min(volume / 10, 0.4);
      canvas.style.boxShadow = `0 0 ${volume * 1.5}px rgba(249, 115, 22, ${glowOpacity})`;
    };

    render();
  };

  const drawSimulatedWave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      if (!isListening) return;
      animationRef.current = requestAnimationFrame(render);
      phase += 0.15;

      ctx.fillStyle = '#151619';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#f97316');
      gradient.addColorStop(0.5, '#ef4444');
      gradient.addColorStop(1, '#ec4899');

      ctx.lineWidth = 3;
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      for (let x = 0; x < canvas.width; x++) {
        const amplitude = 12 * Math.sin(phase * 0.5) * Math.sin(x * 0.02);
        const y = canvas.height / 2 + amplitude * Math.sin(x * 0.05 + phase) + (3 * Math.random() - 1.5);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    };

    render();
  };

  return (
    <div className="relative w-full h-12 bg-[#151619] border border-white/10 rounded-xl overflow-hidden mt-2">
      <canvas 
        ref={canvasRef} 
        width="600" 
        height="48" 
        className="w-full h-full transition-all duration-300"
      />
    </div>
  );
};

export const InterviewSession: React.FC<InterviewSessionProps> = ({ domain, difficulty, persona, resumeOrJD, onComplete, onCancel }) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<{ score: number; feedback: string; correctAnswer?: string; pronunciationFeedback?: string; conceptExplanation?: string; keyDifferences?: string } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const [showHint, setShowHint] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isMounted = useRef(true);

  // Spoken assessment & speech analytics states
  const [speechDuration, setSpeechDuration] = useState(0);
  const [speechWpm, setSpeechWpm] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);
  const [fillersUsed, setFillersUsed] = useState<Record<string, number>>({});
  const [hasUsedMic, setHasUsedMic] = useState(false);
  const speechStartTimeRef = useRef<number | null>(null);

  // Helper to calculate speaking metrics
  const calculateMetrics = (text: string, durationSecs: number) => {
    const cleanTranscript = text.trim();
    if (!cleanTranscript) return { wpm: 0, fillerCount: 0, fillersUsed: {} as Record<string, number> };
    
    const words = cleanTranscript.split(/\s+/);
    const wordCount = words.length;
    
    // WPM calculation with sensible threshold (min 1.5s to avoid division outliers)
    const minutes = Math.max(durationSecs, 1.5) / 60;
    const wpm = Math.round(wordCount / minutes);
    
    // Target common filler words to check linguistic clarity
    const targets = ['um', 'uh', 'like', 'basically', 'actually', 'you know', 'sort of', 'kind of', 'right', 'so'];
    const used: Record<string, number> = {};
    let count = 0;
    
    words.forEach(word => {
      const norm = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      if (norm === 'you' || norm === 'know' || norm === 'sort' || norm === 'of' || norm === 'kind') {
        // Handled via phrase matching below, but skip isolated matches if desired
      }
      if (targets.includes(norm)) {
        used[norm] = (used[norm] || 0) + 1;
        count++;
      }
    });

    // Phrase-based fillers
    const phraseFillers = ["you know", "sort of", "kind of"];
    phraseFillers.forEach(phrase => {
      const rx = new RegExp(`\\b${phrase}\\b`, 'gi');
      const matches = cleanTranscript.match(rx);
      if (matches) {
        used[phrase] = matches.length;
        count += matches.length;
      }
    });

    return { wpm, fillerCount: count, fillersUsed: used };
  };

  // Run a real-time speech timer interval to track vocal response length
  useEffect(() => {
    let interval: any = null;
    if (isListening) {
      interval = setInterval(() => {
        setSpeechDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  // Recalculate speech metrics in perfect reactive synchrony
  useEffect(() => {
    if (hasUsedMic && userInput) {
      const stats = calculateMetrics(userInput, speechDuration);
      setSpeechWpm(stats.wpm);
      setFillerCount(stats.fillerCount);
      setFillersUsed(stats.fillersUsed);
    }
  }, [userInput, speechDuration, hasUsedMic]);

  useEffect(() => {
    isMounted.current = true;
    startInterview();
    return () => {
      isMounted.current = false;
      stopSpeaking();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (currentIndex >= 0 && !showFeedback && !isLoading) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentIndex, showFeedback, isLoading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const firstQData = await generateNextQuestion(domain, [], 50, resumeOrJD, difficulty, persona);
      if (!isMounted.current) return;
      setQuestions([{ 
        id: '1', 
        text: firstQData.text, 
        isCodeSnippet: firstQData.isCodeSnippet,
        options: firstQData.options,
        hint: firstQData.hint
      }]);
      setCurrentIndex(0);
      setTimeLeft(120);
      setIsLoading(false);
      speak(firstQData.text);
    } catch (error) {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if (!isVoiceEnabled) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || 
                          voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleListening = () => {
    if (isListening) {
      if (speechStartTimeRef.current) {
        const elapsed = (Date.now() - speechStartTimeRef.current) / 1000;
        setSpeechDuration(prev => prev + elapsed);
        speechStartTimeRef.current = null;
      }
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // Stop AI speaking if user starts talking
      stopSpeaking();
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition not supported in this browser.");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setUserInput(transcript);
      };
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      setHasUsedMic(true);
      speechStartTimeRef.current = Date.now();
    }
  };

  const handleOptionSelect = (option: string) => {
    setUserInput(option);
  };

  const handleSubmit = async () => {
    if (!userInput.trim() || isLoading) return;

    // Ensure speech recognition is stopped before submission
    if (isListening) {
      if (speechStartTimeRef.current) {
        const elapsed = (Date.now() - speechStartTimeRef.current) / 1000;
        setSpeechDuration(prev => prev + elapsed);
        speechStartTimeRef.current = null;
      }
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setIsLoading(true);
    try {
      const currentQ = questions[currentIndex];
      
      const finalMetrics = hasUsedMic ? {
        wpm: speechWpm,
        fillerCount: fillerCount,
        fillersUsed: fillersUsed,
        durationSeconds: Math.max(1, Math.round(speechDuration))
      } : undefined;

      const evaluation = await evaluateResponse(currentQ.text, userInput, domain, persona, finalMetrics);
      if (!isMounted.current) return;
      
      setLastFeedback(evaluation);
      setShowFeedback(true);
      
      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex] = {
        ...currentQ,
        userResponse: userInput,
        aiEvaluation: evaluation.feedback,
        score: evaluation.score,
        correctAnswer: evaluation.correctAnswer,
        pronunciationFeedback: evaluation.pronunciationFeedback,
        conceptExplanation: evaluation.conceptExplanation,
        keyDifferences: evaluation.keyDifferences,
        speakingMetrics: finalMetrics ? {
          wpm: finalMetrics.wpm,
          fillerCount: finalMetrics.fillerCount,
          durationSeconds: finalMetrics.durationSeconds
        } : undefined
      };
      setQuestions(updatedQuestions);
      setIsLoading(false);

      // Speak feedback
      if (isVoiceEnabled) {
        const feedbackText = `${evaluation.feedback}. ${evaluation.correctAnswer ? `Tip: ${evaluation.correctAnswer}` : ''}`;
        speak(feedbackText);
      }
    } catch (error) {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      if (currentIndex < TOTAL_QUESTIONS - 1) {
        const nextQData = await generateNextQuestion(domain, questions, lastFeedback?.score || 50, resumeOrJD, difficulty, persona);
        if (!isMounted.current) return;
        
        const nextQuestion: InterviewQuestion = { 
          id: String(currentIndex + 2), 
          text: nextQData.text, 
          isCodeSnippet: nextQData.isCodeSnippet,
          options: nextQData.options,
          hint: nextQData.hint
        };
        
        setQuestions([...questions, nextQuestion]);
        setCurrentIndex(currentIndex + 1);
        setTimeLeft(120);
        setShowHint(false);
        setUserInput('');
        setLastFeedback(null);
        setShowFeedback(false);
        setIsLoading(false);

        // Reset speaking analytics states for the new question
        setSpeechDuration(0);
        setSpeechWpm(0);
        setFillerCount(0);
        setFillersUsed({});
        setHasUsedMic(false);
        speechStartTimeRef.current = null;

        speak(nextQData.text);
      } else {
        onComplete(questions);
      }
    } catch (error) {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const getLanguageFromDomain = (domain: Domain) => {
    if (domain.includes('Python')) return 'python';
    if (domain.includes('Java')) return 'java';
    if (domain.includes('C++')) return 'cpp';
    if (domain.includes('C ')) return 'c';
    return 'javascript';
  };

  const renderQuestionText = (text: string, isCode: boolean) => {
    if (!isCode) return <h3 className="text-3xl font-medium leading-tight">{text}</h3>;
    
    // Split text by code block if present
    const parts = text.split('```');
    if (parts.length === 1) {
      return (
        <div className="rounded-lg overflow-hidden text-sm w-full">
          <SyntaxHighlighter language={getLanguageFromDomain(domain)} style={vscDarkPlus}>
            {text.trim()}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <div className="space-y-4 w-full">
        {parts.map((part, i) => (
          i % 2 === 0 ? (
            <p key={i} className="text-xl">{part}</p>
          ) : (
            <div key={i} className="rounded-lg overflow-hidden text-sm">
              <SyntaxHighlighter language={getLanguageFromDomain(domain)} style={vscDarkPlus}>
                {part.trim()}
              </SyntaxHighlighter>
            </div>
          )
        ))}
      </div>
    );
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-white/10 flex justify-between items-center bg-[#151619]">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all mr-2"
            title="Exit Interview"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-xl font-semibold tracking-tight uppercase">{domain} Interview ({persona})</h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <button 
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
              isVoiceEnabled ? "bg-orange-500/10 text-orange-500" : "bg-white/5 text-gray-500"
            )}
            title={isVoiceEnabled ? "Disable Voice Mode" : "Enable Voice Mode"}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isVoiceEnabled ? "Voice On" : "Voice Off"}</span>
          </button>
          <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block" />
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5",
            timeLeft < 30 ? "text-red-500 animate-pulse" : "text-gray-400"
          )}>
            <Timer className="w-4 h-4" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
          <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block" />
          Question {currentIndex + 1} of {TOTAL_QUESTIONS}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
          className="h-full bg-gradient-to-r from-orange-500 to-red-500"
        />
      </div>

      <main className="flex-1 flex flex-col items-center p-6 gap-6 overflow-hidden">
        {/* Interview Content */}
        <div className="w-full max-w-4xl flex flex-col gap-6 h-full">
          <div className="flex-1 bg-[#151619] rounded-2xl p-8 border border-white/10 flex flex-col justify-center relative overflow-y-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
            
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="flex flex-col items-center gap-6 text-center"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full"
                    />
                    <BrainCircuit className="w-16 h-16 text-orange-500 relative z-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-medium text-white">AI is processing...</p>
                    <p className="text-sm text-gray-500 font-mono uppercase tracking-widest">
                      {currentIndex === -1 ? "Preparing your interview" : "Evaluating your response"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                        className="w-2 h-2 bg-orange-500 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <span className="text-orange-500 font-mono text-sm tracking-widest uppercase">Interviewer</span>
                  <div className="flex items-start justify-between gap-4">
                    {renderQuestionText(currentQuestion?.text || '', !!currentQuestion?.isCodeSnippet)}
                    <div className="flex flex-col gap-2">
                      {isSpeaking && (
                        <button 
                          onClick={stopSpeaking}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all flex-shrink-0"
                          title="Stop Speaking"
                        >
                          <Square className="w-4 h-4 fill-current" />
                        </button>
                      )}
                      {!showFeedback && currentQuestion?.hint && (
                        <button 
                          onClick={() => setShowHint(!showHint)}
                          className={cn(
                            "p-2 rounded-full transition-all flex-shrink-0",
                            showHint ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400 hover:text-white"
                          )}
                          title="Get Hint"
                        >
                          <Lightbulb className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {showHint && currentQuestion?.hint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3"
                      >
                        <Info className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                        <p className="text-sm text-orange-200 italic">Hint: {currentQuestion.hint}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {showFeedback && lastFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "mt-6 p-6 rounded-2xl border flex flex-col gap-4",
                        lastFeedback.score >= 80 ? "bg-green-500/5 border-green-500/20" : 
                        lastFeedback.score >= 40 ? "bg-yellow-500/5 border-yellow-500/20" : 
                        "bg-red-500/5 border-red-500/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {lastFeedback.score >= 80 ? (
                            <div className="flex items-center gap-2 text-green-500">
                              <Sparkles className="w-5 h-5" />
                              <span className="font-bold uppercase tracking-wider text-xs">Excellent Response</span>
                            </div>
                          ) : lastFeedback.score >= 40 ? (
                            <div className="flex items-center gap-2 text-yellow-500">
                              <AlertCircle className="w-5 h-5" />
                              <span className="font-bold uppercase tracking-wider text-xs">Partial Credit</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-500">
                              <AlertCircle className="w-5 h-5" />
                              <span className="font-bold uppercase tracking-wider text-xs">Needs Improvement</span>
                            </div>
                          )}
                        </div>
                        <div className="text-2xl font-black">{lastFeedback.score}%</div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-gray-300 text-sm leading-relaxed">{lastFeedback.feedback}</p>

                        {hasUsedMic && (
                          <div className="grid grid-cols-3 gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                            <div>
                              <p className="text-[9px] font-black uppercase text-gray-500 text-left">Real-Time Pace</p>
                              <p className="text-sm font-extrabold text-white text-left">{speechWpm} <span className="text-[10px] text-gray-400 font-medium">WPM</span></p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase text-gray-500 text-left">Linguistic Fillers</p>
                              <p className="text-sm font-extrabold text-white text-left">{fillerCount} <span className="text-[10px] text-gray-400 font-medium">uses</span></p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase text-gray-500 text-left">Speech Clarity</p>
                              <p className="text-sm font-extrabold text-orange-400 text-left">
                                {speechWpm === 0 ? "0%" : `${Math.max(10, Math.min(100, Math.round(100 - (fillerCount * 12) - (speechWpm > 165 ? (speechWpm - 165) * 0.4 : 0))))}%`}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {lastFeedback.pronunciationFeedback && (
                          <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                            <p className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mb-1">Articulation & Clarity</p>
                            <p className="text-gray-400 text-xs italic">{lastFeedback.pronunciationFeedback}</p>
                          </div>
                        )}

                        {lastFeedback.correctAnswer && (
                          <div className="mt-4 pt-4 border-t border-white/5">
                            <p className="text-orange-500 font-bold text-[10px] uppercase tracking-widest mb-1">Expert Insight / Correct Answer</p>
                            <p className="text-gray-400 text-sm italic">{lastFeedback.correctAnswer}</p>
                          </div>
                        )}

                        {/* Side-by-Side Comparison */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-2">Your Response</p>
                            <p className="text-gray-300 text-sm italic">"{userInput}"</p>
                          </div>
                          <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                            <p className="text-orange-500 font-bold text-[10px] uppercase tracking-widest mb-2">Ideal Response</p>
                            <p className="text-gray-300 text-sm italic">"{lastFeedback.correctAnswer || "The response you provided was accurate."}"</p>
                          </div>
                        </div>

                        {lastFeedback.keyDifferences && (
                          <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                            <p className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mb-2">Key Differences & Highlights</p>
                            <div className="text-gray-400 text-sm leading-relaxed prose prose-invert max-w-none">
                              {lastFeedback.keyDifferences.split('\n').map((line, i) => (
                                <p key={i} className="mb-1">{line}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        {lastFeedback.conceptExplanation && (
                          <div className="mt-4 p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                            <p className="text-purple-400 font-bold text-[10px] uppercase tracking-widest mb-1">Conceptual Breakdown</p>
                            <p className="text-gray-400 text-sm leading-relaxed">{lastFeedback.conceptExplanation}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-4">
            {currentQuestion?.options ? (
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => !showFeedback && handleOptionSelect(option)}
                    disabled={showFeedback}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all relative overflow-hidden group",
                      userInput === option 
                        ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" 
                        : "bg-[#151619] border-white/10 hover:border-orange-500/50",
                      showFeedback && "cursor-default opacity-80"
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <span className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors",
                        userInput === option ? "bg-white/20" : "bg-white/5 text-gray-500"
                      )}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="font-medium">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="relative group">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={showFeedback}
                  placeholder={showFeedback ? "Response locked for evaluation" : "Type your response or use the microphone..."}
                  className={cn(
                    "w-full bg-[#151619] border rounded-2xl p-6 pr-16 min-h-[150px] focus:outline-none transition-all resize-none text-lg",
                    isListening ? "border-red-500/50 ring-4 ring-red-500/10" : "border-white/10 focus:border-orange-500/50",
                    showFeedback && "opacity-50 cursor-not-allowed"
                  )}
                />
                <div className="absolute bottom-6 right-6 flex items-center gap-3">
                  {isListening && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Listening</span>
                    </div>
                  )}
                  <button
                    onClick={toggleListening}
                    disabled={showFeedback}
                    className={cn(
                      "p-3 rounded-xl transition-all relative",
                      isListening ? "bg-red-500 text-white shadow-lg shadow-red-500/40" : "bg-white/10 text-gray-400 hover:bg-white/20",
                      showFeedback && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isListening && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 bg-red-500 rounded-xl"
                      />
                    )}
                    {isListening ? <Mic className="w-5 h-5 relative z-10" /> : <MicOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Live Verbal Analytics telemetry */}
            {hasUsedMic && !showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-white/[0.01] border border-white/10 rounded-2xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-orange-500 tracking-[0.2em] flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5" /> Spoken Analytics Monitor
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                      <Timer className="w-3 h-3 text-orange-500" />
                      <span>Duration: {Math.round(speechDuration)}s</span>
                    </div>
                    <span className="text-gray-700">|</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase font-mono">
                      Oral Assessment
                    </span>
                  </div>
                </div>

                <VoiceWaveVisualizer isListening={isListening} />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* WPM Pacing Gauge */}
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Speaking Pace</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-extrabold text-white">{speechWpm}</span>
                      <span className="text-[9px] text-gray-500 uppercase font-bold">WPM</span>
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase mt-1",
                      speechWpm === 0 ? "text-gray-500" :
                      speechWpm < 90 ? "text-blue-400" :
                      speechWpm <= 150 ? "text-emerald-400" : "text-amber-500"
                    )}>
                      {speechWpm === 0 ? "Silent" :
                       speechWpm < 90 ? "• Deliberate" :
                       speechWpm <= 150 ? "• Optimal Pace" : "• Fast Tempo"}
                    </span>
                  </div>

                  {/* Filler words Counter */}
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Filler Words Tracker</span>
                    <span className="text-xl font-extrabold text-white mt-1">{fillerCount}</span>
                    <span className={cn(
                      "text-[9px] font-black uppercase mt-1",
                      fillerCount === 0 ? "text-emerald-400" :
                      fillerCount <= 3 ? "text-yellow-400" : "text-red-400"
                    )}>
                      {fillerCount === 0 ? "• Highly Fluent" :
                       fillerCount <= 3 ? "• Standard Usage" : "• High Density"}
                    </span>
                  </div>

                  {/* Vocabulary focus (Dynamic lexical richness indicator) */}
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-between col-span-2 sm:col-span-1">
                    <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Speech Clarity Index</span>
                    <span className="text-xl font-extrabold text-white mt-1">
                      {speechWpm === 0 ? "0%" : `${Math.max(10, Math.min(100, Math.round(100 - (fillerCount * 12) - (speechWpm > 165 ? (speechWpm - 165) * 0.4 : 0))))}%`}
                    </span>
                    <span className="text-[9px] text-gray-500 tracking-normal leading-tight font-medium mt-1 uppercase">Clarity Index rating</span>
                  </div>
                </div>

                {/* Heatmap of filler words */}
                {Object.keys(fillersUsed).length > 0 && (
                  <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                    <span className="text-[8px] font-black uppercase tracking-wider text-gray-500">Frequency distribution of verbal pauses</span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(fillersUsed).map(([word, num]) => (
                        <div key={word} className="flex items-center gap-1.5 px-2 py-1 rounded bg-orange-500/5 border border-orange-500/10 text-[9px]">
                          <span className="font-bold text-gray-400">{word}</span>
                          <span className="font-black text-orange-400 px-1 py-[1px] bg-orange-500/10 rounded">{num}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {showFeedback ? (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {currentIndex < TOTAL_QUESTIONS - 1 ? "Next Question" : "Finish Interview"} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!userInput.trim() || isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Submit Response <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
