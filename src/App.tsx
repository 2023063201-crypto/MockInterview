import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
import { LandingPage } from './components/LandingPage';
import { InterviewSession } from './components/InterviewSession';
import { FeedbackDashboard } from './components/FeedbackDashboard';
import { Dashboard } from './components/Dashboard';
import { Domain, InterviewQuestion, InterviewerPersona } from './types';
import { LogIn, LogOut, LayoutDashboard, User as UserIcon, Play, Mail, X, Loader2, Eye, EyeOff, Download } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'session' | 'feedback' | 'dashboard'>('landing');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [persona, setPersona] = useState<InterviewerPersona>('Friendly');
  const [resumeOrJD, setResumeOrJD] = useState<string>('');
  const [interviewResults, setInterviewResults] = useState<InterviewQuestion[]>([]);
  const [pastInterviews, setPastInterviews] = useState<any[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Email Auth State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch past interviews
        const q = query(
          collection(db, 'interviews'),
          where('uid', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        onSnapshot(q, (snapshot) => {
          setPastInterviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, 'interviews');
        });
      }
    });

    // Handle redirect result for mobile
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect sign-in error:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    try {
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
      setShowAuthModal(false);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Authentication error:", error);
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleStart = (domain: Domain, jd?: string, diff: 'Easy' | 'Medium' | 'Hard' = 'Medium', selectedPersona: InterviewerPersona = 'Friendly') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedDomain(domain);
    setDifficulty(diff);
    setPersona(selectedPersona);
    if (jd) setResumeOrJD(jd);
    setView('session');
  };

  const handleComplete = async (questions: InterviewQuestion[]) => {
    setInterviewResults(questions);
    setView('feedback');

    if (user) {
      try {
        await addDoc(collection(db, 'interviews'), {
          uid: user.uid,
          domain: selectedDomain,
          questions: questions,
          feedback: {
            overallScore: Math.round(questions.reduce((acc, q) => acc + (q.score || 0), 0) / questions.length),
          },
          status: 'completed',
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'interviews');
      }
    }
  };

  const handleRestart = () => {
    setView('landing');
    setSelectedDomain(null);
    setInterviewResults([]);
    setResumeOrJD('');
  };

  const onViewInterview = (interview: any) => {
    setSelectedDomain(interview.domain);
    setInterviewResults(interview.questions);
    setView('feedback');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation Bar */}
      <nav className="p-4 border-b border-white/10 flex justify-between items-center bg-[#151619]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleRestart}>
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-black text-white">AI</div>
          <span className="font-bold tracking-tighter text-lg sm:text-xl">MOCK INTERVIEW</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Links */}
          <div className="hidden sm:flex items-center gap-4">
            <button 
              onClick={handleRestart}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
            >
              Home
            </button>
            {user && (
              <button 
                onClick={() => setView('dashboard')}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
            )}
          </div>

          {user ? (
            <div className="relative">
              {/* Profile Trigger (Mobile & Desktop) */}
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10 hover:border-orange-500/50 transition-all"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div 
                  onMouseLeave={() => setShowProfileMenu(false)}
                  onDoubleClick={() => setShowProfileMenu(false)}
                  className="absolute right-0 mt-2 w-64 bg-[#151619] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div 
                    className="fixed inset-0 z-[-1]" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  
                  {/* User Details Section */}
                  <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3 mb-2">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-lg font-bold">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-white truncate">
                          {user.displayName || 'User'}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <button 
                      onClick={() => {
                        handleRestart();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Play className="w-4 h-4" /> Home
                    </button>
                    <button 
                      onClick={() => {
                        setView('dashboard');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                  </div>

                  <div className="h-px bg-white/5 my-1" />
                  
                  <div className="py-1">
                    <button 
                      onClick={() => {
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          )}

          {/* Desktop Logout Button */}
          {user && (
            <button 
              onClick={handleLogout} 
              className="hidden sm:flex p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-500 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151619] border border-white/10 rounded-3xl w-full max-w-md p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-bold mb-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="text-gray-400 mb-8">Sign in to save your interview progress and history.</p>

            <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-gray-600 text-xs uppercase font-mono">or email</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <p className="text-red-500 text-xs italic">{authError}</p>
                )}

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-orange-500 font-bold hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      <main>
        {view === 'landing' && <LandingPage onStart={handleStart} user={user} />}
        {view === 'session' && selectedDomain && (
          <InterviewSession 
            domain={selectedDomain} 
            difficulty={difficulty}
            persona={persona}
            resumeOrJD={resumeOrJD}
            onComplete={handleComplete} 
            onCancel={handleRestart}
          />
        )}
        {view === 'feedback' && selectedDomain && (
          <FeedbackDashboard 
            domain={selectedDomain} 
            questions={interviewResults} 
            onRestart={handleRestart} 
          />
        )}
        {view === 'dashboard' && (
          <Dashboard 
            interviews={pastInterviews} 
            onViewInterview={onViewInterview}
            onBack={handleRestart}
          />
        )}
      </main>
    </div>
  );
}
