import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Target, Award, Zap, CheckCircle2, ArrowRight, RefreshCcw, Volume2, VolumeX, Square, ArrowLeft } from 'lucide-react';
import { Domain, InterviewQuestion, InterviewFeedback } from '../types';
import { generateFinalFeedback } from '../services/geminiService';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

interface FeedbackDashboardProps {
  domain: Domain;
  questions: InterviewQuestion[];
  onRestart: () => void;
}

export const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({ domain, questions, onRestart }) => {
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadFeedback();
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const loadFeedback = async () => {
    const result = await generateFinalFeedback(domain, questions);
    setFeedback(result);
    setLoading(false);
    if (result.overallScore > 70) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#ef4444', '#ffffff']
      });
    }
  };

  const speakSummary = () => {
    if (!feedback) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const text = `Your overall score is ${feedback.overallScore} percent. ${feedback.summary}. Here are some suggestions for improvement: ${feedback.suggestions.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || 
                          voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="w-12 h-12 text-orange-500" />
        </motion.div>
        <p className="mt-4 text-gray-400 font-mono tracking-widest uppercase">Analyzing Performance...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div className="flex items-start gap-4">
            <button 
              onClick={onRestart}
              className="mt-2 p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all"
              title="Back to Home"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-5xl font-bold tracking-tighter mb-2">INTERVIEW REPORT</h1>
              <p className="text-gray-400 uppercase tracking-widest font-mono">{domain} • COMPLETED</p>
            </div>
          </div>
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          >
            <RefreshCcw className="w-4 h-4" /> New Interview
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl shadow-orange-500/20"
          >
            <Trophy className="w-16 h-16 mb-6 text-white/90" />
            <div className="text-8xl font-black mb-2">{feedback?.overallScore}</div>
            <div className="text-xl font-bold uppercase tracking-widest opacity-80">Overall Score</div>
            <div className="mt-8 w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${feedback?.overallScore}%` }}
                className="h-full bg-white"
              />
            </div>
          </motion.div>

          {/* Metrics Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Communication', score: feedback?.communicationScore, icon: <Zap className="w-5 h-5" /> },
              { label: 'Technical', score: feedback?.technicalScore, icon: <Target className="w-5 h-5" /> },
              { label: 'Confidence', score: feedback?.confidenceScore, icon: <Award className="w-5 h-5" /> },
            ].map((metric, idx) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#151619] border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4 text-orange-500">
                  {metric.icon}
                  <span className="text-sm font-bold uppercase tracking-wider">{metric.label}</span>
                </div>
                <div className="text-4xl font-bold mb-2">{metric.score}%</div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score}%` }}
                    className="h-full bg-orange-500"
                  />
                </div>
              </motion.div>
            ))}

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="md:col-span-3 bg-[#151619] border border-white/10 rounded-2xl p-8"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> Executive Summary
                <button 
                  onClick={speakSummary}
                  className={cn(
                    "ml-auto p-2 rounded-lg transition-all",
                    isSpeaking ? "bg-orange-500 text-white animate-pulse" : "bg-white/5 text-gray-400 hover:bg-white/10"
                  )}
                  title={isSpeaking ? "Stop Reading" : "Read Summary"}
                >
                  {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </h3>
              <p className="text-gray-400 leading-relaxed text-lg italic">
                "{feedback?.summary}"
              </p>
            </motion.div>
          </div>
        </div>

        {/* Suggestions & History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#151619] border border-white/10 rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold mb-6 uppercase tracking-widest text-orange-500">Improvement Plan</h3>
            <ul className="space-y-4">
              {feedback?.suggestions.map((suggestion, i) => (
                <li key={i} className="flex gap-4 items-start group">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-orange-500 shrink-0 group-hover:scale-150 transition-transform" />
                  <p className="text-gray-300 group-hover:text-white transition-colors">{suggestion}</p>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#151619] border border-white/10 rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold mb-6 uppercase tracking-widest text-orange-500">Question Breakdown</h3>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {questions.map((q, i) => (
                <div key={q.id} className="border-b border-white/5 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-gray-500">Q{i + 1}</span>
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded",
                      (q.score || 0) > 70 ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"
                    )}>
                      {q.score}%
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-2">{q.text}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 italic mb-2">"{q.userResponse}"</p>
                  
                  {q.speakingMetrics && (
                    <div className="mb-3 grid grid-cols-3 gap-2 p-2 bg-white/[0.02] border border-white/5 rounded-lg text-center font-mono">
                      <div>
                        <p className="text-[8px] uppercase font-black text-gray-500 text-left pl-1">Speech Pace</p>
                        <p className="text-[10px] font-bold text-gray-300 text-left pl-1">{q.speakingMetrics.wpm} <span className="text-[8px] text-gray-500 font-medium">WPM</span></p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase font-black text-gray-500 text-left pl-1">Verbal Fillers</p>
                        <p className="text-[10px] font-bold text-gray-300 text-left pl-1">{q.speakingMetrics.fillerCount} <span className="text-[8px] text-gray-500 font-medium">uses</span></p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase font-black text-gray-500 text-left pl-1">Duration</p>
                        <p className="text-[10px] font-bold text-gray-300 text-left pl-1">{q.speakingMetrics.durationSeconds}s</p>
                      </div>
                    </div>
                  )}

                  {q.pronunciationFeedback && (
                    <div className="mt-2 p-2 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Articulation & Clarity</p>
                      <p className="text-[10px] text-gray-400 italic">{q.pronunciationFeedback}</p>
                    </div>
                  )}
                  {q.conceptExplanation && (
                    <div className="mt-2 p-2 bg-purple-500/5 border border-purple-500/10 rounded-lg">
                      <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-1">Conceptual Breakdown</p>
                      <p className="text-[10px] text-gray-400 leading-relaxed">{q.conceptExplanation}</p>
                    </div>
                  )}
                  {q.keyDifferences && (
                    <div className="mt-2 p-2 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Key Differences</p>
                      <p className="text-[10px] text-gray-400 leading-relaxed">{q.keyDifferences}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
